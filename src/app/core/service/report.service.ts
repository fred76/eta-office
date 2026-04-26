import { Injectable, inject, signal, computed } from '@angular/core'
import { ApiService, type FleetReportRow } from './api.service'

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService)

  $report  = signal<FleetReportRow[]>([])
  $loading = signal(false)
  $error   = signal<string | null>(null)

  totalFoMt = computed(() => this.$report().reduce((s, r) => s + (r.foConsumedMt ?? 0), 0))
  totalDoMt = computed(() => this.$report().reduce((s, r) => s + (r.doConsumedMt ?? 0), 0))
  avgFleetSpeed = computed(() => {
    const valid = this.$report().filter(r => r.avgSpeedKts)
    return valid.length ? valid.reduce((s, r) => s + r.avgSpeedKts!, 0) / valid.length : null
  })
  syncedCount = computed(() => this.$report().filter(r => r.lastSyncAt).length)

  async load(): Promise<void> {
    this.$loading.set(true)
    this.$error.set(null)
    try {
      this.$report.set(await this.api.getFleetReport())
    } catch (e: any) {
      this.$error.set(e.message ?? 'Failed to load report')
    } finally {
      this.$loading.set(false)
    }
  }
}
