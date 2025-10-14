import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  recipeId: number;
  initialLiked?: boolean;
  initialCount?: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  recipeId,
  initialLiked = false,
  initialCount = 0,
  onLikeChange,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      // TODO: Appel API
      // const response = await axios.post(`/api/v1/recipes/${recipeId}/like`);
      
      // Simulation pour le moment
      const newLiked = !isLiked;
      const newCount = newLiked ? likesCount + 1 : likesCount - 1;
      
      setIsLiked(newLiked);
      setLikesCount(newCount);
      onLikeChange?.(newLiked, newCount);
    } catch (error) {
      console.error('Erreur lors du like:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`
        group flex items-center gap-3 px-5 py-2.5 rounded-full
        transition-all duration-300 ease-out
        ${isLiked 
          ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-warm' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transform hover:scale-105 active:scale-95
        border-2 border-transparent hover:border-primary/20
      `}
    >
      <Heart
        className={`
          w-5 h-5 transition-all duration-300
          ${isLiked ? 'fill-primary stroke-primary' : 'stroke-gray-600 fill-none'}
          ${isAnimating ? 'animate-heartBeat' : ''}
          group-hover:scale-110
        `}
      />
      <span className={`font-bold text-sm ${isLiked ? 'text-primary' : 'text-gray-700'}`}>
        {likesCount}
      </span>
    </button>
  );
};

