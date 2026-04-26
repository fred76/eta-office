import type { RotationModel } from '../../../../shared/rotation-machinery.interface'

export interface ShipSummary {
  id: string
  name: string
  imoNumber: string | null
  flag: string | null
  vesselType: string | null
  lastSyncAt: string | null
  rotation: RotationModel | null
  mooringRedCount: number
  active: number
}

export interface AuthResponse {
  token: string
  role: string
}

export interface SyncReceipt {
  id: number
  shipId: string
  receivedAt: string
  payloadSizeKb: number | null
  success: boolean
  errorMsg: string | null
}
