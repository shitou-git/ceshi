import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import learnRoutes from './routes/learn.js';
import progressRoutes from './routes/progress.js';
import communityRoutes from './routes/community.js';
import achievementRoutes from './routes/achievements.js';
import recRoutes from './routes/recommendations.js';

initDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, time: Date.now() }));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/recommendations', recRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: err.message || '服务器错误' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`[LinguaVerse] API running on http://localhost:${PORT}`);
});

export default app;
