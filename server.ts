import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { db } from './server/db.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'all-genres-media-secret-jwt-key-2025';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads serving
const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Setup Multer for media uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware: Authenticate Admin JWT
export interface AuthRequest extends Request {
  user?: {
    email: string;
    role: string;
    id?: string;
  };
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin privileges required' });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}

// -------------------------------------------------------------
// Root Verification & SEO Endpoints (Google Search Console & Monetag)
// -------------------------------------------------------------

// Serve robots.txt dynamically
app.get('/robots.txt', (_req, res) => {
  const data = db.getData();
  res.type('text/plain');
  res.send(data.siteSettings.robotsTxt || 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml');
});

// Serve sitemap.xml dynamically
app.get('/sitemap.xml', (_req, res) => {
  const data = db.getData();
  const baseUrl = process.env.APP_URL || 'https://allgenres.media';
  const categories = [
    'music',
    'musicians',
    'movies',
    'actors',
    'nollywood',
    'hollywood',
    'celebrity-news',
    'trending'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Homepage
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Category pages
  categories.forEach((cat) => {
    xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Published Articles
  data.articles
    .filter((a) => a.status === 'published')
    .forEach((art) => {
      xml += `  <url>\n    <loc>${baseUrl}/article/${encodeURIComponent(art.slug)}</loc>\n    <lastmod>${new Date(art.publishedAt).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

  xml += `</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// Root-level dynamic file matcher for Google or Monetag verification files (e.g. /google12345678.html or /monetag_verify.html)
app.get('/:filename([a-zA-Z0-9_.-]+\\.html)', (req, res, next) => {
  const requestedFile = req.params.filename;
  const data = db.getData();

  // Check Google Verification file
  if (
    data.googleVerification.method === 'file' &&
    data.googleVerification.filename &&
    data.googleVerification.filename.trim() === requestedFile
  ) {
    res.type('text/html');
    return res.send(data.googleVerification.fileContent || `google-site-verification: ${requestedFile}`);
  }

  // Check Monetag Verification file
  if (
    data.monetag.verification.method === 'file' &&
    data.monetag.verification.fileName &&
    data.monetag.verification.fileName.trim() === requestedFile
  ) {
    res.type('text/html');
    return res.send(data.monetag.verification.fileContent || `monetag-verification: ${requestedFile}`);
  }

  next();
});

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

app.get('/api/auth/status', (_req, res) => {
  const data = db.getData();
  res.json({
    isConfigured: data.adminUser.isConfigured,
    adminEmail: data.adminUser.email,
    visitorRegistrationEnabled: data.siteSettings.visitorRegistrationEnabled
  });
});

app.post('/api/auth/setup-admin', async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const data = db.getData();

  if (email.toLowerCase().trim() !== data.adminUser.email.toLowerCase().trim()) {
    return res.status(403).json({ error: `Setup restricted to designated administrator address (${data.adminUser.email}).` });
  }

  if (data.adminUser.isConfigured) {
    return res.status(400).json({ error: 'Master administrator password has already been established. Please log in.' });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  await db.setInitialAdminPassword(password);
  const token = jwt.sign(
    { email: data.adminUser.email, role: 'admin', name: data.adminUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Master administrator account configured successfully.',
    token,
    user: {
      email: data.adminUser.email,
      name: data.adminUser.name,
      role: 'admin'
    }
  });
});

app.post('/api/auth/admin-login', async (req, res) => {
  const { email, password } = req.body;
  const data = db.getData();

  if (!data.adminUser.isConfigured) {
    return res.status(400).json({
      error: 'Administrator account is not yet configured. Please complete the initial password setup first.',
      needsSetup: true
    });
  }

  if (email.toLowerCase().trim() !== data.adminUser.email.toLowerCase().trim()) {
    return res.status(401).json({ error: 'Invalid administrator email address.' });
  }

  const isValid = await db.verifyAdminPassword(password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  db.logAction('Admin Login', `Administrator logged in from IP: ${req.ip}`);

  const token = jwt.sign(
    { email: data.adminUser.email, role: 'admin', name: data.adminUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      email: data.adminUser.email,
      name: data.adminUser.name,
      role: 'admin'
    }
  });
});

app.post('/api/auth/visitor-register', async (req, res) => {
  const data = db.getData();
  if (!data.siteSettings.visitorRegistrationEnabled) {
    return res.status(403).json({ error: 'Visitor registration is currently disabled by administrator.' });
  }

  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide full name, email, and password.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: 'visitor' as const,
    createdAt: new Date().toISOString(),
    passwordHash
  };

  data.users.push(newUser);
  db.save();
  db.logAction('Visitor Registered', `New visitor registered: ${newUser.email}`);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: 'visitor', name: newUser.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: 'visitor'
    }
  });
});

app.post('/api/auth/visitor-login', async (req, res) => {
  const { email, password } = req.body;
  const data = db.getData();

  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: 'visitor', name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'visitor'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ user: null });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string; name: string; id?: string };
    res.json({ user: decoded });
  } catch {
    res.json({ user: null });
  }
});

// -------------------------------------------------------------
// Articles Endpoints
// -------------------------------------------------------------

app.get('/api/articles', (req, res) => {
  const data = db.getData();
  const { category, search, tag, status, limit, offset } = req.query;

  // Filter
  let articles = [...data.articles];

  // If requesting status != published, check admin token
  const authHeader = req.headers.authorization;
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { role: string };
      isAdmin = decoded.role === 'admin';
    } catch {}
  }

  if (!isAdmin || status === 'published') {
    articles = articles.filter((a) => a.status === 'published');
  } else if (status && status !== 'all') {
    articles = articles.filter((a) => a.status === status);
  }

  if (category && category !== 'all') {
    const catClean = (category as string).toLowerCase().replace(/-/g, ' ');
    articles = articles.filter((a) => a.category.toLowerCase().replace(/-/g, ' ') === catClean);
  }

  if (tag) {
    articles = articles.filter((a) => a.tags.some((t) => t.toLowerCase() === (tag as string).toLowerCase()));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort by publishedAt / createdAt desc
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const total = articles.length;
  if (offset) {
    articles = articles.slice(Number(offset));
  }
  if (limit) {
    articles = articles.slice(0, Number(limit));
  }

  res.json({ total, articles });
});

app.get('/api/articles/:slug', (req, res) => {
  const { slug } = req.params;
  const data = db.getData();
  const article = data.articles.find((a) => a.slug === slug || a.id === slug);

  if (!article) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  // Increment views
  article.views = (article.views || 0) + 1;
  db.save();

  res.json({ article });
});

app.post('/api/articles', requireAdmin, (req, res) => {
  const data = db.getData();
  const payload = req.body;

  if (!payload.title || !payload.content || !payload.category) {
    return res.status(400).json({ error: 'Title, category, and article body are required.' });
  }

  const slug = (payload.slug || payload.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const readingTime = Math.max(1, Math.ceil(payload.content.split(/\s+/).length / 200));

  const newArticle = {
    id: `art-${Date.now()}`,
    title: payload.title.trim(),
    subtitle: payload.subtitle?.trim() || '',
    slug,
    content: payload.content,
    excerpt: payload.excerpt?.trim() || payload.content.slice(0, 180).replace(/<[^>]*>?/gm, '') + '...',
    category: payload.category,
    tags: Array.isArray(payload.tags) ? payload.tags : (payload.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    author: {
      name: payload.authorName?.trim() || data.adminUser.name,
      avatar: payload.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: payload.authorRole || 'Senior Entertainment Journalist'
    },
    featuredImage: payload.featuredImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    caption: payload.caption || '',
    status: payload.status || 'published',
    publishedAt: payload.status === 'scheduled' && payload.scheduledFor ? payload.scheduledFor : new Date().toISOString(),
    scheduledFor: payload.scheduledFor,
    views: 0,
    readingTime,
    seoTitle: payload.seoTitle || `${payload.title} - ALL GENRES`,
    seoDescription: payload.seoDescription || payload.excerpt || payload.title,
    featured: Boolean(payload.featured),
    breaking: Boolean(payload.breaking)
  };

  data.articles.unshift(newArticle);
  db.logAction('Article Created', `Published article: "${newArticle.title}"`);
  db.save();

  res.status(201).json({ article: newArticle });
});

app.put('/api/articles/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.articles.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  const payload = req.body;
  const current = data.articles[index];

  const readingTime = payload.content
    ? Math.max(1, Math.ceil(payload.content.split(/\s+/).length / 200))
    : current.readingTime;

  data.articles[index] = {
    ...current,
    ...payload,
    readingTime,
    tags: Array.isArray(payload.tags) ? payload.tags : (payload.tags ? payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : current.tags),
    author: {
      ...current.author,
      ...(payload.author || {}),
      name: payload.authorName || current.author.name
    }
  };

  db.logAction('Article Updated', `Updated article: "${data.articles[index].title}"`);
  db.save();

  res.json({ article: data.articles[index] });
});

app.delete('/api/articles/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.articles.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  const deleted = data.articles.splice(index, 1)[0];
  db.logAction('Article Deleted', `Deleted article: "${deleted.title}"`);
  db.save();

  res.json({ success: true, message: 'Article deleted successfully.' });
});

// -------------------------------------------------------------
// Reader Reactions & Comments
// -------------------------------------------------------------

app.get('/api/articles/:id/comments', (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const comments = data.comments.filter((c) => c.articleId === id);
  res.json({ comments });
});

app.post('/api/articles/:id/comments', (req, res) => {
  const { id } = req.params;
  const { authorName, content, reaction } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty.' });
  }

  const newComment = {
    id: `c-${Date.now()}`,
    articleId: id,
    authorName: (authorName && authorName.trim()) || 'Entertainment Fan',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    reaction: reaction || '💬'
  };

  const data = db.getData();
  data.comments.unshift(newComment);
  db.save();

  res.status(201).json({ comment: newComment });
});

// -------------------------------------------------------------
// Settings Endpoints
// -------------------------------------------------------------

app.get('/api/settings/public', (_req, res) => {
  const data = db.getData();
  res.json({
    siteSettings: data.siteSettings,
    monetag: {
      smartLink: data.monetag.smartLink,
      placements: data.monetag.placements,
      verificationMetaTag: data.monetag.verification.method === 'meta' ? data.monetag.verification.metaTagCode : ''
    },
    googleVerification: {
      method: data.googleVerification.method,
      metaTag: data.googleVerification.metaTag
    }
  });
});

app.get('/api/settings/admin', requireAdmin, (_req, res) => {
  const data = db.getData();
  res.json({
    siteSettings: data.siteSettings,
    monetag: data.monetag,
    googleVerification: data.googleVerification
  });
});

app.put('/api/settings/admin', requireAdmin, (req, res) => {
  const { siteSettings, monetag, googleVerification } = req.body;
  const data = db.getData();

  if (siteSettings) {
    data.siteSettings = { ...data.siteSettings, ...siteSettings };
  }
  if (monetag) {
    data.monetag = {
      ...data.monetag,
      ...monetag,
      smartLink: { ...data.monetag.smartLink, ...(monetag.smartLink || {}) },
      verification: { ...data.monetag.verification, ...(monetag.verification || {}) },
      placements: { ...data.monetag.placements, ...(monetag.placements || {}) }
    };
  }
  if (googleVerification) {
    data.googleVerification = { ...data.googleVerification, ...googleVerification };
  }

  db.logAction('Settings Updated', 'Administrator updated site, verification, and monetization configurations.');
  db.save();

  res.json({
    success: true,
    message: 'Settings updated successfully.',
    siteSettings: data.siteSettings,
    monetag: data.monetag,
    googleVerification: data.googleVerification
  });
});

// Test Google verification reachability
app.post('/api/settings/test-google', requireAdmin, (_req, res) => {
  const data = db.getData();
  const config = data.googleVerification;

  if (config.method === 'meta') {
    if (!config.metaTag || !config.metaTag.trim()) {
      return res.json({ verified: false, message: 'Google verification meta tag is empty.' });
    }
    return res.json({
      verified: true,
      message: 'Google meta tag is actively injected into HTML head.'
    });
  } else if (config.method === 'file') {
    if (!config.filename || !config.filename.trim()) {
      return res.json({ verified: false, message: 'Google HTML verification filename is missing.' });
    }
    const cleanFile = config.filename.trim().replace(/^\//, '');
    return res.json({
      verified: true,
      url: `/${cleanFile}`,
      message: `Verification file is live at /${cleanFile}`
    });
  }

  res.json({ verified: false, message: 'No Google verification method selected.' });
});

// Test Monetag verification reachability
app.post('/api/settings/test-monetag', requireAdmin, (_req, res) => {
  const data = db.getData();
  const config = data.monetag.verification;

  if (config.method === 'meta') {
    if (!config.metaTagCode || !config.metaTagCode.trim()) {
      return res.json({ verified: false, message: 'Monetag verification meta tag is empty.' });
    }
    return res.json({
      verified: true,
      message: 'Monetag verification meta tag is actively injected into HTML head.'
    });
  } else if (config.method === 'file') {
    if (!config.fileName || !config.fileName.trim()) {
      return res.json({ verified: false, message: 'Monetag verification filename is missing.' });
    }
    const cleanFile = config.fileName.trim().replace(/^\//, '');
    return res.json({
      verified: true,
      url: `/${cleanFile}`,
      message: `Monetag verification file is live at /${cleanFile}`
    });
  }

  res.json({ verified: false, message: 'No Monetag verification method configured.' });
});

// -------------------------------------------------------------
// Media Library & Uploads
// -------------------------------------------------------------

app.get('/api/media', requireAdmin, (_req, res) => {
  const data = db.getData();
  res.json({ media: data.media });
});

app.post('/api/media/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const mediaItem = {
    id: `med-${Date.now()}`,
    name: req.file.originalname,
    url: fileUrl,
    size: req.file.size,
    type: req.file.mimetype,
    uploadedAt: new Date().toISOString()
  };

  const data = db.getData();
  data.media.unshift(mediaItem);
  db.logAction('Media Uploaded', `File uploaded: ${req.file.originalname}`);
  db.save();

  res.json({ success: true, media: mediaItem });
});

app.delete('/api/media/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const data = db.getData();
  const index = data.media.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Media file not found.' });
  }

  const removed = data.media.splice(index, 1)[0];
  if (removed.url.startsWith('/uploads/')) {
    const filePath = path.join(UPLOADS_DIR, path.basename(removed.url));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }
  }

  db.logAction('Media Deleted', `File deleted: ${removed.name}`);
  db.save();

  res.json({ success: true });
});

// -------------------------------------------------------------
// Admin Stats & Overview
// -------------------------------------------------------------

app.get('/api/admin/stats', requireAdmin, (_req, res) => {
  const data = db.getData();
  const totalArticles = data.articles.length;
  const publishedCount = data.articles.filter((a) => a.status === 'published').length;
  const draftCount = data.articles.filter((a) => a.status === 'draft').length;
  const scheduledCount = data.articles.filter((a) => a.status === 'scheduled').length;
  const totalViews = data.articles.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalComments = data.comments.length;
  const totalRegisteredUsers = data.users.length;

  res.json({
    stats: {
      totalArticles,
      publishedCount,
      draftCount,
      scheduledCount,
      totalViews,
      totalComments,
      totalRegisteredUsers
    },
    recentArticles: data.articles.slice(0, 5),
    recentLogs: data.auditLogs.slice(0, 10),
    users: data.users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }))
  });
});

// -------------------------------------------------------------
// Dev & Production Vite Handler
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[ALL GENRES] Full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
