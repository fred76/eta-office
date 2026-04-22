import type { RotationModel, MachineryModel } from './rotation-machinery.interface'
import type { NoonPosition } from './noon-position.model'
import type { MooringLine, MooringItem } from './mooring-line.model'

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
  ok:                  boolean
  receivedAt?:         string
  needsFullSync?:      boolean
  lastKnownVersion?:   number
  error?:              string
}
