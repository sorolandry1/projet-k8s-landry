import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiAuth, resolveAssetUrl } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { RecipeCard } from '../components/RecipeCard'
import { Plus, Edit, Trash2, Eye, Search, Filter, Grid, List } from 'lucide-react'

interface Recipe {
  id: number
  title: string
  description: string
  prep_time?: number
  cook_time?: number
  servings?: number
  difficulty?: string
  category?: string
  images?: string[]
  likes_count?: number
  comments_count?: number
  owner_id: number
  created_at: string
  updated_at: string
}

export default function MyRecipes() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const categories = ['entrée', 'plat', 'dessert', 'boisson']
  const difficulties = ['facile', 'moyen', 'difficile']

  useEffect(() => {
    if (!user?.token || user.id == null) {
      return
    }
    loadRecipes()
  }, [user?.token, user?.id])

  const loadRecipes = async () => {
    if (!user?.token || user.id == null) {
      alert('Vous devez être connecté pour consulter vos recettes.')
      logout()
      navigate('/login')
      return
    }
    try {
      setLoading(true)
      const response = await apiAuth(user.token).get<Recipe[]>('/recipes')
      const mine = response.data.filter(recipe => recipe.owner_id === user.id)
      setRecipes(mine)
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.')
        logout()
        navigate('/login')
      } else {
        console.error('Erreur lors du chargement des recettes:', error)
        alert('Impossible de charger vos recettes pour le moment.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (recipeId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return
    }

    try {
      setDeletingId(recipeId)
      if (!user?.token) {
        alert('Votre session a expiré. Veuillez vous reconnecter.')
        logout()
        navigate('/login')
        return
      }

      await apiAuth(user.token).delete(`/recipes/${recipeId}`)
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId))
    } catch (error) {
      const status = (error as any)?.response?.status
      if (status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.')
        logout()
        navigate('/login')
      } else if (status === 403) {
        alert('Vous ne pouvez pas supprimer une recette qui ne vous appartient pas.')
      } else {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression de la recette')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || recipe.category === categoryFilter
    const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de vos recettes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Recettes</h1>
              <p className="text-gray-600">
                Gérez et organisez vos créations culinaires
              </p>
            </div>
            <Link
              to="/recipes/new"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nouvelle recette
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍳</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                  <p className="text-gray-600 text-sm">Recettes totales</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {recipes.reduce((sum, recipe) => sum + (recipe.likes_count || 0), 0)}
                  </p>
                  <p className="text-gray-600 text-sm">Likes reçus</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {recipes.reduce((sum, recipe) => sum + (recipe.comments_count || 0), 0)}
                  </p>
                  <p className="text-gray-600 text-sm">Commentaires</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {recipes.reduce((sum, recipe) => sum + (recipe.images?.length || 0), 0)}
                  </p>
                  <p className="text-gray-600 text-sm">Images</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher dans vos recettes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="lg:w-48">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Toutes les difficultés</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'list' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recipes List */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🍳</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm || categoryFilter || difficultyFilter 
                ? 'Aucune recette trouvée' 
                : 'Aucune recette créée'
              }
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm || categoryFilter || difficultyFilter 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre première recette !'
              }
            </p>
            {!searchTerm && !categoryFilter && !difficultyFilter && (
              <Link
                to="/recipes/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Créer ma première recette
              </Link>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="group">
                {viewMode === 'grid' ? (
                  <div className="bg-white rounded-2xl shadow-soft hover:shadow-warm transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={
                          recipe.images?.[0]
                            ? resolveAssetUrl(recipe.images[0])
                            : 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop'
                        }
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {recipe.difficulty && (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
                            recipe.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                            recipe.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                          </span>
                        )}
                        {recipe.category && (
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md bg-white/80 text-gray-800">
                            {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {recipe.prep_time && (
                            <span>⏱️ {recipe.prep_time}min</span>
                          )}
                          {recipe.servings && (
                            <span>👥 {recipe.servings} pers.</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>❤️ {recipe.likes_count || 0}</span>
                          <span>💬 {recipe.comments_count || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/recipes/${recipe.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Link>
                        <Link
                          to={`/recipes/${recipe.id}/edit`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          disabled={deletingId === recipe.id}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                        >
                          {deletingId === recipe.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-soft p-6 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={
                          recipe.images?.[0]
                            ? resolveAssetUrl(recipe.images[0])
                            : 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop'
                        }
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {recipe.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          {recipe.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              recipe.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                              recipe.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {recipe.difficulty}
                            </span>
                          )}
                          {recipe.category && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                              {recipe.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {recipe.prep_time && <span>⏱️ {recipe.prep_time}min prep</span>}
                        {recipe.cook_time && <span>🔥 {recipe.cook_time}min cuisson</span>}
                        {recipe.servings && <span>👥 {recipe.servings} portions</span>}
                        <span>❤️ {recipe.likes_count || 0} likes</span>
                        <span>💬 {recipe.comments_count || 0} commentaires</span>
                        <span>📅 {formatDate(recipe.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        to={`/recipes/${recipe.id}`}
                        className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/recipes/${recipe.id}/edit`}
                        className="p-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        disabled={deletingId === recipe.id}
                        className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                      >
                        {deletingId === recipe.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
