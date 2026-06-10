import express from 'express';
import { db } from '../db.js';
import { authRequired, optionalAuth } from '../auth.js';

const router = express.Router();

function rowToPost(row: any, userId?: number) {
  const liked = userId
    ? (db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(row.id, userId) ? true : false)
    : false;
  const comments = (db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ?').get(row.id) as any).c;
  return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    avatar: row.avatar,
    title: row.title,
    content: row.content,
    language: row.language,
    likes: row.likes,
    comments_count: comments,
    created_at: row.created_at,
    liked,
  };
}

router.get('/', optionalAuth, (req, res) => {
  const u = (req as any).user;
  const { language } = req.query;
  let sql = `SELECT p.*, users.username, users.avatar FROM posts p JOIN users ON users.id = p.user_id WHERE 1=1`;
  const params: any[] = [];
  if (language && language !== 'all') { sql += ' AND p.language = ?'; params.push(language); }
  sql += ' ORDER BY p.created_at DESC LIMIT 50';
  const rows = db.prepare(sql).all(...params);
  res.json({ posts: rows.map((r) => rowToPost(r, u?.id)) });
});

router.post('/', authRequired, (req, res) => {
  const u = (req as any).user;
  const { title, content, language = 'general' } = req.body || {};
  if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' });
  const info = db
    .prepare('INSERT INTO posts (user_id, title, content, language) VALUES (?,?,?,?)')
    .run(u.id, title, content, language);
  const row = db.prepare('SELECT p.*, users.username, users.avatar FROM posts p JOIN users ON users.id = p.user_id WHERE p.id = ?').get(info.lastInsertRowid);
  res.json({ post: rowToPost(row, u.id) });
});

router.post('/:id/like', authRequired, (req, res) => {
  const u = (req as any).user;
  const postId = Number(req.params.id);
  const existing = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, u.id);
  if (existing) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, u.id);
    db.prepare('UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?').run(postId);
  } else {
    db.prepare('INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?,?)').run(postId, u.id);
    db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(postId);
  }
  const row = db.prepare('SELECT p.*, users.username, users.avatar FROM posts p JOIN users ON users.id = p.user_id WHERE p.id = ?').get(postId);
  res.json({ post: rowToPost(row, u.id) });
});

router.get('/:id/comments', (req, res) => {
  const rows = db
    .prepare(
      'SELECT c.*, users.username, users.avatar FROM comments c JOIN users ON users.id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at DESC'
    )
    .all(Number(req.params.id));
  res.json({ comments: rows });
});

router.post('/:id/comments', authRequired, (req, res) => {
  const u = (req as any).user;
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ message: '评论内容不能为空' });
  const info = db
    .prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?,?,?)')
    .run(Number(req.params.id), u.id, content);
  const row = db
    .prepare('SELECT c.*, users.username, users.avatar FROM comments c JOIN users ON users.id = c.user_id WHERE c.id = ?')
    .get(info.lastInsertRowid);
  res.json({ comment: row });
});

export default router;
