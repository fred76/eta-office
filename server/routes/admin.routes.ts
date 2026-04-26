import { Router } from 'express'
import { exec } from 'child_process'
import { eq, desc, sql } from 'drizzle-orm'
import { requireAuth, requireAdmin } from '../middleware/auth'
import { db } from '../db/client'
import {
  ships, syncReceipts,
  rotationLatest, machineryLatest,
  noonPositions, noonTemplates,
  mooringLatest, sailingDirectionLatest,
} from '../db/schema'

export const adminRouter = Router()

adminRouter.use(requireAuth)

adminRouter.get('/info', requireAdmin, (_req, res) => {
  exec('pm2 jlist', (err, stdout) => {
    let pm2Info: { mode: string; restarts: number; status: string; cpu: string; memory: string } | null = null
    if (!err) {
      try {
        const list: any[] = JSON.parse(stdout)
        const proc = list.find(p => p.name === 'eta-office')
        if (proc) {
          pm2Info = {
            mode:     proc.pm2_env?.exec_mode ?? '—',
            restarts: proc.pm2_env?.restart_time ?? 0,
            status:   proc.pm2_env?.status ?? '—',
            cpu:      `${proc.monit?.cpu ?? 0}%`,
            memory:   `${Math.round((proc.monit?.memory ?? 0) / 1024 / 1024 * 10) / 10} MB`,
          }
        }
      } catch { /* pm2 not available */ }
    }
    res.json({
      uptime: process.uptime(),
      nodeVersion: process.version,
      env: process.env['NODE_ENV'] ?? 'development',
      port: Number(process.env['PORT']) ?? 4000,
      pm2: pm2Info,
    })
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
      .leftJoin(ships, eq(ships.id, syncReceipts.shipId))
      .orderBy(desc(syncReceipts.receivedAt))
      .limit(limit)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

adminRouter.get('/ships', requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select({
      id: ships.id,
      name: ships.name,
      imoNumber: ships.imoNumber,
      flag: ships.flag,
      vesselType: ships.vesselType,
      lastSyncAt: ships.lastSyncAt,
      active: ships.active,
      forceFullSync: ships.forceFullSync,
    }).from(ships).orderBy(ships.name)
    res.json(rows)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

adminRouter.post('/ships/:shipId/request-sync', requireAdmin, async (req, res) => {
  try {
    const id = req.params['shipId'] as string
    const ship = await db.query.ships.findFirst({ where: (s, { eq }) => eq(s.id, id) })
    if (!ship) return void res.status(404).json({ error: 'Ship not found' })
    const next = ship.forceFullSync ? 0 : 1
    await db.update(ships).set({ forceFullSync: next }).where(eq(ships.id, id))
    res.json({ ok: true, forceFullSync: next })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

adminRouter.post('/restart', requireAdmin, (_req, res) => {
  res.json({ ok: true })
  setTimeout(() => process.exit(0), 200)
})

adminRouter.patch('/ships/:shipId/status', requireAdmin, async (req, res) => {
  try {
    const { active } = req.body as { active: boolean }
    await db.update(ships)
      .set({ active: active ? 1 : 0 })
      .where(eq(ships.id, req.params['shipId'] as string))
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

adminRouter.delete('/ships/:shipId', requireAdmin, async (req, res) => {
  try {
    const id = req.params['shipId'] as string
    await db.delete(syncReceipts).where(eq(syncReceipts.shipId, id))
    await db.delete(rotationLatest).where(eq(rotationLatest.shipId, id))
    await db.run(sql`DELETE FROM rotation_snapshots WHERE ship_id = ${id}`)
    await db.delete(machineryLatest).where(eq(machineryLatest.shipId, id))
    await db.delete(noonPositions).where(eq(noonPositions.shipId, id))
    await db.delete(noonTemplates).where(eq(noonTemplates.shipId, id))
    await db.delete(mooringLatest).where(eq(mooringLatest.shipId, id))
    await db.run(sql`DELETE FROM mooring_snapshots WHERE ship_id = ${id}`)
    await db.delete(sailingDirectionLatest).where(eq(sailingDirectionLatest.shipId, id))
    await db.delete(ships).where(eq(ships.id, id))
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
