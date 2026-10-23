import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Save,
  Send,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Flame,
  Search,
  Check,
  AlertCircle,
  Clock,
  ArrowLeft,
  FileText,
  Tag,
  Globe,
  Upload
} from 'lucide-react';
import { Article, ArticleCategory } from '../types';

interface ArticleEditorProps {
  article: Partial<Article>;
  isNew: boolean;
  mediaList: Array<{ id: string; name: string; url: string; size: number }>;
  onClose: () => void;
  onSave: (articleData: Partial<Article>, publishStatus: 'published' | 'draft' | 'scheduled') => Promise<void>;
  onPreview: (articleData: Partial<Article>) => void;
  token?: string;
}

const CATEGORIES: ArticleCategory[] = [
  'Music',
  'Musicians',
  'Movies',
  'Actors',
  'Nollywood',
  'Hollywood',
  'Celebrity News',
  'Trending'
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  isNew,
  mediaList,
  onClose,
  onSave,
  onPreview,
  token
}) => {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    subtitle: '',
    slug: '',
    category: 'Music',
    tags: [],
    content: '',
    excerpt: '',
    featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    caption: '',
    status: 'published',
    scheduledFor: '',
    featured: false,
    breaking: false,
    seoTitle: '',
    seoDescription: '',
    author: {
      name: 'Jacob Friday (Founder & Admin)',
      role: 'Senior Entertainment Editor'
    },
    ...article
  });

  const [tagsInput, setTagsInput] = useState<string>(
    Array.isArray(article.tags) ? article.tags.join(', ') : ''
  );
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, featuredImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);

    // If token exists, also upload to server media library
    if (token) {
      setUploadingImage(true);
      try {
        const data = new FormData();
        data.append('file', file);
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.media?.url) {
            setFormData((prev) => ({ ...prev, featuredImage: resData.media.url }));
          }
        }
      } catch (err) {
        console.warn('Server upload fallback to local preview');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Auto-generate slug and SEO titles if empty
  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev.slug && !isNew ? prev.slug : autoSlug,
      seoTitle: prev.seoTitle && !isNew ? prev.seoTitle : `${newTitle} - ALL GENRES`
    }));
  };

  // Word count & Reading Time calculation
  const wordCount = formData.content?.trim()
    ? formData.content.trim().split(/\s+/).length
    : 0;
  const calculatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleFormSubmit = async (targetStatus?: 'published' | 'draft' | 'scheduled') => {
    setValidationError(null);

    if (!formData.title?.trim()) {
      setValidationError('Please provide an article headline/title.');
      return;
    }

    if (!formData.content?.trim()) {
      setValidationError('Please write the article body content.');
      return;
    }

    if (!formData.featuredImage?.trim()) {
      setValidationError('Please provide a featured image URL.');
      return;
    }

    const finalStatus = targetStatus || formData.status || 'published';

    if (finalStatus === 'scheduled' && !formData.scheduledFor) {
      setValidationError('Please specify a scheduled publication date and time.');
      return;
    }

    // Process tags
    const finalTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<Article> = {
      ...formData,
      title: formData.title.trim(),
      subtitle: formData.subtitle?.trim() || '',
      status: finalStatus,
      tags: finalTags,
      readingTime: calculatedReadingTime,
      excerpt:
        formData.excerpt?.trim() ||
        formData.content.slice(0, 180).replace(/<[^>]*>?/gm, '') + '...',
      seoTitle: formData.seoTitle?.trim() || `${formData.title.trim()} - ALL GENRES`,
      seoDescription: formData.seoDescription?.trim() || formData.subtitle || formData.title
    };

    setIsSubmitting(true);
    try {
      await onSave(payload, finalStatus);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save article.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-full min-h-screen bg-zinc-950 text-zinc-100 overflow-y-auto flex flex-col">
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-30 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-3 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Cancel and Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded">
                {isNew ? 'New Story' : 'Editing Story'}
              </span>
              <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                {calculatedReadingTime} min read · {wordCount} words
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
              {formData.title || 'Untitled Entertainment Story'}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onPreview(formData)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-amber-400 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live</span> Preview
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFormSubmit('draft')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-zinc-400" />
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFormSubmit('published')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Publish Story'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 cursor-pointer ml-1"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN FORM CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-36 sm:pb-28">
        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* SECTION 1: HEADLINE & CORE INFORMATION */}
          <section className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-5">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  1. Article Headline & Category
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">Required fields marked with *</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Afrobeats Triumphs at Global Stadiums: Burna Boy & Wizkid Break Records"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700/80 rounded-2xl text-white font-bold text-base sm:text-lg placeholder-zinc-500 focus:outline-none focus:border-red-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Article Subtitle / Secondary Deck
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Brief summary deck displayed beneath the main headline..."
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-200 text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={formData.category || 'Music'}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ArticleCategory })
                  }
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Tags (comma separated)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">e.g. Afrobeats, Nollywood, Oscars</span>
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Burna Boy, Concerts, Box Office"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: COVER IMAGE & MEDIA */}
          <section className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-5">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  2. Featured Cover Image & Visuals
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 border border-zinc-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDirectImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(!mediaPickerOpen)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{mediaPickerOpen ? 'Hide Media' : 'Choose from Media Library'}</span>
                </button>
              </div>
            </div>

            {/* Media Library Drawer */}
            {mediaPickerOpen && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Uploaded Media Library ({mediaList.length})
                  </h4>
                  <span className="text-[11px] text-zinc-400">Click any image to select as cover</span>
                </div>
                {mediaList.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3 text-center">
                    No images uploaded yet. Upload images in the Media Library tab or paste a direct URL below.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                    {mediaList.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setFormData({ ...formData, featuredImage: m.url });
                          setMediaPickerOpen(false);
                        }}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500 cursor-pointer shadow-sm"
                      >
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Check className="w-5 h-5 text-amber-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Image URL & Caption Inputs */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Featured Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.featuredImage || ''}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Image Caption & Photographer Credit
                  </label>
                  <input
                    type="text"
                    value={formData.caption || ''}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="e.g. Photo by Getty Images / Billboard Awards Gala"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-300 text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Image Preview Thumbnail */}
              <div className="md:col-span-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Live Thumbnail Preview
                </span>
                <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center">
                  {formData.featuredImage ? (
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-zinc-600" />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: ARTICLE BODY CONTENT */}
          <section className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  3. Article Body Content *
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400">
                {wordCount} words · {calculatedReadingTime} min read
              </span>
            </div>

            <div>
              <p className="text-[11px] text-zinc-400 mb-2">
                Write or paste your entertainment article below. Separate paragraphs with double line breaks for clean editorial formatting.
              </p>
              <textarea
                required
                rows={14}
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Start writing the story here... Afrobeats has taken the world by storm with packed stadium nights..."
                className="w-full min-h-[360px] p-4 bg-zinc-950 border border-zinc-700/80 rounded-2xl text-zinc-100 font-sans text-sm sm:text-base leading-relaxed placeholder-zinc-600 focus:outline-none focus:border-red-500 resize-y"
              />
            </div>
          </section>

          {/* SECTION 4: PUBLISHING STATUS & VISIBILITY FLAGS */}
          <section className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-5">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  4. Publication Schedule & Editorial Placement
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Publication Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Publishing Status
                </label>
                <select
                  value={formData.status || 'published'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'published' | 'draft' | 'scheduled'
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-red-500"
                >
                  <option value="published">Publish Immediately</option>
                  <option value="draft">Save as Draft (Private)</option>
                  <option value="scheduled">Schedule for Future Release</option>
                </select>
              </div>

              {/* Scheduled Date Picker (Shown when scheduled is selected) */}
              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1.5">
                    Release Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-amber-500/80 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* Placement Toggles */}
            <div className="pt-2 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mt-1 rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Pin as Hero Featured Story
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Positions this article as the primary lead headline banner on the homepage.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.breaking || false}
                  onChange={(e) => setFormData({ ...formData, breaking: e.target.checked })}
                  className="mt-1 rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    Mark as Breaking News
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Broadcasts this headline across the top live ticker banner of the website.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* SECTION 5: SEO & SEARCH SNIPPET */}
          <section className="p-5 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-4">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  5. Search Engine Optimization (SEO) & URL Slug
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Custom SEO Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Appears in Google search results..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Custom URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-')
                    })
                  }
                  placeholder="afrobeats-global-stadium-tour"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-300 text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>SEO Meta Description</span>
                <span className="text-[10px] text-zinc-400">
                  {(formData.seoDescription || '').length} / 160 characters
                </span>
              </label>
              <textarea
                rows={2}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="1-2 sentences summarizing the article for Google search engine result snippets..."
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Google Search Result Preview Card */}
            <div className="mt-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Google Search Result Preview
              </span>
              <p className="text-xs text-blue-400 truncate font-semibold">
                {formData.seoTitle || formData.title || 'ALL GENRES Story'}
              </p>
              <p className="text-[11px] text-emerald-400 truncate">
                https://allgenres.media/article/{formData.slug || 'story-headline'}
              </p>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {formData.seoDescription || formData.subtitle || formData.content?.slice(0, 150) || 'Entertainment news and celebrity spotlight...'}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* 3. MOBILE STICKY BOTTOM ACTION BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFormSubmit('draft')}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFormSubmit('published')}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Publish Story'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
