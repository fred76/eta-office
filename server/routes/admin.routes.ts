import { Router } from 'express'
import { requireAdmin } from '../middleware/auth'
import { db } from '../db/client'
import { syncReceipts } from '../db/schema'
import { ships } from '../db/schema'
import { desc } from 'drizzle-orm'

export const adminRouter = Router()

adminRouter.get('/info', requireAdmin, (_req, res) => {
  res.json({
    uptime: process.uptime(),
    nodeVersion: process.version,
    env: process.env.NODE_ENV ?? 'development',
    port: process.env.PORT ?? 4000,
  })
})

adminRouter.get('/sync-log', requireAdmin, async (_req, res) => {
  try {
    const limit = Math.min(parseInt(_req.query['limit'] as string) || 50, 100)
    const rows = await db
      .select({
        id: syncReceipts.id,
        shipId: syncReceipts.shipId,
        shipName: ships.name,
        receivedAt: syncReceipts.receivedAt,
        success: syncReceipts.success,
        payloadSizeKb: syncReceipts.payloadSizeKb,
        errorMsg: syncReceipts.errorMsg,
      })
      .from(syncReceipts)
      .leftJoin(ships, ships.id.eq(syncReceipts.shipId))
      .orderBy(desc(syncReceipts.receivedAt))
      .limit(limit)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})