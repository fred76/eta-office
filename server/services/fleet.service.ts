import { db } from '../db/client'

export async function getFleet() {
  const rows = await db.query.ships.findMany({
    with: {
      rotationLatest: true,
      mooringLatest:  true,
    },
    orderBy: (s, { asc }) => asc(s.name),
  })

  return rows.map(s => ({
    id:          s.id,
    name:        s.name,
    imoNumber:   s.imoNumber,
    flag:        s.flag,
    vesselType:  s.vesselType,
    lastSyncAt:  s.lastSyncAt,
    rotation:    s.rotationLatest?.data ?? null,
    mooringRedCount: countMooringRed(s.mooringLatest?.lines),
  }))
}

export async function getShipSummary(shipId: string) {
  const ship = await db.query.ships.findFirst({
    where: (s, { eq }) => eq(s.id, shipId),
    with: { rotationLatest: true, mooringLatest: true },
  })
  if (!ship) return null
  return {
    id:          ship.id,
    name:        ship.name,
    imoNumber:   ship.imoNumber,
    flag:        ship.flag,
    vesselType:  ship.vesselType,
    lastSyncAt:  ship.lastSyncAt,
    rotation:    ship.rotationLatest?.data ?? null,
    mooringRedCount: countMooringRed(ship.mooringLatest?.lines),
  }
}

function countMooringRed(lines: unknown): number {
  if (!Array.isArray(lines)) return 0
  return lines.filter((l: any) => l?.trafficLight === 'RED').length
}
