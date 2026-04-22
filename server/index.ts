import express from 'express'
import path from 'path'
import { CONFIG } from './config'
import { runMigrations } from './db/client'
import { authRouter } from './routes/auth.routes'
import { syncRouter } from './routes/sync.routes'
import { fleetRouter } from './routes/fleet.routes'
import { shipRouter } from './routes/ship.routes'
import { reportsRouter } from './routes/reports.routes'

const app = express()

app.use(express.json({ limit: '10mb' }))

runMigrations()

app.use('/api/auth',  authRouter)
app.use('/api/sync',  syncRouter)
app.use('/api/fleet', fleetRouter)
app.use('/api/ship',    shipRouter)
app.use('/api/reports', reportsRouter)

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'eta-office' }))

const distPath = path.resolve('./dist/eta-office/browser')
app.use(express.static(distPath))
app.use((_req, res) => res.sendFile(path.join(distPath, 'index.html')))

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`ETA Office server → http://${CONFIG.HOST}:${CONFIG.PORT}`)
})
