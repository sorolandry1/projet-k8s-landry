import { useState } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

interface SearchFilters {
  category?: string;
  difficulty?: string;
  maxTime?: number;
}

const categories = ['Tous', 'Entrée', 'Plat', 'Dessert', 'Boisson'];
const difficulties = ['Toutes', 'Facile', 'Moyen', 'Difficile'];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Rechercher une recette..." 
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    onSearch(newQuery, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch(query, {});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-24 py-4
            bg-white border-2 border-gray-200
            rounded-2xl
            focus:border-primary focus:ring-4 focus:ring-primary/10
            transition-all duration-200
            text-gray-900 placeholder-gray-400
            text-lg font-body
            hover:border-gray-300
          "
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-2">
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              transition-all duration-200 font-semibold
              ${showFilters || activeFiltersCount > 0
                ? 'bg-primary text-white shadow-warm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Catégorie
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFilterChange('category', cat === 'Tous' ? undefined : cat.toLowerCase())}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold
                    transition-all duration-200
                    ${(cat === 'Tous' && !filters.category) || filters.category === cat.toLowerCase()
                      ? 'bg-primary text-white shadow-warm'
                      : 'bg-warm-cream text-gray-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Difficulté
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleFilterChange('difficulty', diff === 'Toutes' ? undefined : diff.toLowerCase())}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold
                    transition-all duration-200
                    ${(diff === 'Toutes' && !filters.difficulty) || filters.difficulty === diff.toLowerCase()
                      ? 'bg-primary text-white shadow-warm'
                      : 'bg-warm-cream text-gray-700 hover:bg-secondary-100'
                    }
                  `}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Temps maximum (minutes)
            </label>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={filters.maxTime || 180}
              onChange={(e) => handleFilterChange('maxTime', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>15 min</span>
              <span className="font-bold text-primary">
                {filters.maxTime || 180} min
              </span>
              <span>3h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

