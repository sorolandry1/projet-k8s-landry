import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat, Heart, MessageCircle, Eye } from 'lucide-react';

interface Recipe {
  id: number;
  title: string;
  description: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
  images?: string[];
  likes_count?: number;
  comments_count?: number;
  owner?: {
    username: string;
    profile_picture?: string;
  };
}

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (id: number) => void;
}

const difficultyColors = {
  facile: 'bg-green-100 text-green-800',
  moyen: 'bg-yellow-100 text-yellow-800',
  difficile: 'bg-red-100 text-red-800',
};

const categoryColors = {
  entrée: 'bg-blue-100 text-blue-800',
  plat: 'bg-purple-100 text-purple-800',
  dessert: 'bg-pink-100 text-pink-800',
  boisson: 'bg-cyan-100 text-cyan-800',
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLike }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const imageUrl = recipe.images?.[0] || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-warm transition-all duration-500 transform hover:-translate-y-2">
      {/* Image */}
      <Link to={`/recipes/${recipe.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {recipe.difficulty && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${difficultyColors[recipe.difficulty as keyof typeof difficultyColors] || 'bg-gray-100 text-gray-800'} shadow-lg`}>
              {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
            </span>
          )}
          {recipe.category && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${categoryColors[recipe.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'} shadow-lg`}>
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-3 text-white">
            {totalTime > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">{totalTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">{recipe.servings} pers.</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <Link to={`/recipes/${recipe.id}`}>
          <h3 className="text-xl font-display font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 group-hover:text-primary">
            {recipe.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-4">
          {/* Author & Stats */}
          <div className="flex items-center justify-between">
            {/* Author */}
            {recipe.owner && (
              <div className="flex items-center gap-2.5">
                {recipe.owner.profile_picture ? (
                  <img
                    src={recipe.owner.profile_picture}
                    alt={recipe.owner.username}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center ring-2 ring-primary/20 shadow-warm">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {recipe.owner.username}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onLike?.(recipe.id);
                }}
                className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors group/like"
              >
                <Heart className="w-4 h-4 group-hover/like:scale-110 transition-transform" />
                <span className="text-sm font-semibold">{recipe.likes_count || 0}</span>
              </button>
              <div className="flex items-center gap-1.5 text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">{recipe.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

