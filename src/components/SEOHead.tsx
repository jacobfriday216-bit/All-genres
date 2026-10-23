import React, { useEffect } from 'react';
import { Article } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  article?: Article;
  googleMetaTag?: string;
  monetagMetaTag?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  article,
  googleMetaTag,
  monetagMetaTag
}) => {
  useEffect(() => {
    const siteTitle = title || 'ALL GENRES - Entertainment News, Music, Movies & Pop Culture';
    const siteDesc =
      description ||
      'Premier entertainment news magazine covering music artists, Nollywood, Hollywood, celebrity biographies, movies, and pop culture.';
    const currentUrl = url || window.location.href;
    const ogImage =
      image ||
      article?.featuredImage ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';

    // Update document title
    document.title = siteTitle;

    // Helper to set or create meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', siteDesc);
    setMeta('og:title', siteTitle, true);
    setMeta('og:description', siteDesc, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:url', currentUrl, true);
    setMeta('og:type', article ? 'article' : 'website', true);
    setMeta('og:site_name', 'ALL GENRES', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', siteTitle);
    setMeta('twitter:description', siteDesc);
    setMeta('twitter:image', ogImage);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Google Search Console Meta Tag
    if (googleMetaTag && googleMetaTag.trim()) {
      let gToken = googleMetaTag.trim();
      // If user pasted full <meta name="google-site-verification" content="..." />
      const match = gToken.match(/content=["']([^"']+)["']/i);
      if (match && match[1]) {
        gToken = match[1];
      }
      setMeta('google-site-verification', gToken);
    }

    // Monetag Meta Tag
    if (monetagMetaTag && monetagMetaTag.trim()) {
      let mToken = monetagMetaTag.trim();
      const match = mToken.match(/content=["']([^"']+)["']/i);
      if (match && match[1]) {
        mToken = match[1];
      }
      setMeta('monetag-site-verification', mToken);
    }

    // Schema.org Structured Data (JSON-LD)
    const existingScript = document.getElementById('schema-json-ld');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'schema-json-ld';
    script.type = 'application/ld+json';

    if (article) {
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        alternativeHeadline: article.subtitle,
        image: [article.featuredImage],
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: [
          {
            '@type': 'Person',
            name: article.author.name
          }
        ],
        publisher: {
          '@type': 'Organization',
          name: 'ALL GENRES',
          logo: {
            '@type': 'ImageObject',
            url: `${window.location.origin}/favicon.svg`
          }
        },
        description: article.seoDescription || article.excerpt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl
        }
      });
    } else {
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsMediaOrganization',
        name: 'ALL GENRES',
        url: window.location.origin,
        logo: `${window.location.origin}/favicon.svg`,
        sameAs: [
          'https://twitter.com/allgenresnews',
          'https://facebook.com/allgenresnews',
          'https://instagram.com/allgenresnews'
        ],
        description:
          'Global entertainment publication covering music, movies, Nollywood, Hollywood, celebrity profiles, and pop culture.'
      });
    }

    document.head.appendChild(script);

    return () => {
      // keep document clean
    };
  }, [title, description, image, url, article, googleMetaTag, monetagMetaTag]);

  return null;
};
