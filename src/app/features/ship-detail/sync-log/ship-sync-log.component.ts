import { Component, inject, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ShipService } from '../../../core/service/ship.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-ship-sync-log',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-4 pb-24 space-y-4">
      <h1 class="text-lg font-bold flex items-center gap-2">
        Ship — {{ shipSvc.$ship()?.name ?? '—' }}
        @if (shipSvc.$ship()?.imoNumber) {
          <span class="badge badge-ghost badge-sm font-mono">{{ shipSvc.$ship()?.imoNumber }}</span>
        }
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <h2 class="text-sm font-semibold opacity-60 mb-3">Ship Info</h2>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt class="opacity-50">Host</dt>
              <dd class="font-medium">{{ shipSvc.$ship()?.name ?? '—' }}</dd>
              <dt class="opacity-50">IMO</dt>
              <dd class="font-medium">{{ shipSvc.$ship()?.imoNumber ?? '—' }}</dd>
              <dt class="opacity-50">Flag</dt>
              <dd class="font-medium">{{ shipSvc.$ship()?.flag ?? '—' }}</dd>
              <dt class="opacity-50">Vessel Type</dt>
              <dd class="font-medium">{{ shipSvc.$ship()?.vesselType ?? '—' }}</dd>
            </dl>
          </div>
        </section>

        <section class="card bg-base-100 shadow">
          <div class="card-body p-4">
            <h2 class="text-sm font-semibold opacity-60 mb-3">Last Sync</h2>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt class="opacity-50">Last synced at</dt>
              <dd class="font-medium">{{ shipSvc.$ship()?.lastSyncAt ? (shipSvc.$ship()?.lastSyncAt | date:'dd/MM HH:mm:ss') : '—' }}</dd>
              <dt class="opacity-50">Global version</dt>
              <dd class="font-medium">—</dd>
              <dt class="opacity-50">Last synced version</dt>
              <dd class="font-medium">—</dd>
            </dl>
          </div>
        </section>
      </div>

      <section class="card bg-base-100 shadow">
        <div class="card-body p-4">
          <h2 class="text-sm font-semibold opacity-60 mb-3">Sync Log (last 20)</h2>
          @if (shipSvc.$syncLog().length === 0) {
            <div class="alert alert-info">No sync records yet.</div>
          } @else {
            <div class="overflow-x-auto">
              <table class="table table-xs">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  @for (log of shipSvc.$syncLog(); track log.id) {
                    <tr>
                      <td class="font-mono text-xs whitespace-nowrap">
                        {{ log.receivedAt | date:'dd/MM HH:mm:ss' }}
                      </td>
                      <td>
                        @if (log.success) {
                          <span class="badge badge-success badge-sm">OK</span>
                        } @else {
                          <span class="badge badge-error badge-sm">FAIL</span>
                        }
                      </td>
                      <td class="text-xs">
                        @if (log.errorMsg) {
                          <span class="text-error">{{ log.errorMsg }}</span>
                        } @else if (log.payloadSizeKb != null) {
                          {{ log.payloadSizeKb }} KB
                        } @else {
                          —
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class ShipSyncLogComponent implements OnInit {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  ngOnInit(): void {
    const shipId = this.route.parent!.snapshot.paramMap.get('id')!
    this.shipSvc.loadSyncLog(shipId)
  }
}