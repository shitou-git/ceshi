import express from 'express';
import { db } from '../db.js';
import { optionalAuth } from '../auth.js';

const router = express.Router();

router.get('/', optionalAuth, (req, res) => {
  const { language, level } = req.query;
  let sql = 'SELECT * FROM courses WHERE 1=1';
  const params: any[] = [];
  if (language && language !== 'all') { sql += ' AND language = ?'; params.push(language); }
  if (level && level !== 'all') { sql += ' AND level = ?'; params.push(level); }
  const rows = db.prepare(sql).all(...params);
  res.json({ courses: rows });
});

router.get('/:id', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(Number(req.params.id));
  if (!course) return res.status(404).json({ message: '课程不存在' });
  const lessons = db.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(course.id);
  res.json({ course, lessons });
});

export default router;
