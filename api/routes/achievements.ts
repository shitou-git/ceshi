import express from 'express';
import { db } from '../db.js';
import { authRequired, optionalAuth } from '../auth.js';

const router = express.Router();

router.get('/', optionalAuth, (req, res) => {
  const u = (req as any).user;
  const achvs = db.prepare('SELECT * FROM achievements').all() as any[];
  const totals: Record<string, number> = {};
  if (u) {
    const pRows = db.prepare('SELECT activity_type, COUNT(*) as c FROM progress WHERE user_id = ? GROUP BY activity_type').all(u.id) as any[];
    for (const r of pRows) totals[r.activity_type] = r.c;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id) as any;
    totals.xp = user?.xp || 0;
    totals.streak = user?.streak_days || 0;
    const postsC = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(u.id) as any;
    totals.posts = postsC.c;
  }
  const list = achvs.map((a) => {
    const current = totals[a.requirement_type] || 0;
    const unlocked = u
      ? !!db.prepare('SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(u.id, a.id)
      : false;
    return { ...a, unlocked, progress: Math.min(100, Math.round((current / a.requirement_value) * 100) };
  });
  res.json({ achievements: list });
});

export default router;
