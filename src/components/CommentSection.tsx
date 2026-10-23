import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, Flame, Heart, Sparkles, Smile } from 'lucide-react';
import { Comment } from '../types';

interface CommentSectionProps {
  articleId: string;
}

const REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '🤯', label: 'Mindblown' },
  { emoji: '🍿', label: 'Cinema' }
];

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('🔥');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReactionCount, setUserReactionCount] = useState<Record<string, number>>({
    '🔥': 142,
    '❤️': 89,
    '👏': 54,
    '🤯': 31,
    '🍿': 78
  });

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {}
  };

  const handleReactionClick = (emoji: string) => {
    setUserReactionCount((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: authorName.trim() || 'Entertainment Reader',
          content: content.trim(),
          reaction: selectedReaction
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit comment');
      }

      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Error posting comment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      {/* Reader Reactions Bar */}
      <div className="mb-10 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3 text-center sm:text-left">
          Reader Reactions
        </h4>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          {REACTIONS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-red-500 dark:hover:border-amber-400 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="text-base">{emoji}</span>
              <span>{userReactionCount[emoji] || 0}</span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">({label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discussion Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-500" />
          Reader Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Join the Conversation
        </h4>

        {error && (
          <div className="mb-3 p-2.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Your Display Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. CinemaLover99"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Your Mood / Reaction
            </label>
            <select
              value={selectedReaction}
              onChange={(e) => setSelectedReaction(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
            >
              {REACTIONS.map((r) => (
                <option key={r.emoji} value={r.emoji}>
                  {r.emoji} {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <textarea
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are your thoughts on this story?"
            className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-red-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            No comments yet. Be the first to share your thoughts on this story!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-white font-bold text-xs flex items-center justify-center">
                    {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {comment.authorName}
                  </span>
                  {comment.reaction && (
                    <span className="text-sm">{comment.reaction}</span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-400">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-9">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
