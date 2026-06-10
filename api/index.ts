import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import learnRoutes from './routes/learn.js';
import progressRoutes from './routes/progress.js';
import communityRoutes from './routes/community.js';
import achievementRoutes from './routes/achievements.js';
import recRoutes from './routes/recommendations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
initDB();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => res.json({ ok: true, time: Date.now() }));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/recommendations', recRoutes);

// Serve frontend static files (built by Vite)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - all non-API routes go to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || '服务器错误' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`[LinguaVerse] Server running on http://localhost:${PORT}`);
});

export default app;