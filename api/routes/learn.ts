import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../auth.js';

const router = express.Router();

router.get('/vocabulary', (req, res) => {
  const { language = 'en', limit = 30 } = req.query;
  const words = db
    .prepare(
      'SELECT id, word, translation, pronunciation, example, language FROM vocabulary WHERE language = ? ORDER BY RANDOM() LIMIT ?'
    )
    .all(language, Number(limit));
  res.json({ vocabulary: words });
});

router.get('/grammar', (req, res) => {
  const { language = 'en', limit = 10 } = req.query;
  const rows = db
    .prepare('SELECT * FROM grammar_quizzes WHERE language = ? ORDER BY RANDOM() LIMIT ?')
    .all(language, Number(limit)) as any[];
  const quizzes = rows.map((r) => ({
    ...r,
    options: JSON.parse(r.options || '[]'),
  }));
  res.json({ quizzes });
});

router.get('/listening', (req, res) => {
  const { language = 'en' } = req.query;
  const items = db.prepare('SELECT * FROM listening_materials WHERE language = ?').all(language);
  res.json({ items });
});

router.post('/report', authRequired, (req, res) => {
  const u = (req as any).user;
  const { activity_type, score, items_completed, total_items, language } = req.body || {};
  if (!activity_type) return res.status(400).json({ message: '缺少 activity_type' });
  db.prepare(
    'INSERT INTO progress (user_id, activity_type, score, items_completed, total_items, language) VALUES (?,?,?,?,?,?)'
  ).run(u.id, activity_type, score || 0, items_completed || 0, total_items || 0, language || 'en');
  if (score && typeof score === 'number') {
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(score, u.id);
  }
  // checkAchievements(u.id);
  res.json({ ok: true });
});

function checkAchievements(userId: number) {
  const totals: Record<string, number> = {
    vocabulary: 0,
    grammar: 0,
    listening: 0,
    speaking: 0,
    streak: 1,
    posts: 0,
    xp: 0,
  };
  const progressRows = db.prepare('SELECT activity_type, COUNT(*) as c FROM progress WHERE user_id = ? GROUP BY activity_type')
    .all(userId) as any[];
  for (const r of progressRows) totals[r.activity_type] = r.c;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (user) totals.xp = user.xp || 0;
  totals.streak = user?.streak_days || 0;
  const postsCount = db.prepare('SELECT COUNT(*) as c FROM posts WHERE user_id = ?').get(userId) as any;
  totals.posts = postsCount.c;
  const achievements = db.prepare('SELECT * FROM achievements').all() as any[];
  const insertUnlock = db.prepare(
    'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)'
  );
  for (const a of achievements) {
    if ((totals[a.requirement_type] || 0) >= a.requirement_value) {
      insertUnlock.run(userId, a.id);
    }
  }
}

export default router;
