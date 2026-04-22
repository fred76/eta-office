import { Injectable, inject, signal } from '@angular/core'
import { ApiService, type FleetReportRow } from './api.service'

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService)

  $report  = signal<FleetReportRow[]>([])
  $loading = signal(false)
  $error   = signal<string | null>(null)

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
