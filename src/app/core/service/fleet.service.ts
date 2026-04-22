import { Injectable, inject, signal } from '@angular/core'
import { ApiService } from './api.service'
import type { ShipSummary } from '../models/fleet.model'

@Injectable({ providedIn: 'root' })
export class FleetService {
  private api = inject(ApiService)

  $ships   = signal<ShipSummary[]>([])
  $loading = signal(false)
  $error   = signal<string | null>(null)

  async loadFleet(): Promise<void> {
    this.$loading.set(true)
    this.$error.set(null)
    try {
      this.$ships.set(await this.api.getFleet())
    } catch (e: any) {
      this.$error.set(e.message ?? 'Failed to load fleet')
    } finally {
      this.$loading.set(false)
    }
  }
}
