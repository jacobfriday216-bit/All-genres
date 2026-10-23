export type ArticleCategory =
  | 'Music'
  | 'Musicians'
  | 'Movies'
  | 'Actors'
  | 'Nollywood'
  | 'Hollywood'
  | 'Celebrity News'
  | 'Trending';

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  excerpt: string;
  category: ArticleCategory;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  featuredImage: string;
  caption?: string;
  status: 'published' | 'draft' | 'scheduled';
  publishedAt: string;
  scheduledFor?: string;
  views: number;
  readingTime: number; // in minutes
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  breaking?: boolean;
}

export interface AdPlacementConfig {
  enabled: boolean;
  code: string;
  label?: string;
}

export interface MonetagConfig {
  smartLink: {
    enabled: boolean;
    url: string;
    title: string;
    description: string;
    buttonText: string;
    delaySeconds: number;
    showOnHomepageOnly: boolean;
    allowDismiss: boolean;
    frequencyHours: number;
  };
  verification: {
    method: 'meta' | 'file' | 'none';
    metaTagCode: string;
    fileName: string;
    fileContent: string;
  };
  placements: {
    header: AdPlacementConfig;
    homepage: AdPlacementConfig;
    sidebar: AdPlacementConfig;
    insideArticle: AdPlacementConfig;
    afterArticle: AdPlacementConfig;
    footer: AdPlacementConfig;
  };
}

export interface GoogleVerificationConfig {
  method: 'meta' | 'file' | 'none';
  metaTag: string;
  filename: string;
  fileContent: string;
  lastChecked?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  visitorRegistrationEnabled: boolean;
  defaultOgImage: string;
  robotsTxt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reaction?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'visitor';
  createdAt: string;
  isInitialAdmin?: boolean;
}

export interface AdminStats {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  totalViews: number;
  totalComments: number;
  totalRegisteredUsers: number;
}
