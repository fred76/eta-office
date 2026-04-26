import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import {
  ships, rotationLatest, machineryLatest,
  noonPositions, mooringLatest, syncReceipts,
  sailingDirectionLatest,
} from '../db/schema'
import type { SyncPayload } from '../../shared/sync.types'

export class SyncVersionMismatchError extends Error {
  constructor(public lastKnown: number, received: number) {
    super(`Version mismatch: server has ${lastKnown}, payload fromVersion=${received}`)
  }
}

export async function processSyncPayload(shipId: string, payload: SyncPayload): Promise<void> {
  const now = new Date().toISOString()
  let success = false
  let errorMsg: string | undefined

  try {
    // Check if admin requested a full sync for this ship
    if (payload.fromVersion !== 0) {
      const ship = await db.query.ships.findFirst({ where: (s, { eq }) => eq(s.id, shipId) })
      if (!ship) throw new Error('Ship not found')
      if (ship.forceFullSync) {
        await db.update(ships).set({ forceFullSync: 0 }).where(eq(ships.id, shipId))
        throw new SyncVersionMismatchError(0, payload.fromVersion)
      }
      if (payload.fromVersion !== ship.lastReceivedVersion) {
        throw new SyncVersionMismatchError(ship.lastReceivedVersion, payload.fromVersion)
      }
    }

    // Rotation — only latest (preplanning, no history)
    if (payload.rotation) {
      await db.insert(rotationLatest)
        .values({ shipId, data: payload.rotation, snapshotAt: now })
        .onConflictDoUpdate({
          target: rotationLatest.shipId,
          set: { data: payload.rotation, snapshotAt: now },
        })
    }

    // Machinery — only latest
    if (payload.machinery) {
      await db.insert(machineryLatest)
        .values({ shipId, data: payload.machinery, snapshotAt: now })
        .onConflictDoUpdate({
          target: machineryLatest.shipId,
          set: { data: payload.machinery, snapshotAt: now },
        })
    }

    // Noon — incremental: upsert new/changed + soft-delete removed
    if (payload.noon) {
      for (const entry of payload.noon.upserts) {
        await db.insert(noonPositions)
          .values({ id: entry.id, shipId, date: (entry as any).date ?? null, data: entry, deleted: 0 })
          .onConflictDoUpdate({
            target: [noonPositions.shipId, noonPositions.id],
            set: { data: entry, date: (entry as any).date ?? null, deleted: 0 },
          })
      }
      for (const id of payload.noon.deletedIds) {
        await db.update(noonPositions)
          .set({ deleted: 1 })
          .where(eq(noonPositions.id, id))
      }
    }

    // Mooring — full replace when present (dataset small)
    if (payload.mooring) {
      await db.insert(mooringLatest)
        .values({ shipId, items: payload.mooring.items, lines: payload.mooring.lines, snapshotAt: now })
        .onConflictDoUpdate({
          target: mooringLatest.shipId,
          set: { items: payload.mooring.items, lines: payload.mooring.lines, snapshotAt: now },
        })
    }

    // Sailing Direction
    if (payload.sailingDirection) {
      await db.insert(sailingDirectionLatest)
        .values({
          shipId:     shipId,
          snapshotAt: now,
          data:       payload.sailingDirection.ports,
        })
        .onConflictDoUpdate({
          target: sailingDirectionLatest.shipId,
          set: {
            snapshotAt: now,
            data:       payload.sailingDirection.ports,
          },
        })
    }

    // Update version + last_sync_at
    await db.update(ships)
      .set({ lastSyncAt: now, lastReceivedVersion: payload.toVersion })
      .where(eq(ships.id, shipId))

    success = true
  } catch (err: any) {
    errorMsg = err.message
    throw err
  } finally {
    await db.insert(syncReceipts).values({
      shipId,
      receivedAt: now,
      fromVersion: payload.fromVersion,
      toVersion:   payload.toVersion,
      success,
      errorMsg,
      payloadSizeKb: Math.round(JSON.stringify(payload).length / 1024),
    })
  }
}
