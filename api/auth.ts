import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export const JWT_SECRET = process.env.JWT_SECRET || 'linguaverse-dev-secret-42';

export function signToken(userId: number, email: string) {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '30d' });
}

export function parseToken(auth?: string) {
  if (!auth) return null;
  const parts = auth.split(' ');
  const token = parts[1] || parts[0];
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: number; email: string };
  } catch {
    return null;
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const payload = parseToken(req.headers.authorization);
  if (!payload) return res.status(401).json({ message: '请先登录' });
  (req as any).user = { id: payload.sub, email: payload.email };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const payload = parseToken(req.headers.authorization);
  if (payload) (req as any).user = { id: payload.sub, email: payload.email };
  next();
}
