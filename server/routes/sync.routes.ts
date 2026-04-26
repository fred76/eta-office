import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { db } from '../db/client'
import { processSyncPayload, SyncVersionMismatchError } from '../services/sync.receiver'
import type { SyncResponse } from '../../shared/sync.types'

export const syncRouter = Router()

// Authenticate by ship sync_token (Bearer)
syncRouter.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '').trim()
    if (!token) return void res.status(401).json({ error: 'Missing sync token' })
    const ship = await db.query.ships.findFirst({
      where: (s, { eq }) => eq(s.syncToken, token),
    })
    if (!ship) return void res.status(401).json({ error: 'Invalid sync token' })
    ;(req as any).ship = ship
    next()
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Rate limit: max 2 syncs / 2 min per ship
const syncLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 2,
  keyGenerator: (req) => (req as any).ship?.id ?? 'unknown',
  handler: (_req, res) => {
    res.status(429).json({ ok: false, error: 'Rate limit exceeded — max 1 sync/min per ship' })
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
})

// Zod validation — matches new SyncPayload
const SyncPayloadSchema = z.object({
  shipId:      z.string().min(1),
  fromVersion: z.number().int().min(0),
  toVersion:   z.number().int().min(0),
  syncedAt:    z.string().min(1),
  rotation:    z.any().nullable(),
  machinery:   z.any().nullable(),
  noon: z.object({
    upserts:    z.array(z.any()),
    deletedIds: z.array(z.string()),
  }).nullable(),
  mooring: z.object({
    items: z.array(z.any()),
    lines: z.array(z.any()),
  }).nullable(),
  sailingDirection: z.object({
    ports: z.array(z.any()),
  }).nullable().optional(),
})

syncRouter.get('/info', (_req, res) => {
  res.json({
    uptime: process.uptime(),
    nodeVersion: process.version,
    env: process.env['NODE_ENV'] ?? 'development',
  })
})

syncRouter.post('/', syncLimiter, async (req, res, next) => {
  const ship = (req as any).ship
  const parsed = SyncPayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    return void res.status(400).json({ ok: false, error: parsed.error.flatten() })
  }
  try {
    await processSyncPayload(ship.id, parsed.data as any)
    res.json({ ok: true, receivedAt: new Date().toISOString() } satisfies SyncResponse)
  } catch (err: any) {
    if (err instanceof SyncVersionMismatchError) {
      return void res.status(409).json({
        ok: false,
        needsFullSync: true,
        lastKnownVersion: err.lastKnown,
      } satisfies SyncResponse)
    }
    next(err)
  }
})
