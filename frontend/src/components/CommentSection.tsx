import { useState } from 'react';
import { MessageCircle, Send, Edit2, Trash2, MoreVertical } from 'lucide-react';

interface Comment {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    profile_picture?: string;
  };
}

interface CommentSectionProps {
  recipeId: number;
  currentUserId?: number;
  recipeOwnerId?: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  recipeId,
  currentUserId,
  recipeOwnerId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // TODO: Appel API
      // await axios.post(`/api/v1/recipes/${recipeId}/comments`, { content: newComment });
      
      // Simulation
      const mockComment: Comment = {
        id: Date.now(),
        user_id: currentUserId || 1,
        content: newComment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: currentUserId || 1,
          username: 'Vous',
          profile_picture: undefined,
        },
      };
      
      setComments([mockComment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return;
    
    try {
      // TODO: Appel API
      // await axios.put(`/api/v1/comments/${commentId}`, { content: editContent });
      
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, content: editContent, updated_at: new Date().toISOString() } : c
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    
    try {
      // TODO: Appel API
      // await axios.delete(`/api/v1/comments/${commentId}`);
      
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const canModify = (comment: Comment) => {
    return comment.user_id === currentUserId || recipeOwnerId === currentUserId;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
        <MessageCircle className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-gray-900">
          Commentaires
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({comments.length})
          </span>
        </h3>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Partagez votre avis sur cette recette..."
            rows={3}
            className="
              w-full px-4 py-3 rounded-lg
              border-2 border-gray-200
              focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
              transition-all duration-200
              resize-none
              placeholder-gray-400
            "
            maxLength={1000}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {newComment.length}/1000
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="
              flex items-center gap-2 px-6 py-2.5
              bg-indigo-600 text-white rounded-lg
              hover:bg-indigo-700
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-200
              transform hover:scale-105 active:scale-95
              font-medium
            "
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Envoi...' : 'Commenter'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun commentaire pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">Soyez le premier à donner votre avis!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="
                group p-4 rounded-lg
                bg-gray-50 hover:bg-gray-100
                transition-all duration-200
                border border-transparent hover:border-gray-200
              "
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user.profile_picture ? (
                    <img
                      src={comment.user.profile_picture}
                      alt={comment.user.username}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-indigo-100">
                      <span className="text-white font-semibold text-sm">
                        {comment.user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-gray-400 italic">
                          (modifié)
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {canModify(comment) && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="p-1.5 hover:bg-white rounded-md transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 hover:bg-white rounded-md transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content or Edit Form */}
                  {editingId === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="
                          w-full px-3 py-2 rounded-md
                          border-2 border-indigo-300
                          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                          resize-none
                        "
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment.id)}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

