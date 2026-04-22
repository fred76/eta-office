import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config'

export interface AuthRequest extends Request {
  user?: { userId: number; role: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '').trim()
  if (!token) return void res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, CONFIG.JWT_SECRET) as AuthRequest['user']
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return void res.status(403).json({ error: 'Forbidden' })
  next()
}
