import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/client'
import {
  rotationLatest, machineryLatest,
  noonPositions, mooringLatest, syncReceipts,
  sailingDirectionLatest,
} from '../db/schema'
import type { PortWithBerths } from '../../shared/sailing-direction.interface'

export async function getRotation(shipId: string) {
  const row = await db.query.rotationLatest.findFirst({
    where: (r, { eq }) => eq(r.shipId, shipId),
  })
  return row?.data ?? null
}

export async function getMachinery(shipId: string) {
  const row = await db.query.machineryLatest.findFirst({
    where: (m, { eq }) => eq(m.shipId, shipId),
  })
  return row?.data ?? null
}

export async function getNoonPositions(shipId: string) {
  const rows = await db.select()
    .from(noonPositions)
    .where(and(eq(noonPositions.shipId, shipId), eq(noonPositions.deleted, 0)))
    .orderBy(desc(noonPositions.receivedAt))
  return rows.map(r => r.data)
}

export async function getMooring(shipId: string) {
  const row = await db.query.mooringLatest.findFirst({
    where: (m, { eq }) => eq(m.shipId, shipId),
  })
  return row ?? { items: [], lines: [] }
}

export async function getSyncLog(shipId: string, limit = 100) {
  return db.select()
    .from(syncReceipts)
    .where(eq(syncReceipts.shipId, shipId))
    .orderBy(desc(syncReceipts.receivedAt))
    .limit(limit)
}

export async function getSailingDirection(shipId: string): Promise<PortWithBerths[]> {
  const row = await db.query.sailingDirectionLatest.findFirst({
    where: (s, { eq }) => eq(s.shipId, shipId),
  })
  return (row?.data as PortWithBerths[]) ?? []
}
