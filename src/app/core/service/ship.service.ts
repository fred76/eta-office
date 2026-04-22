import { Injectable, inject, signal } from '@angular/core'
import { ApiService } from './api.service'
import type { ShipSummary, SyncReceipt } from '../models/fleet.model'
import type { RotationModel } from '../../../../shared/rotation-machinery.interface'
import type { MachineryModel } from '../../../../shared/rotation-machinery.interface'
import type { NoonPosition } from '../../../../shared/noon-position.model'
import type { MooringLine, MooringItem } from '../../../../shared/mooring-line.model'

@Injectable({ providedIn: 'root' })
export class ShipService {
  private api = inject(ApiService)

  $ship      = signal<ShipSummary | null>(null)
  $rotation  = signal<RotationModel | null>(null)
  $machinery = signal<MachineryModel | null>(null)
  $noon      = signal<NoonPosition[]>([])
  $mooring   = signal<{ items: MooringItem[]; lines: MooringLine[] } | null>(null)
  $syncLog   = signal<SyncReceipt[]>([])
  $loading   = signal(false)
  $error     = signal<string | null>(null)

  private currentShipId: string | null = null

  async loadShip(shipId: string): Promise<void> {
    this.currentShipId = shipId
    this.$loading.set(true)
    this.$error.set(null)
    try {
      const [ship, rotation, machinery] = await Promise.all([
        this.api.getShip(shipId),
        this.api.getRotation(shipId),
        this.api.getMachinery(shipId).catch(() => null),
      ])
      this.$ship.set(ship)
      this.$rotation.set(rotation)
      this.$machinery.set(machinery as MachineryModel | null)
    } catch (e: any) {
      this.$error.set(e.message ?? 'Failed to load ship')
    } finally {
      this.$loading.set(false)
    }
  }

  async loadNoon(shipId: string): Promise<void> {
    try {
      this.$noon.set(await this.api.getNoonPositions(shipId))
    } catch { /* keep current state */ }
  }

  async loadMooring(shipId: string): Promise<void> {
    try {
      const data = await this.api.getMooring(shipId)
      this.$mooring.set(data as { items: MooringItem[]; lines: MooringLine[] })
    } catch { /* keep current state */ }
  }

  async loadSyncLog(shipId: string): Promise<void> {
    try {
      this.$syncLog.set(await this.api.getSyncLog(shipId))
    } catch { /* keep current state */ }
  }

  reset(): void {
    this.$ship.set(null)
    this.$rotation.set(null)
    this.$machinery.set(null)
    this.$noon.set([])
    this.$mooring.set(null)
    this.$syncLog.set([])
    this.$error.set(null)
  }
}
