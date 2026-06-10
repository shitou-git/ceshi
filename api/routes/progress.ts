import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../auth.js';

const router = express.Router();

router.get('/', authRequired, (req, res) => {
  const u = (req as any).user;
  const entries = db
    .prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY created_at DESC LIMIT 100')
    .all(u.id);
  const totalWords = (db
    .prepare('SELECT COALESCE(SUM(items_completed),0) as s FROM progress WHERE user_id = ? AND activity_type = ?')
    .get(u.id, 'vocabulary') as any).s;
  const totalLessons = (db
    .prepare('SELECT COUNT(*) as s FROM progress WHERE user_id = ?')
    .get(u.id) as any).s;
  const weeklyRaw = db
    .prepare(
      "SELECT DATE(created_at) as date, SUM(score) as score FROM progress WHERE user_id = ? GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 14"
    )
    .all(u.id) as any[];
  const byLangRaw = db
    .prepare('SELECT COALESCE(language, 'en') as language, SUM(score) as score FROM progress WHERE user_id = ? GROUP BY language')
    .all(u.id) as any[];
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id) as any;
  res.json({
    entries,
    summary: {
      total_words_learned: totalWords,
      total_lessons_completed: totalLessons,
      total_minutes: Math.max(1, totalLessons * 5),
      streak_days: user?.streak_days || 1,
      weekly: weeklyRaw.reverse(),
      by_language: byLangRaw,
    },
  });
});

router.post('/', authRequired, (req, res) => {
  const u = (req as any).user;
  const { activity_type, score = 0, items_completed = 0, total_items = 0, language = 'en' } = req.body || {};
  if (!activity_type) return res.status(400).json({ message: '缺少 activity_type' });
  db.prepare(
    'INSERT INTO progress (user_id, activity_type, score, items_completed, total_items, language) VALUES (?,?,?,?,?,?)'
  ).run(u.id, activity_type, score, items_completed, total_items, language);
  if (score) db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(score, u.id);
  res.json({ ok: true });
});

export default router;
