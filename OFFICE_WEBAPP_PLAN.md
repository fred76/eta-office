# ETA Office — Piano di sviluppo: App di terra (multi-nave, read-only)

## Obiettivo

Costruire da zero un'applicazione web per l'**ufficio di terra** che:
- Riceve dati da N navi via sync **incrementale** ogni 4 ore (solo righe modificate)
- Mostra dati in **sola lettura** (nessuna modifica ammessa)
- Gestisce una flotta di più navi
- Dashboard con stato sintetico di ogni nave
- Accesso via browser da qualsiasi PC dell'ufficio

**Software usato: 100% open source.**

---

## Architettura

```
[Nave 1 — Node.js ETA Ship]  ──POST /api/sync──┐
[Nave 2 — Node.js ETA Ship]  ──POST /api/sync──┤
[Nave N — ...]               ──POST /api/sync──┤
                                                ↓
                              [Server ufficio — Node.js + Express]
                                ├── REST API  /api/*
                                ├── SQLite locale  (better-sqlite3, multi-nave via ship_id)
                                └── Angular 19 SPA (read-only)

[Browser ufficio — qualsiasi PC]
  └── http://<IP_UFFICIO>:4000
```

---

## Come usare questo documento

1. **Leggi prima** `SHIP_WEBAPP_REFACTORING.md` — condivide modelli, stile e il formato del payload sync.
2. **Crea un nuovo progetto Angular** separato (`ng new eta-office`) — non modificare il repo nave.
3. Segui le sezioni nell'ordine: Stack → Schema DB → Backend → Frontend → Deploy.
4. Regola generale: crea prima il route Express, poi il service Angular, poi il componente HTML.
5. Stile: copia `custom-theme.scss`, `tailwind.config.js` e `styles.css` dal progetto nave.

---

## Stack tecnologico

| Layer | Tecnologia | Licenza |
|-------|-----------|---------|
| Frontend | Angular 19 (nuovo progetto standalone) | MIT |
| UI | Angular Material + TailwindCSS + DaisyUI | MIT |
| Server | Node.js 20 LTS + Express 5 | MIT |
| Database | SQLite via `better-sqlite3` | MIT |
| Auth | `jsonwebtoken` + `bcrypt` | MIT |
| Validazione | `zod` | MIT |
| Rate limiting | `express-rate-limit` | MIT |
| Logging | `pino` + `pino-pretty` | MIT |
| Config env | `dotenv` | MIT |
| Process manager | PM2 | AGPL |
| Charts | Apache ECharts (`ngx-echarts`) | Apache 2.0 |
| PDF export | `jsPDF` + `jspdf-autotable` (lato **client**) | MIT |
| Excel export | `exceljs` (lato **client**) | MIT |

```bash
npm install express better-sqlite3 jsonwebtoken bcrypt zod express-rate-limit \
            pino pino-pretty dotenv multer
npm install -D @types/express @types/better-sqlite3 @types/jsonwebtoken \
               @types/bcrypt @types/multer tsx concurrently
```

> **Export PDF/Excel lato client**: il componente ufficio riceve `rotation` e `machinery` via
> signal — usa jsPDF/exceljs nel browser, nessun roundtrip server necessario.

---

## Stile grafico — identico alla nave

```bash
cp ../ETA/src/custom-theme.scss       src/custom-theme.scss
cp ../ETA/src/styles.css              src/styles.css
cp ../ETA/tailwind.config.js          tailwind.config.js
cp ../ETA/src/app/features/shared/    src/app/shared/  -r
```

**`tailwind.config.js`** (identico nave):
```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      naval: {
        "primary":   "#0f172a",
        "secondary": "#334155",
        "accent":    "#38bdf8",
        "neutral":   "#1e293b",
        "base-100":  "#f1f5f9",
        "base-200":  "#e2e8f0",
        "base-300":  "#cbd5e1",
        "info":      "#0ea5e9",
        "success":   "#22c55e",
        "warning":   "#f59e0b",
        "error":     "#ef4444",
      }
    }],
    darkTheme: false,
  },
}
```

---

## Pattern MVC

### Lato server (Express)

```
Model      → Drizzle schema / query functions  (server/db/)
Controller → Route handlers (server/routes/*.routes.ts)   — nessuna logica, solo delega
Service    → Business logic pura (server/services/*.service.ts)   — nessun req/res
```

```typescript
// ✅ Corretto — controller magro
shipRouter.get('/:shipId/rotation', requireAuth, (req, res, next) => {
  try {
    res.json(shipService.getRotation(req.params.shipId))
  } catch (e) { next(e) }
})

// ✅ Corretto — service con logica
export function getRotation(shipId: string) {
  const row = getDb().prepare('SELECT data FROM rotation_latest WHERE ship_id = ?').get(shipId) as any
  return row ? JSON.parse(row.data) : null
}
```

### Lato client (Angular)

```
Component  → solo coordinazione UI, legge signals dal service
Service    → stato con Angular Signals + chiamate HTTP via ApiService
ApiService → wrapper HTTP puro, nessuno stato
```

```typescript
// ✅ Corretto — component magro
export class ShipRotationComponent {
  private shipSvc = inject(ShipService)
  rotation = this.shipSvc.$rotation
  ngOnInit() { this.shipSvc.loadRotation(this.shipId) }
}

// ✅ Corretto — service con stato
@Injectable({ providedIn: 'root' })
export class ShipService {
  private api = inject(ApiService)
  $rotation = signal<RotationModel | null>(null)
  async loadRotation(shipId: string) {
    this.$rotation.set(await this.api.getRotation(shipId))
  }
}
```

---

## Struttura directory

```
ETA-Office/
├── shared/                       # Tipi condivisi con app nave (copiati o npm workspace)
│   ├── rotation-machinery.interface.ts
│   ├── noon-position.model.ts
│   ├── mooring-line.model.ts
│   └── sync.types.ts             # SyncPayload + SyncResponse
│
├── src/
│   └── app/
│       ├── core/
│       │   ├── models/           # Re-export da shared/
│       │   ├── service/
│       │   │   ├── api.service.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── fleet.service.ts
│       │   │   └── ship.service.ts
│       │   └── guards/
│       │       └── auth.guard.ts
│       ├── features/
│       │   ├── auth/
│       │   │   ├── login.component.ts
│       │   │   └── login.component.html
│       │   ├── dashboard/
│       │   │   ├── dashboard.component.ts
│       │   │   └── dashboard.component.html
│       │   ├── fleet/
│       │   │   ├── fleet.component.ts
│       │   │   └── fleet.component.html
│       │   └── ship-detail/
│       │       ├── ship-detail.component.ts
│       │       ├── ship-detail.component.html
│       │       ├── rotation/
│       │       │   ├── ship-rotation.component.ts
│       │       │   └── ship-rotation.component.html
│       │       ├── noon/
│       │       │   ├── ship-noon.component.ts
│       │       │   └── ship-noon.component.html
│       │       ├── mooring/
│       │       │   ├── ship-mooring.component.ts
│       │       │   └── ship-mooring.component.html
│       │       └── sync-log/
│       │           ├── sync-log.component.ts
│       │           └── sync-log.component.html
│       └── shared/
│           ├── sync-badge.component.ts
│           ├── traffic-light.component.ts
│           └── ship-header.component.ts
│
├── server/
│   ├── index.ts
│   ├── app.ts
│   ├── config.ts
│   ├── db/
│   │   ├── client.ts
│   │   └── schema.ts
│   ├── routes/
│   │   ├── sync.routes.ts        # Riceve POST da navi
│   │   ├── fleet.routes.ts
│   │   ├── ship.routes.ts
│   │   └── auth.routes.ts
│   └── services/
│       ├── sync.receiver.ts
│       ├── fleet.service.ts
│       └── ship.service.ts
│
├── data/
│   └── eta-office.db
├── package.json
├── tsconfig.server.json
├── .env.example
└── README.md
```

---

## Tipi condivisi nave ↔ ufficio

Copiare `shared/sync.types.ts` dal repo nave (o usare npm workspaces se monorepo).
**Non modificare** le interfacce modello — devono essere identiche a quelle nave per deserializzare
il payload senza trasformazioni.

```typescript
// shared/sync.types.ts
export interface SyncPayload {
  shipId:      string
  fromVersion: number       // 0 = full resync
  toVersion:   number
  syncedAt:    string
  rotation:    RotationModel  | null
  machinery:   MachineryModel | null
  noon: {
    upserts:    NoonPosition[]
    deletedIds: string[]
  } | null
  mooring: {
    items: MooringItem[]
    lines: MooringLine[]
  } | null
}

export interface SyncResponse {
  ok:               boolean
  receivedAt?:      string
  needsFullSync?:   boolean
  lastKnownVersion?: number
  error?:           string
}
```

---

## Database SQLite — Schema

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Registry navi autorizzate
CREATE TABLE IF NOT EXISTS ships (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  imo_number           TEXT,
  flag                 TEXT,
  vessel_type          TEXT,
  sync_token           TEXT NOT NULL UNIQUE,
  last_sync_at         TEXT,
  last_received_version INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT DEFAULT (datetime('now'))
);

-- Utenti ufficio
CREATE TABLE IF NOT EXISTS office_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer',  -- viewer | admin
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Storico sync ricevuti
CREATE TABLE IF NOT EXISTS sync_receipts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  ship_id         TEXT REFERENCES ships(id),
  received_at     TEXT DEFAULT (datetime('now')),
  payload_size_kb INTEGER,
  from_version    INTEGER,
  to_version      INTEGER,
  success         INTEGER NOT NULL,
  error_msg       TEXT
);

-- Rotation corrente per nave (solo latest, nessuno storico — è un preplanning)
CREATE TABLE IF NOT EXISTS rotation_latest (
  ship_id     TEXT PRIMARY KEY REFERENCES ships(id),
  snapshot_at TEXT,
  data        TEXT NOT NULL                       -- JSON RotationModel
);

-- Machinery corrente per nave
CREATE TABLE IF NOT EXISTS machinery_latest (
  ship_id     TEXT PRIMARY KEY REFERENCES ships(id),
  snapshot_at TEXT,
  data        TEXT NOT NULL                       -- JSON MachineryModel
);

-- Noon positions (tutte le entry di tutte le navi, upsert per UUID)
CREATE TABLE IF NOT EXISTS noon_positions (
  id          TEXT NOT NULL,
  ship_id     TEXT NOT NULL REFERENCES ships(id),
  received_at TEXT DEFAULT (datetime('now')),
  date        TEXT,                               -- estratto da data entry, indicizzato
  deleted     INTEGER NOT NULL DEFAULT 0,         -- soft delete
  data        TEXT NOT NULL,                      -- JSON NoonPosition
  PRIMARY KEY (ship_id, id)
);

-- Custom template noon per nave
CREATE TABLE IF NOT EXISTS noon_templates (
  ship_id TEXT PRIMARY KEY REFERENCES ships(id),
  fields  TEXT NOT NULL                           -- JSON array NoonCustomField
);

-- Mooring latest per nave
CREATE TABLE IF NOT EXISTS mooring_latest (
  ship_id     TEXT PRIMARY KEY REFERENCES ships(id),
  snapshot_at TEXT,
  items       TEXT NOT NULL,
  lines       TEXT NOT NULL
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_noon_positions_ship  ON noon_positions(ship_id, deleted, date DESC);
CREATE INDEX IF NOT EXISTS idx_sync_receipts_ship   ON sync_receipts(ship_id, received_at DESC);
```

---

## Backend Express

### `server/config.ts`

```typescript
import { config } from 'dotenv'
config()

export const CONFIG = {
  PORT:       Number(process.env['PORT']       ?? 4000),
  HOST:       process.env['HOST']              ?? '0.0.0.0',
  DB_PATH:    process.env['DB_PATH']           ?? './data/eta-office.db',
  JWT_SECRET: process.env['JWT_SECRET']        ?? 'cambia-questo-in-produzione',
  JWT_EXPIRY: process.env['JWT_EXPIRY']        ?? '8h',
}
```

### `server/app.ts`

```typescript
import express, { NextFunction, Request, Response } from 'express'
import path    from 'path'
import pino    from 'pino'
import { syncRouter }  from './routes/sync.routes'
import { fleetRouter } from './routes/fleet.routes'
import { shipRouter }  from './routes/ship.routes'
import { authRouter }  from './routes/auth.routes'

const logger = pino({ transport: { target: 'pino-pretty' } })

export function createApp() {
  const app = express()
  app.use(express.json({ limit: '10mb' }))

  app.use('/api/auth',  authRouter)
  app.use('/api/sync',  syncRouter)
  app.use('/api/fleet', fleetRouter)
  app.use('/api/ship',  shipRouter)

  const distPath = path.resolve('./dist/eta-office/browser')
  app.use(express.static(distPath))
  app.get('*splat', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))

  // Error middleware globale
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err)
    res.status(500).json({ error: err.message })
  })

  return app
}
```

### `server/db/client.ts`

```typescript
import Database from 'better-sqlite3'
import { CONFIG } from '../config'
import { mkdirSync } from 'fs'
import path from 'path'

let _db: Database.Database

export function initDb() {
  mkdirSync(path.dirname(CONFIG.DB_PATH), { recursive: true })
  _db = new Database(CONFIG.DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  _db.exec(SCHEMA_SQL)   // SCHEMA_SQL = tutte le CREATE TABLE IF NOT EXISTS sopra
}

export function getDb(): Database.Database {
  if (!_db) throw new Error('DB not initialized')
  return _db
}
```

---

### Sync receiver

#### `server/routes/sync.routes.ts`

```typescript
import { Router }          from 'express'
import rateLimit           from 'express-rate-limit'
import { z }               from 'zod'
import { getDb }           from '../db/client'
import { processSyncPayload, SyncVersionMismatchError } from '../services/sync.receiver'

export const syncRouter = Router()

// Rate limit: max 2 richieste/minuto per nave (IP-based, adatto a LAN nave)
const syncLimiter = rateLimit({ windowMs: 60_000, max: 2, standardHeaders: true })
syncRouter.use(syncLimiter)

// Autenticazione via token nave
syncRouter.use((req, res, next) => {
  const token = (req.headers['authorization'] ?? '').toString().replace('Bearer ', '').trim()
  const ship  = getDb().prepare('SELECT * FROM ships WHERE sync_token = ?').get(token) as any
  if (!ship) return res.status(401).json({ error: 'Invalid sync token' })
  ;(req as any).ship = ship
  next()
})

// Validazione Zod payload
const SyncPayloadSchema = z.object({
  shipId:      z.string(),
  fromVersion: z.number().int().min(0),
  toVersion:   z.number().int().min(0),
  syncedAt:    z.string(),
  rotation:    z.any().nullable(),
  machinery:   z.any().nullable(),
  noon:        z.object({
    upserts:    z.array(z.any()),
    deletedIds: z.array(z.string()),
  }).nullable(),
  mooring:     z.object({
    items: z.array(z.any()),
    lines: z.array(z.any()),
  }).nullable(),
})

syncRouter.post('/', (req, res, next) => {
  const ship = (req as any).ship
  const parsed = SyncPayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() })
  }
  try {
    processSyncPayload(ship.id, parsed.data as any)
    res.json({ ok: true, receivedAt: new Date().toISOString() } satisfies SyncResponse)
  } catch (err: any) {
    if (err instanceof SyncVersionMismatchError) {
      return res.status(409).json({
        ok: false,
        needsFullSync: true,
        lastKnownVersion: err.lastKnown,
      } satisfies SyncResponse)
    }
    next(err)
  }
})
```

#### `server/services/sync.receiver.ts`

```typescript
import { getDb } from '../db/client'
import type { SyncPayload } from '../../shared/sync.types'

export class SyncVersionMismatchError extends Error {
  constructor(public lastKnown: number, received: number) {
    super(`Version mismatch: expected ${lastKnown}, got fromVersion=${received}`)
  }
}

export function processSyncPayload(shipId: string, payload: SyncPayload) {
  const db  = getDb()
  const now = new Date().toISOString()

  // Validazione versione incrementale
  const ship = db.prepare('SELECT last_received_version FROM ships WHERE id = ?').get(shipId) as any
  if (payload.fromVersion !== 0 && payload.fromVersion !== ship.last_received_version) {
    throw new SyncVersionMismatchError(ship.last_received_version, payload.fromVersion)
  }

  db.transaction(() => {
    // Rotation — solo latest, nessuno storico (è un preplanning)
    if (payload.rotation) {
      db.prepare('INSERT OR REPLACE INTO rotation_latest (ship_id, snapshot_at, data) VALUES (?,?,?)')
        .run(shipId, now, JSON.stringify(payload.rotation))
    }

    // Machinery — solo latest
    if (payload.machinery) {
      db.prepare('INSERT OR REPLACE INTO machinery_latest (ship_id, snapshot_at, data) VALUES (?,?,?)')
        .run(shipId, now, JSON.stringify(payload.machinery))
    }

    // Noon — incrementale: upsert per UUID + soft delete
    if (payload.noon) {
      const upsert = db.prepare(
        `INSERT OR REPLACE INTO noon_positions (id, ship_id, received_at, date, data, deleted)
         VALUES (?,?,?,?,?,0)`
      )
      for (const entry of payload.noon.upserts) {
        // Estrai date per l'indice (campo 'date' di NoonPosition)
        upsert.run(entry.id, shipId, now, entry.date ?? null, JSON.stringify(entry))
      }
      if (payload.noon.deletedIds.length > 0) {
        const markDeleted = db.prepare(
          'UPDATE noon_positions SET deleted = 1 WHERE id = ? AND ship_id = ?'
        )
        for (const id of payload.noon.deletedIds) markDeleted.run(id, shipId)
      }
    }

    // Mooring — dataset piccolo, sempre full replace se presente
    if (payload.mooring) {
      db.prepare('INSERT OR REPLACE INTO mooring_latest (ship_id, snapshot_at, items, lines) VALUES (?,?,?,?)')
        .run(shipId, now, JSON.stringify(payload.mooring.items), JSON.stringify(payload.mooring.lines))
    }

    // Aggiorna versione e last_sync_at
    db.prepare('UPDATE ships SET last_received_version = ?, last_sync_at = ? WHERE id = ?')
      .run(payload.toVersion, now, shipId)

    // Log sync
    db.prepare(`INSERT INTO sync_receipts
      (ship_id, received_at, from_version, to_version, success, payload_size_kb)
      VALUES (?,?,?,?,1,?)`)
      .run(shipId, now, payload.fromVersion, payload.toVersion,
           Math.round(JSON.stringify(payload).length / 1024))
  })()
}
```

---

### Auth

#### `server/routes/auth.routes.ts`

```typescript
import { Router } from 'express'
import bcrypt     from 'bcrypt'
import jwt        from 'jsonwebtoken'
import { z }      from 'zod'
import { CONFIG } from '../config'
import { getDb }  from '../db/client'

export const authRouter = Router()

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body)
    const user = getDb().prepare('SELECT * FROM office_users WHERE email = ?').get(email) as any
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, CONFIG.JWT_SECRET, {
      expiresIn: CONFIG.JWT_EXPIRY,
    })
    res.json({ token, role: user.role })
  } catch (e) { next(e) }
})
```

**Middleware JWT** (riusato da fleet e ship routes):
```typescript
// server/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    ;(req as any).user = jwt.verify(token, CONFIG.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

### Fleet routes

#### `server/routes/fleet.routes.ts`

```typescript
import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getDb }       from '../db/client'

export const fleetRouter = Router()

fleetRouter.get('/', requireAuth, (_req, res, next) => {
  try {
    // JOIN unica — no N+1 query
    const rows = getDb().prepare(`
      SELECT s.id, s.name, s.imo_number, s.flag, s.vessel_type, s.last_sync_at,
             rl.data as rotationData
      FROM ships s
      LEFT JOIN rotation_latest rl ON rl.ship_id = s.id
      ORDER BY s.name
    `).all() as any[]

    res.json(rows.map(r => ({
      id:         r.id,
      name:       r.name,
      imoNumber:  r.imo_number,
      flag:       r.flag,
      vesselType: r.vessel_type,
      lastSyncAt: r.last_sync_at,
      rotation:   r.rotationData ? JSON.parse(r.rotationData) : null,
    })))
  } catch (e) { next(e) }
})
```

---

### Ship routes

#### `server/routes/ship.routes.ts`

```typescript
import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getDb }       from '../db/client'

export const shipRouter = Router()

// Rotation corrente (preplanning — nessuno storico)
shipRouter.get('/:shipId/rotation', requireAuth, (req, res, next) => {
  try {
    const row = getDb().prepare('SELECT data FROM rotation_latest WHERE ship_id = ?')
      .get(req.params.shipId) as any
    res.json(row ? JSON.parse(row.data) : null)
  } catch (e) { next(e) }
})

// Machinery corrente
shipRouter.get('/:shipId/machinery', requireAuth, (req, res, next) => {
  try {
    const row = getDb().prepare('SELECT data FROM machinery_latest WHERE ship_id = ?')
      .get(req.params.shipId) as any
    res.json(row ? JSON.parse(row.data) : null)
  } catch (e) { next(e) }
})

// Noon positions (ordinate per date DESC, escluse le deleted)
shipRouter.get('/:shipId/noon', requireAuth, (req, res, next) => {
  try {
    const rows = getDb().prepare(
      'SELECT data FROM noon_positions WHERE ship_id = ? AND deleted = 0 ORDER BY date DESC'
    ).all(req.params.shipId) as any[]
    res.json(rows.map(r => JSON.parse(r.data)))
  } catch (e) { next(e) }
})

// Mooring
shipRouter.get('/:shipId/mooring', requireAuth, (req, res, next) => {
  try {
    const row = getDb().prepare('SELECT items, lines FROM mooring_latest WHERE ship_id = ?')
      .get(req.params.shipId) as any
    res.json(row
      ? { items: JSON.parse(row.items), lines: JSON.parse(row.lines) }
      : { items: [], lines: [] })
  } catch (e) { next(e) }
})

// Sync log per nave
shipRouter.get('/:shipId/sync-log', requireAuth, (req, res, next) => {
  try {
    const rows = getDb().prepare(
      'SELECT * FROM sync_receipts WHERE ship_id = ? ORDER BY received_at DESC LIMIT 100'
    ).all(req.params.shipId)
    res.json(rows)
  } catch (e) { next(e) }
})
```

---

## Frontend Angular

### Routes

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', canActivate: [authGuard], children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'fleet',     component: FleetComponent },
    { path: 'ship/:id',  component: ShipDetailComponent, children: [
      { path: 'rotation', component: ShipRotationComponent },
      { path: 'noon',     component: ShipNoonComponent },
      { path: 'mooring',  component: ShipMooringComponent },
      { path: 'sync',     component: ShipSyncLogComponent },
      { path: '', redirectTo: 'rotation', pathMatch: 'full' },
    ]},
  ]},
]
```

### Componenti chiave

#### `DashboardComponent`

```html
<div class="p-6 bg-base-100 min-h-screen">
  <h1 class="text-2xl font-bold text-primary mb-6">Fleet Dashboard</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    @for (ship of fleetSvc.$ships(); track ship.id) {
      <div class="card bg-base-200 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
           [routerLink]="['/ship', ship.id]">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="card-title text-primary">{{ ship.name }}</h2>
              <p class="text-sm text-base-content/60">IMO {{ ship.imoNumber }}</p>
            </div>
            <app-sync-badge [lastSyncAt]="ship.lastSyncAt" />
          </div>

          @if (ship.rotation) {
            <div class="divider my-1"></div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-base-content/50">Next port</span>
                <p class="font-medium">{{ shipSvc.nextPort(ship.rotation) }}</p>
              </div>
              <div>
                <span class="text-base-content/50">ROB FO</span>
                <p class="font-medium">{{ shipSvc.currentRobFO(ship.rotation) | number:'1.0-0' }} MT</p>
              </div>
            </div>
          }

          @if (ship.mooringRedCount > 0) {
            <div class="alert alert-error alert-sm mt-2 py-1">
              <span class="text-xs">⚠ {{ ship.mooringRedCount }} mooring line(s) require attention</span>
            </div>
          }
        </div>
      </div>
    }
  </div>
</div>
```

> `nextPort` e `currentRobFO` sono metodi del `ShipService` (non del component).
> Portare la logica corrispondente da `rotation.service.ts` della nave nel service ufficio.

#### `ShipRotationComponent` — preplanning read-only + export client-side

```html
<div class="p-4">
  <div class="flex justify-between items-center mb-4">
    <div class="alert alert-info py-2">
      <span class="text-sm">Preplanning — aggiornato al {{ shipSvc.$rotationUpdatedAt() | date:'dd MMM yyyy HH:mm' }}</span>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-sm btn-outline" (click)="exportPDF()">Export PDF</button>
      <button class="btn btn-sm btn-outline" (click)="exportExcel()">Export Excel</button>
    </div>
  </div>

  <app-activity-timeline
    [rotation]="shipSvc.$rotation()"
    [readonly]="true"
    [machinerySystem]="shipSvc.$machinery()" />
</div>
```

```typescript
// ship-rotation.component.ts
exportPDF() {
  const rotation  = this.shipSvc.$rotation()
  const machinery = this.shipSvc.$machinery()
  if (!rotation || !machinery) return
  const doc = buildRotationPDF(rotation, machinery, this.pdfSetup)
  downloadBlob(new Blob([doc.output('arraybuffer')], { type: 'application/pdf' }), 'rotation.pdf')
}
```

#### `ShipNoonComponent`

```html
<div class="p-4">
  <div class="flex gap-3 mb-4 flex-wrap">
    <input class="input input-bordered input-sm" placeholder="Voyage #" [(ngModel)]="filterVoyage" />
    <input class="input input-bordered input-sm" type="date" [(ngModel)]="filterFrom" />
    <input class="input input-bordered input-sm" type="date" [(ngModel)]="filterTo" />
    <button class="btn btn-sm btn-ghost" (click)="exportLogbook()">Export Excel</button>
  </div>

  <div class="overflow-x-auto">
    <table class="table table-zebra table-sm">
      <thead class="bg-primary text-primary-content">
        <tr>
          <th>Date</th><th>Voyage</th><th>Position</th>
          <th>SOG</th><th>ROB FO</th><th>ROB DO</th><th>Weather</th>
        </tr>
      </thead>
      <tbody>
        @for (entry of filteredEntries(); track entry.id) {
          <tr class="hover cursor-pointer" (click)="openDetail(entry)">
            <td>{{ entry.date }}</td>
            <td><span class="badge badge-outline badge-sm">{{ entry.voyageNumber }}</span></td>
            <td class="font-mono text-xs">{{ entry.lat }}{{ entry.latHemi }} / {{ entry.lon }}{{ entry.lonHemi }}</td>
            <td>{{ entry.speedSog }} kts</td>
            <td>{{ entry.foRobMt | number:'1.1-1' }}</td>
            <td>{{ entry.doRobMt | number:'1.1-1' }}</td>
            <td>{{ entry.windDirection }} Bft{{ entry.windBeaufort }}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</div>
```

#### `ShipMooringComponent`

```html
<div class="p-4 flex gap-4">
  <div class="flex-1">
    <app-mooring-canvas
      [items]="mooringSvc.$items()"
      [lines]="mooringSvc.$lines()"
      [readonly]="true" />
  </div>

  <div class="w-80 flex flex-col gap-2">
    <select class="select select-bordered select-sm" [(ngModel)]="filterStatus">
      <option value="">All lines</option>
      <option value="RED">Red only</option>
      <option value="AMBER">Amber only</option>
    </select>

    @for (line of filteredLines(); track line.id) {
      <div class="card bg-base-200 cursor-pointer hover:bg-base-300">
        <div class="card-body p-3">
          <div class="flex justify-between items-center">
            <span class="font-medium text-sm">{{ line.label }}</span>
            <app-traffic-light [color]="computeTrafficLight(line)" />
          </div>
          <p class="text-xs text-base-content/60">{{ line.material }} Ø{{ line.diameterMm }}mm</p>
        </div>
      </div>
    }
  </div>
</div>
```

#### `sync-badge.component` (shared)

```typescript
// Semaforo: verde < 4h, giallo 4-12h, rosso > 12h, grigio = mai
@Component({
  selector: 'app-sync-badge',
  template: `
    <div class="badge gap-1"
         [class.badge-success]="status() === 'ok'"
         [class.badge-warning]="status() === 'late'"
         [class.badge-error]="status() === 'critical'"
         [class.badge-ghost]="status() === 'never'">
      {{ label() }}
    </div>`,
})
export class SyncBadgeComponent {
  lastSyncAt = input<string | null>(null)

  status = computed(() => {
    if (!this.lastSyncAt()) return 'never'
    const h = (Date.now() - new Date(this.lastSyncAt()!).getTime()) / 3_600_000
    if (h < 4)  return 'ok'
    if (h < 12) return 'late'
    return 'critical'
  })

  label = computed(() => {
    if (!this.lastSyncAt()) return 'Never'
    const h = Math.round((Date.now() - new Date(this.lastSyncAt()!).getTime()) / 3_600_000)
    return `${h}h ago`
  })
}
```

---

## Componenti condivisi riusati dalla nave

| Componente nave | Modifica per ufficio |
|---|---|
| `activityTimeline.component` | `[readonly]="true"` — rimuovere drag-drop e pulsanti edit |
| `timeLineBox.component` | Rimuovere click handler di edit |
| `mooring-canvas` | `[readonly]="true"` → `pointer-events: none` su canvas |
| Shared inputs/toggles | Aggiungere `@Input() readonly = false`, disabilita tutto se `true` |

---

## Sicurezza

### Autenticazione utenti ufficio
- Login email + password, hash bcrypt in DB
- JWT con scadenza 8h (configurabile)
- Ruoli: `viewer` (default), `admin` (gestione navi)
- Angular `AuthGuard` protegge tutte le routes tranne `/login`

### Autenticazione sync navi
- Ogni nave ha `sync_token` univoco generato alla registrazione
- Navi inviano `Authorization: Bearer <sync_token>` in ogni POST `/api/sync`
- Token diverso dalle credenziali utente ufficio
- Rate limit: max 2 req/min per IP su `/api/sync`

### Note deploy
- Per deploy **solo su LAN interna**: HTTP è accettabile, JWT token non esposti a internet.
- Per deploy **pubblico o su internet**: mettere nginx + Let's Encrypt davanti (HTTPS obbligatorio).

---

## Setup iniziale — script seed

**`scripts/seed-admin.ts`**:
```typescript
import bcrypt    from 'bcrypt'
import Database  from 'better-sqlite3'

const [,, email, password] = process.argv
if (!email || !password) { console.error('Usage: tsx scripts/seed-admin.ts <email> <password>'); process.exit(1) }

const db   = new Database(process.env['DB_PATH'] ?? './data/eta-office.db')
const hash = await bcrypt.hash(password, 12)
db.prepare('INSERT INTO office_users (email, password_hash, role) VALUES (?,?,?)')
  .run(email, hash, 'admin')
console.log(`Admin created: ${email}`)
```

**`scripts/seed-ship.ts`**:
```typescript
import Database from 'better-sqlite3'
import { randomBytes } from 'crypto'

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace('--','').split('=')))
const { id, name, imo } = args
if (!id || !name) { console.error('Usage: tsx scripts/seed-ship.ts --id=mv-001 --name="MV Example" --imo=1234567'); process.exit(1) }

const db    = new Database(process.env['DB_PATH'] ?? './data/eta-office.db')
const token = randomBytes(32).toString('hex')
db.prepare('INSERT INTO ships (id, name, imo_number, sync_token) VALUES (?,?,?,?)')
  .run(id, name, imo ?? null, token)
console.log(`Ship registered: ${name}`)
console.log(`Sync token: ${token}`)
console.log(`Set on nave: OFFICE_SYNC_TOKEN=${token}`)
```

**Checklist avvio**:
```bash
# 1. Crea DB
npm run dev:server   # crea data/eta-office.db con tutte le tabelle

# 2. Crea primo admin
tsx scripts/seed-admin.ts admin@company.com SecurePass123

# 3. Registra prima nave (genera sync_token)
tsx scripts/seed-ship.ts --id=mv-001 --name="MV Example" --imo=1234567

# 4. Copia sync_token nel .env del PC nave
#    OFFICE_SYNC_TOKEN=<token stampato dal comando sopra>

# 5. Avvia in produzione
pm2 start ecosystem.config.js && pm2 save
```

---

## Scripts `package.json`

```json
{
  "scripts": {
    "dev:server": "tsx watch server/index.ts",
    "dev:client": "ng serve --proxy-config proxy.conf.json",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "build:client": "ng build --configuration production",
    "build:server": "tsc -p tsconfig.server.json",
    "build": "npm run build:client && npm run build:server",
    "start": "node dist-server/index.js"
  }
}
```

**`proxy.conf.json`**:
```json
{
  "/api": { "target": "http://localhost:4000", "secure": false }
}
```

---

## PM2 — ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'eta-office',
    script: 'dist-server/index.js',
    env: {
      NODE_ENV:   'production',
      PORT:       4000,
      HOST:       '0.0.0.0',
      DB_PATH:    './data/eta-office.db',
      JWT_SECRET: 'cambia-questo-valore',
    }
  }]
}
```

---

## Piano di sviluppo (sprint)

| Sprint | Attività | Giorni |
|--------|----------|--------|
| 1 | Setup progetto Angular + Express + SQLite + auth JWT | 2 |
| 2 | Sync receiver incrementale + schema DB + seed scripts | 2 |
| 3 | Fleet routes + Ship routes (rotation/machinery/noon/mooring) | 2 |
| 4 | Frontend: Login + Dashboard + Fleet list | 2 |
| 5 | Frontend: ShipDetail → Rotation read-only + export client-side | 2 |
| 6 | Frontend: Noon read-only + Mooring read-only | 2 |
| 7 | Frontend: Sync log view + SyncBadge + traffic light | 1 |
| 8 | PM2 setup + test end-to-end con nave (sync incrementale) | 2 |
| **Totale** | | **~15 giorni** |

---

## `.env.example`

```env
PORT=4000
HOST=0.0.0.0
DB_PATH=./data/eta-office.db
JWT_SECRET=cambia-questo-in-produzione
JWT_EXPIRY=8h
```
