import { Component, input } from '@angular/core'
import { SyncBadgeComponent } from './sync-badge.component'
import type { ShipSummary } from '../core/models/fleet.model'

@Component({
  selector: 'app-ship-header',
  standalone: true,
  imports: [SyncBadgeComponent],
  template: `
    @if (ship()) {
      <div class="bg-primary text-primary-content px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-2xl">🚢</span>
          <div>
            <h2 class="font-bold text-lg leading-tight">{{ ship()!.name }}</h2>
            <p class="text-xs text-primary-content/60">
              @if (ship()!.imoNumber) { IMO {{ ship()!.imoNumber }} · }
              {{ ship()!.vesselType ?? 'Vessel' }}
              @if (ship()!.flag) { · {{ ship()!.flag }} }
            </p>
          </div>
        </div>
        <app-sync-badge [lastSyncAt]="ship()!.lastSyncAt" />
      </div>
    }
  `,
})
export class ShipHeaderComponent {
  ship = input<ShipSummary | null>(null)
}
