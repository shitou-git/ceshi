import express from 'express';
import { db } from '../db.js';
import { authRequired } from '../auth.js';

const router = express.Router();

router.get('/', authRequired, (req, res) => {
  const u = (req as any).user;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id) as any;
  const lang = user?.target_language || 'en';
  const level = user?.level || 'A1';
  const recs: any[] = [];
  const course = db.prepare('SELECT * FROM courses WHERE language = ? ORDER BY id DESC LIMIT 3').all(lang) as any[];
  course.forEach((c, i) => {
    recs.push({
      id: `course-${c.id}`,
      title: c.title,
      subtitle: `${c.language_label} · ${c.level}`,
      type: 'course',
      reason: '基于你的目标语言推荐',
    });
  });
  recs.push({
    id: 'vocab-daily', title: '今日单词', subtitle: `${lang.toUpperCase()} · 15 分钟', type: 'vocabulary', reason: '每日词汇学习', });
  recs.push({
    id: 'grammar-daily', title: '语法热身', subtitle: `${level} · 10 分钟', type: 'grammar', reason: '匹配当前水平语法训练', });
  recs.push({
    id: 'listening-daily', title: '听力训练', subtitle: `${lang.toUpperCase()} · 20 分钟`, type: 'listening', reason: '精听 + 泛听结合', });
  recs.push({
    id: 'speaking-daily', title: '口语跟读', subtitle: `${lang.toUpperCase()} · 10 分钟`, type: 'speaking', reason: '提升流利度', });
  res.json({ recommendations: recs });
});

export default router;
