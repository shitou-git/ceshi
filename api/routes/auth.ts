import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authRequired } from '../auth.js';

const router = express.Router();

function toUserRow(row: any) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    avatar: row.avatar,
    target_language: row.target_language,
    level: row.level,
    streak_days: row.streak_days || 0,
    xp: row.xp || 0,
    last_active: row.last_active,
    created_at: row.created_at,
  };
}

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ message: '请填写完整信息' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: '密码至少 6 位' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (exists) return res.status(400).json({ message: '邮箱或用户名已存在' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (email, username, password_hash, avatar) VALUES (?,?,?,?)')
    .run(email, username, hash, `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(username)}`);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(Number(user.id), user.email);
  res.json({ token, user: toUserRow(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: '请输入邮箱和密码' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: '邮箱或密码错误' });
  }
  db.prepare('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  const fresh = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const token = signToken(Number(user.id), user.email);
  res.json({ token, user: toUserRow(fresh) });
});

router.get('/profile', authRequired, (req, res) => {
  const u = (req as any).user;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id);
  if (!user) return res.status(404).json({ message: '用户不存在' });
  res.json({ user: toUserRow(user) });
});

router.put('/profile', authRequired, (req, res) => {
  const u = (req as any).user;
  const { username, avatar, target_language, level } = req.body || {};
  const updates: string[] = [];
  const values: any[] = [];
  if (typeof username === 'string') { updates.push('username = ?'); values.push(username); }
  if (typeof avatar === 'string') { updates.push('avatar = ?'); values.push(avatar); }
  if (typeof target_language === 'string') { updates.push('target_language = ?'); values.push(target_language); }
  if (typeof level === 'string') { updates.push('level = ?'); values.push(level); }
  values.push(u.id);
  if (updates.length) {
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(u.id);
  res.json({ user: toUserRow(user) });
});

export default router;
