import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Eye,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Article, ArticleCategory } from '../types';

interface CategoryManagerProps {
  articles: Article[];
  onSelectCategoryFilter: (categoryName: string) => void;
  onOpenCreateArticleWithCategory: (categoryName: string) => void;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  isPrimary: boolean;
}

const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'cat-music',
    name: 'Music',
    slug: 'music',
    description: 'Global music trends, Afrobeats, album reviews, chart toppers, and industry spotlights.',
    color: 'from-red-600 to-rose-600',
    isPrimary: true
  },
  {
    id: 'cat-musicians',
    name: 'Musicians',
    slug: 'musicians',
    description: 'Artist profiles, interviews, discographies, world tour updates, and behind-the-scenes stories.',
    color: 'from-amber-600 to-orange-600',
    isPrimary: true
  },
  {
    id: 'cat-movies',
    name: 'Movies',
    slug: 'movies',
    description: 'Blockbusters, cinematic releases, trailers, film festival coverage, and box office rankings.',
    color: 'from-purple-600 to-indigo-600',
    isPrimary: true
  },
  {
    id: 'cat-actors',
    name: 'Actors',
    slug: 'actors',
    description: 'Award-winning acting talent, red-carpet appearances, casting scoops, and exclusive interviews.',
    color: 'from-blue-600 to-cyan-600',
    isPrimary: true
  },
  {
    id: 'cat-nollywood',
    name: 'Nollywood',
    slug: 'nollywood',
    description: 'West African cinema powerhouse news, streaming premieres, legendary stars, and upcoming projects.',
    color: 'from-emerald-600 to-teal-600',
    isPrimary: true
  },
  {
    id: 'cat-hollywood',
    name: 'Hollywood',
    slug: 'hollywood',
    description: 'Global film industry headlines, Academy Awards, premiere galas, and blockbuster developments.',
    color: 'from-pink-600 to-rose-600',
    isPrimary: true
  },
  {
    id: 'cat-celebrity',
    name: 'Celebrity News',
    slug: 'celebrity-news',
    description: 'Celebrity biographies, fashion highlights, lifestyle spotlights, and major milestone announcements.',
    color: 'from-fuchsia-600 to-purple-600',
    isPrimary: true
  },
  {
    id: 'cat-trending',
    name: 'Trending',
    slug: 'trending',
    description: 'Viral moments, social media buzz, breaking entertainment stories, and cultural talking points.',
    color: 'from-red-600 to-amber-600',
    isPrimary: true
  }
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  articles,
  onSelectCategoryFilter,
  onOpenCreateArticleWithCategory
}) => {
  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    const saved = localStorage.getItem('allgenres_custom_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CATEGORIES;
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const saveCategories = (updated: CategoryInfo[]) => {
    setCategories(updated);
    localStorage.setItem('allgenres_custom_categories', JSON.stringify(updated));
    setStatusMessage('Categories successfully updated!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCategory: CategoryInfo = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || 'Entertainment category and special editorial coverage.',
      color: 'from-zinc-700 to-zinc-600',
      isPrimary: false
    };

    saveCategories([...categories, newCategory]);
    setNewCatName('');
    setNewCatDesc('');
    setIsAdding(false);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the "${name}" category?`)) return;
    saveCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-500" />
            Manage Editorial Categories
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize entertainment genres, review article distribution, and configure editorial sections.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Close Form' : 'Add New Category'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ADD CATEGORY FORM */}
      {isAdding && (
        <form
          onSubmit={handleAddCategory}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Add New Editorial Category
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Afrobeats, Fashion, Box Office"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Description & Editorial Scope
              </label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Brief summary of stories published in this category..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white uppercase tracking-wider cursor-pointer"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const catArticles = articles.filter(
            (a) => a.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
          );
          const totalViews = catArticles.reduce((sum, a) => sum + (a.views || 0), 0);
          const publishedCount = catArticles.filter((a) => a.status === 'published').length;
          const draftCount = catArticles.filter((a) => a.status === 'draft').length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <h3 className="text-base font-black text-white">{cat.name}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {cat.isPrimary ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                        Core Genre
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                  {cat.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 mb-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                      Published
                    </span>
                    <span className="text-sm font-black text-white">{publishedCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                      Drafts
                    </span>
                    <span className="text-sm font-black text-zinc-400">{draftCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                      Total Reads
                    </span>
                    <span className="text-sm font-black text-amber-400">
                      {totalViews.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/70">
                <button
                  type="button"
                  onClick={() => onSelectCategoryFilter(cat.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>View Articles</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenCreateArticleWithCategory(cat.name)}
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title={`Write a new article in ${cat.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
