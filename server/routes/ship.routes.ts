import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import * as shipService from '../services/ship.service'

export const shipRouter = Router()

shipRouter.get('/:shipId/rotation', requireAuth, async (req, res) => {
  try {
    res.json(await shipService.getRotation(req.params['shipId'] as string))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

shipRouter.get('/:shipId/machinery', requireAuth, async (req, res) => {
  try {
    res.json(await shipService.getMachinery(req.params['shipId'] as string))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

shipRouter.get('/:shipId/noon', requireAuth, async (req, res) => {
  try {
    res.json(await shipService.getNoonPositions(req.params['shipId'] as string))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

shipRouter.get('/:shipId/mooring', requireAuth, async (req, res) => {
  try {
    res.json(await shipService.getMooring(req.params['shipId'] as string))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

shipRouter.get('/:shipId/sync-log', requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query['limit'] ?? 100)
    res.json(await shipService.getSyncLog(req.params['shipId'] as string, limit))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
