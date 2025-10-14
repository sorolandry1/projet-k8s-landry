import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiAuth, resolveAssetUrl } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Plus, X, Upload, Clock, Users, ChefHat, Tag, Image as ImageIcon } from 'lucide-react'

interface Ingredient {
  name: string
  quantity: string
  unit: string
}

interface RecipeData {
  title: string
  description: string
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  difficulty: string
  category: string
  ingredients: Ingredient[]
  steps: string[]
  tags: string[]
}

const DIFFICULTY_OPTIONS = [
  { value: 'facile', label: 'Facile', color: 'bg-green-100 text-green-800' },
  { value: 'moyen', label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'difficile', label: 'Difficile', color: 'bg-red-100 text-red-800' }
]

const CATEGORY_OPTIONS = [
  { value: 'entrée', label: 'Entrée', icon: '🥗' },
  { value: 'plat', label: 'Plat principal', icon: '🍽️' },
  { value: 'dessert', label: 'Dessert', icon: '🍰' },
  { value: 'boisson', label: 'Boisson', icon: '🥤' }
]

export default function RecipeForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  
  const [formData, setFormData] = useState<RecipeData>({
    title: '',
    description: '',
    prep_time: null,
    cook_time: null,
    servings: null,
    difficulty: 'facile',
    category: 'plat',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [''],
    tags: []
  })

  const [newTag, setNewTag] = useState('')
  const [newStep, setNewStep] = useState('')

  // Charger les données si on édite
  React.useEffect(() => {
    if (isEditing && id && user?.token) {
      loadRecipe(parseInt(id))
    }
  }, [isEditing, id, user?.token, user?.id])

  const loadRecipe = async (recipeId: number) => {
    if (!user?.token) return

    try {
      const response = await apiAuth(user.token).get(`/recipes/${recipeId}`)
      const recipe = response.data

      if (user.id !== null && recipe.owner_id !== user.id) {
        alert('Vous ne pouvez modifier que vos propres recettes.')
        navigate(`/recipes/${recipeId}`)
        return
      }

      setFormData({
        title: recipe.title,
        description: recipe.description,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty || 'facile',
        category: recipe.category || 'plat',
        ingredients: recipe.ingredients || [{ name: '', quantity: '', unit: '' }],
        steps: recipe.steps || [''],
        tags: recipe.tags || []
      })
      if (recipe.images) {
        setPreviewImages(recipe.images.map(resolveAssetUrl))
      }
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.')
        logout()
        navigate('/login')
        return
      }
      if (status === 404) {
        alert('Recette introuvable.')
        navigate('/recipes')
        return
      }
      console.error('Erreur lors du chargement de la recette:', error)
      alert('Impossible de charger la recette pour le moment.')
    }
  }

  const handleInputChange = (field: keyof RecipeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Nettoyer les erreurs de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }))
  }

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const updateStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(files)
    
    // Créer des previews
    const previews = files.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...previews])
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (recipeId: number) => {
    if (selectedImages.length === 0) return
    if (!user?.token) {
      alert('Vous devez être connecté pour téléverser des images.')
      logout()
      return
    }

    setUploadingImages(true)
    try {
      const formData = new FormData()
      selectedImages.forEach(image => {
        formData.append('images', image)
      })
      
      await apiAuth(user.token).post(`/recipes/${recipeId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter pour téléverser des images.')
        logout()
        navigate('/login')
      } else if (status === 403) {
        alert('Vous ne pouvez pas modifier les images d\'une recette qui ne vous appartient pas.')
      } else {
        console.error('Erreur lors de l\'upload des images:', error)
        alert('Impossible de téléverser les images pour le moment.')
      }
    } finally {
      setUploadingImages(false)
    }
  }

  const validateForm = () => {
    const errors: string[] = []
    const fieldErrors: {[key: string]: string} = {}
    
    // Validation du titre
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      errors.push('Le titre doit contenir au moins 5 caractères')
      fieldErrors.title = 'Le titre doit contenir au moins 5 caractères'
    }
    
    // Validation de la description
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errors.push('La description doit contenir au moins 20 caractères')
      fieldErrors.description = 'La description doit contenir au moins 20 caractères'
    }
    
    // Validation des ingrédients
    const validIngredients = formData.ingredients.filter(ing => 
      ing.name.trim() && ing.quantity.trim() && ing.unit.trim()
    )
    if (validIngredients.length === 0) {
      errors.push('Au moins un ingrédient complet est requis')
      fieldErrors.ingredients = 'Au moins un ingrédient complet est requis'
    }
    
    // Validation des étapes
    const validSteps = formData.steps.filter(step => step.trim())
    if (validSteps.length === 0) {
      errors.push('Au moins une étape est requise')
      fieldErrors.steps = 'Au moins une étape est requise'
    }
    
    setValidationErrors(fieldErrors)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation côté client
    const errors = validateForm()
    if (errors.length > 0) {
      alert('Erreurs de validation:\n' + errors.join('\n'))
      return
    }
    
    if (!user?.token) {
      alert('Vous devez être connecté pour enregistrer une recette.')
      logout()
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      // Nettoyer les données
      const cleanData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        ingredients: formData.ingredients
          .filter(ing => ing.name.trim() && ing.quantity.trim() && ing.unit.trim())
          .map(ing => ({
            name: ing.name.trim(),
            quantity: ing.quantity.trim(),
            unit: ing.unit.trim()
          })),
        steps: formData.steps.filter(step => step.trim()).map(step => step.trim()),
        tags: formData.tags.filter(tag => tag.trim()).map(tag => tag.trim())
      }

      let recipeId: number
      if (isEditing && id) {
        // Mise à jour
        await apiAuth(user.token).put(`/recipes/${id}`, cleanData)
        recipeId = parseInt(id)
      } else {
        // Création
        const response = await apiAuth(user.token).post('/recipes', cleanData)
        recipeId = response.data.id
      }

      // Upload des images si il y en a
      if (selectedImages.length > 0) {
        await uploadImages(recipeId)
      }

      navigate(`/recipes/${recipeId}`)
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      
      const status = error.response?.status

      if (status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter pour continuer.')
        logout()
        navigate('/login')
        return
      }

      if (status === 403) {
        alert('Vous ne pouvez pas modifier cette recette car elle ne vous appartient pas.')
        navigate('/recipes')
        return
      }

      // Afficher les erreurs de validation du serveur
      if (status === 422) {
        const serverErrors = error.response.data?.detail || []
        if (Array.isArray(serverErrors)) {
          const errorMessages = serverErrors.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join('\n')
          alert('Erreurs de validation:\n' + errorMessages)
        } else {
          alert('Erreur de validation: ' + JSON.stringify(serverErrors))
        }
      } else {
        alert('Erreur lors de la sauvegarde: ' + (error.message || 'Erreur inconnue'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {isEditing ? 'Modifier la recette' : 'Nouvelle recette'}
                </h1>
                <p className="text-orange-100 mt-1">
                  {isEditing ? 'Améliorez votre recette' : 'Partagez votre création culinaire'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Informations de base */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  📝
                </div>
                Informations de base
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Titre de la recette *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      validationErrors.title 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-200'
                    }`}
                    placeholder="Ex: Tarte aux pommes de grand-mère"
                    required
                  />
                  {validationErrors.title && (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <span>⚠️</span>
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[100px] ${
                    validationErrors.description 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                  placeholder="Décrivez votre recette, son histoire, ses particularités..."
                  required
                />
                {validationErrors.description && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {validationErrors.description}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  {formData.description.length}/20 caractères minimum
                </p>
              </div>
            </div>

            {/* Détails de la recette */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                Détails de la recette
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Temps de préparation (min)</label>
                  <input
                    type="number"
                    value={formData.prep_time || ''}
                    onChange={(e) => handleInputChange('prep_time', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="30"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Temps de cuisson (min)</label>
                  <input
                    type="number"
                    value={formData.cook_time || ''}
                    onChange={(e) => handleInputChange('cook_time', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="45"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nombre de portions</label>
                  <input
                    type="number"
                    value={formData.servings || ''}
                    onChange={(e) => handleInputChange('servings', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="4"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Difficulté</label>
                <div className="flex gap-3">
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <button
                      key={diff.value}
                      type="button"
                      onClick={() => handleInputChange('difficulty', diff.value)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        formData.difficulty === diff.value
                          ? diff.color + ' ring-2 ring-orange-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingrédients */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    🥕
                  </div>
                  Ingrédients
                </h2>
                {validationErrors.ingredients && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {validationErrors.ingredients}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4">
                      <label className="text-sm font-semibold text-gray-700">Nom de l'ingrédient</label>
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Ex: Farine"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-semibold text-gray-700">Quantité</label>
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="250"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm font-semibold text-gray-700">Unité</label>
                      <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="g, ml, c.à.s..."
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="px-3 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="px-3 py-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Étapes de préparation */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    👨‍🍳
                  </div>
                  Étapes de préparation
                </h2>
                {validationErrors.steps && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <span>⚠️</span>
                    {validationErrors.steps}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[80px]"
                        placeholder="Décrivez cette étape en détail..."
                      />
                    </div>
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une étape
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-yellow-600" />
                </div>
                Tags
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Ajouter un tag (ex: français, végétarien, rapide...)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all"
                  >
                    Ajouter
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-pink-600" />
                </div>
                Images
              </h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Ajouter des images
                    </p>
                    <p className="text-gray-500">
                      Glissez-déposez vos images ou cliquez pour sélectionner
                    </p>
                  </label>
                </div>
                
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sauvegarde...' : uploadingImages ? 'Upload des images...' : (isEditing ? 'Mettre à jour' : 'Créer la recette')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
