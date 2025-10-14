import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Clock, Filter } from 'lucide-react';
import { api } from '../services/api';
import { RecipeCard } from '../components/RecipeCard';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../hooks/useAuth';

type Recipe = {
  id: number;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  category?: string;
  images?: string[];
  likes_count?: number;
  comments_count?: number;
  owner_id: number;
  owner?: {
    username: string;
    profile_picture?: string;
  };
};

export default function Recipes() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<Recipe[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<'recent' | 'popular'>('recent');

  React.useEffect(() => {
    api
      .get('/recipes')
      .then(res => {
        setItems(res.data);
        setFilteredItems(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = (query: string, filters: any) => {
    let results = [...items];

    // Search by title/description
    if (query) {
      results = results.filter(
        r =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category) {
      results = results.filter(r => r.category === filters.category);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      results = results.filter(r => r.difficulty === filters.difficulty);
    }

    // Filter by max time
    if (filters.maxTime) {
      results = results.filter(
        r => (r.prep_time || 0) + (r.cook_time || 0) <= filters.maxTime
      );
    }

    setFilteredItems(results);
  };

  const sortedItems = React.useMemo(() => {
    const sorted = [...filteredItems];
    if (sortBy === 'popular') {
      return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    }
    return sorted;
  }, [filteredItems, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-warm-cream via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des recettes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header avec gradient warm */}
      <div className="relative bg-gradient-to-br from-primary via-primary-light to-secondary overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center animate-slideUp">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              Découvrez nos Recettes
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {items.length} recettes délicieuses créées par notre communauté de passionnés
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Filters */}
        <div className="-mt-8 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Trier par :</span>
            <button
              onClick={() => setSortBy('recent')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300
                ${sortBy === 'recent'
                  ? 'bg-primary text-white shadow-warm'
                  : 'bg-warm-cream text-gray-700 hover:bg-secondary-100'
                }
              `}
            >
              <Clock className="w-4 h-4" />
              Plus récentes
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300
                ${sortBy === 'popular'
                  ? 'bg-primary text-white shadow-warm'
                  : 'bg-warm-cream text-gray-700 hover:bg-secondary-100'
                }
              `}
            >
              <TrendingUp className="w-4 h-4" />
              Plus populaires
            </button>
          </div>

          {/* Create Button */}
          {user && (
            <Link
              to="/recipes/new"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:shadow-warm-lg transition-all transform hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Recette
            </Link>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          <p className="text-gray-700 font-medium">
            {filteredItems.length === items.length
              ? `${items.length} recette${items.length > 1 ? 's' : ''} disponible${items.length > 1 ? 's' : ''}`
              : `${filteredItems.length} résultat${filteredItems.length > 1 ? 's' : ''} sur ${items.length}`}
          </p>
        </div>

        {/* Recipes Grid */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Filter className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Aucune recette trouvée</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Essayez de modifier vos filtres ou votre recherche pour découvrir de délicieuses recettes
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {sortedItems.map((recipe, index) => (
              <div 
                key={recipe.id}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <RecipeCard
                  recipe={recipe}
                  onLike={(id) => {
                    // TODO: Handle like
                    console.log('Like recipe:', id);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
