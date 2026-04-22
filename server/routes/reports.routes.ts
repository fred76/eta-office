import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getFleetReport } from '../services/report.service'

export const reportsRouter = Router()

reportsRouter.get('/', requireAuth, async (_req, res) => {
  try {
    res.json(await getFleetReport())
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
