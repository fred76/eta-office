import { Component, Inject } from '@angular/core'
import { DecimalPipe } from '@angular/common'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import type { ActivityModel } from '../../../../../../shared/rotation-machinery.interface'

const ICONS: Record<string, string> = {
  'Sea Passage':       'sailing',
  'Pilotage Inbound':  'compare_arrows',
  'Pilotage Outbound': 'compare_arrows',
  'Loading':           'file_download',
  'Discharging':       'file_upload',
  'Cleaning':          'cyclone',
  'Shifting':          'repeat',
  'Layby Berth':       'hourglass_empty',
  'Bunkering':         'local_gas_station',
  'Anchoring':         'anchor',
  'Drifting':          'anchor',
  'Canal Transit':     'alt_route',
}

const COLOR_MAP: Record<string, string> = {
  'Sea Passage': 'bg-sky-500', 'Pilotage Inbound': 'bg-cyan-500', 'Pilotage Outbound': 'bg-cyan-500',
  'Loading': 'bg-emerald-500', 'Discharging': 'bg-emerald-600', 'Cleaning': 'bg-violet-500',
  'Shifting': 'bg-orange-500', 'Layby Berth': 'bg-zinc-400', 'Bunkering': 'bg-rose-500',
  'Anchoring': 'bg-amber-500', 'Drifting': 'bg-amber-500', 'Canal Transit': 'bg-indigo-500',
}

@Component({
  selector: 'app-activity-detail-dialog',
  standalone: true,
  imports: [MatDialogModule, DecimalPipe],
  template: `
    <div class="flex flex-col max-h-[32rem]">
      <div class="{{ headerColor }} p-4 text-white flex items-center gap-3">
        <span class="material-icons">{{ icon }}</span>
        <span class="font-bold text-lg flex-1">{{ a.activityType }}</span>
        @if (a.toBerth) {
          <span class="text-sm opacity-80">{{ a.toBerth }}</span>
        }
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div class="rounded-lg border divide-y text-sm">
          <div class="flex items-center gap-2 px-3 py-2">
            <span class="material-icons text-base">schedule</span>
            <span>{{ durationStr }}</span>
          </div>
          @if (a.activityType === 'Sea Passage' && (a.distance || a.speedKts)) {
            <div class="flex gap-2 px-3 py-2">
              <span class="material-icons text-base">straighten</span>
              @if (a.distance) { <span>{{ a.distance }} nm</span> }
              @if (a.speedKts) { <span>&#64; {{ a.speedKts }} kts</span> }
            </div>
            <div class="flex gap-2 px-3 py-2">
              <span class="material-icons text-base">info</span>
              <span>{{ a.isEcaArea ?? '—' }}</span>
            </div>
          }
          @if (a.activityType === 'Bunkering' && (a.foRestock || a.doRestock)) {
            <div class="flex gap-2 px-3 py-2">
              <span class="material-icons text-base">local_gas_station</span>
              @if (a.foRestock) { <span>FO: {{ a.foRestock }} MT</span> }
              @if (a.doRestock) { <span>DO: {{ a.doRestock }} MT</span> }
            </div>
          }
          <div class="flex gap-2 px-3 py-2">
            <span class="material-icons text-base">event</span>
            <span>{{ a.ETX ?? '—' }}</span>
          </div>
        </div>

        @if (a.robFO_Derived != null || a.robDO_Derived != null) {
          <div class="rounded-lg border p-3">
            <p class="text-xs uppercase opacity-50 mb-2">ROB after activity</p>
            <div class="grid grid-cols-2 gap-4 text-center">
              @if (a.robFO_Derived != null) {
                <div>
                  <span class="text-xs opacity-50">FO</span>
                  <p class="text-orange-500 font-bold text-xl">{{ a.robFO_Derived | number:'1.1-1' }}</p>
                  <span class="text-xs opacity-50">MT</span>
                </div>
              }
              @if (a.robDO_Derived != null) {
                <div>
                  <span class="text-xs opacity-50">DO</span>
                  <p class="text-sky-500 font-bold text-xl">{{ a.robDO_Derived | number:'1.1-1' }}</p>
                  <span class="text-xs opacity-50">MT</span>
                </div>
              }
            </div>
          </div>
        }

        @if (hasConsumption) {
          <div class="rounded-lg border overflow-hidden">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>FO MT</th>
                  <th>DO MT</th>
                </tr>
              </thead>
              <tbody>
                @if (a.mainEngine) {
                  <tr>
                    <td>Main Engine</td>
                    <td>{{ a.mainEngineFODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                    <td>{{ a.mainEngineDODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                  </tr>
                }
                @if (a.ddggs?.length) {
                  <tr>
                    <td>DDGG</td>
                    <td>{{ a.ddggFODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                    <td>{{ a.ddggDODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                  </tr>
                }
                @if (a.boilers?.length) {
                  <tr>
                    <td>Boiler</td>
                    <td>{{ a.boilerFODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                    <td>{{ a.boilerDODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                  </tr>
                }
                @if (a.others?.length) {
                  <tr>
                    <td>Others</td>
                    <td>{{ a.otherFODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                    <td>{{ a.otherDODelta_Derived ?? 0 | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
              @if (a.totalDeltaFO_Derived != null || a.totalDeltaDO_Derived != null) {
                <tfoot>
                  <tr class="border-t-2 font-bold">
                    <td>Total</td>
                    <td>{{ a.totalDeltaFO_Derived ?? 0 | number:'1.2-2' }}</td>
                    <td>{{ a.totalDeltaDO_Derived ?? 0 | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
        }

        @if (a.notes) {
          <div class="flex gap-2 rounded-lg border p-3 text-sm">
            <span class="material-icons text-base opacity-60">notes</span>
            <span>{{ a.notes }}</span>
          </div>
        }
      </div>

      <div mat-dialog-actions align="end" class="p-3 border-t">
        <button class="btn btn-sm" mat-dialog-close>Close</button>
      </div>
    </div>
  `,
})
export class ActivityDetailDialogComponent {
  a: ActivityModel

  constructor(@Inject(MAT_DIALOG_DATA) data: ActivityModel) {
    this.a = data
  }

  get icon(): string {
    return this.a.icon ?? ICONS[this.a.activityType ?? ''] ?? 'circle'
  }

  get headerColor(): string {
    return COLOR_MAP[this.a.activityType ?? ''] ?? 'bg-base-500'
  }

  get durationStr(): string {
    if (!this.a.timeNeededForOperation) return '—'
    const h = Math.floor(this.a.timeNeededForOperation)
    const m = Math.round(this.a.timeNeededForOperation - h)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  get hasConsumption(): boolean {
    return !!(this.a.mainEngine || this.a.ddggs?.length || this.a.boilers?.length || this.a.others?.length)
  }
}