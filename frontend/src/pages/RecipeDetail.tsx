import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { apiAuth, resolveAssetUrl } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { LikeButton } from '../components/LikeButton';
import { CommentSection } from '../components/CommentSection';
import { ImageGallery } from '../components/ImageGallery';

type Recipe = {
  id: number;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
  ingredients?: Array<{ name: string; quantity: string; unit: string }>;
  steps?: string[];
  images?: string[];
  tags?: string[];
  owner_id: number;
  owner?: {
    username: string;
    profile_picture?: string;
  };
  likes_count?: number;
  comments_count?: number;
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiAuth(user?.token)
      .get(`/recipes/${id}`)
      .then(res => {
        setRecipe(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, user]);

  const remove = async () => {
    if (!window.confirm('Supprimer cette recette ?')) return;
    if (!user?.token) {
      alert('Vous devez être connecté pour supprimer une recette.')
      logout()
      navigate('/login')
      return
    }

    try {
      await apiAuth(user.token).delete(`/recipes/${id}`)
      navigate('/recipes')
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        alert('Votre session a expiré. Veuillez vous reconnecter.')
        logout()
        navigate('/login')
        return
      }
      if (status === 403) {
        alert('Vous ne pouvez pas supprimer une recette qui ne vous appartient pas.')
        return
      }
      console.error('Erreur lors de la suppression:', error)
      alert('Une erreur est survenue lors de la suppression de la recette.')
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!recipe) return <div className="text-center py-12">Recette non trouvée</div>;

  const canEdit = Boolean(user && user.id !== null && recipe.owner_id === user.id);
  const ownerPicture = recipe.owner?.profile_picture
    ? resolveAssetUrl(recipe.owner.profile_picture)
    : undefined;
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour aux recettes</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {recipe.images && recipe.images.length > 0 && (
              <div className="animate-fadeIn">
                <ImageGallery images={recipe.images} title={recipe.title} />
              </div>
            )}

            {/* Title & Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-slideUp">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{recipe.title}</h1>
                  <p className="text-lg text-gray-600 leading-relaxed">{recipe.description}</p>
                </div>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {recipe.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author */}
              {recipe.owner && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                  {ownerPicture ? (
                    <img
                      src={ownerPicture}
                      alt={recipe.owner.username}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Créé par</p>
                    <p className="font-semibold text-gray-900">{recipe.owner.username}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-indigo-600" />
                  Ingrédients
                </h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <span className="font-medium">{ing.quantity} {ing.unit}</span>
                      <span>{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Étapes de préparation</h2>
                <ol className="space-y-6">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <p className="flex-1 text-gray-700 leading-relaxed pt-2">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Comments */}
            <CommentSection
              recipeId={parseInt(id!)}
              currentUserId={user?.id}
              recipeOwnerId={recipe.owner_id}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-4">
                {totalTime > 0 && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Temps total</p>
                      <p className="font-semibold">{totalTime} min</p>
                    </div>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Portions</p>
                      <p className="font-semibold">{recipe.servings} personnes</p>
                    </div>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center gap-3">
                    <div className={`
                      px-4 py-2 rounded-lg font-semibold
                      ${recipe.difficulty === 'facile' ? 'bg-green-100 text-green-800' : ''}
                      ${recipe.difficulty === 'moyen' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${recipe.difficulty === 'difficile' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                    </div>
                  </div>
                )}
              </div>

              {/* Like Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <LikeButton
                  recipeId={recipe.id}
                  initialLiked={false}
                  initialCount={recipe.likes_count || 0}
                />
              </div>

              {/* Actions */}
              {canEdit && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => navigate(`/recipes/${id}/edit`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={remove}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
