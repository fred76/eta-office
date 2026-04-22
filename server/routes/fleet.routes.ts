import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { requireAuth, requireAdmin } from '../middleware/auth'
import * as fleetService from '../services/fleet.service'
import { db } from '../db/client'
import { ships } from '../db/schema'
import crypto from 'crypto'

export const fleetRouter = Router()

fleetRouter.get('/', requireAuth, async (_req, res) => {
  try {
    res.json(await fleetService.getFleet())
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.get('/:shipId', requireAuth, async (req, res) => {
  try {
    const ship = await fleetService.getShipSummary(req.params['shipId'] as string)
    if (!ship) return void res.status(404).json({ error: 'Ship not found' })
    res.json(ship)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: register new ship
fleetRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id, name, imoNumber, flag, vesselType } = req.body
    if (!id || !name) return void res.status(400).json({ error: 'id and name required' })
    const syncToken = crypto.randomBytes(32).toString('hex')
    await db.insert(ships).values({ id, name, imoNumber, flag, vesselType, syncToken })
    res.status(201).json({ id, syncToken })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Admin: regenerate sync token
fleetRouter.post('/:shipId/regen-token', requireAuth, requireAdmin, async (req, res) => {
  try {
    const syncToken = crypto.randomBytes(32).toString('hex')
    await db.update(ships)
      .set({ syncToken })
      .where(eq(ships.id, req.params['shipId'] as string))
    res.json({ syncToken })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
