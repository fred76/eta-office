import { Component, inject, OnInit, ChangeDetectionStrategy, computed, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ShipService } from '../../../core/service/ship.service'
import { BerthCardReadonlyComponent } from './berth-card-readonly.component'
import type { PortWithBerths } from '../../../../../shared/sailing-direction.interface'

@Component({
  selector: 'app-ship-sailing-direction',
  standalone: true,
  imports: [CommonModule, BerthCardReadonlyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-full overflow-hidden">

      <div class="w-64 lg:w-72 shrink-0 border-r border-base-300 dark:border-slate-600
                  flex flex-col overflow-hidden">
        <div class="p-2 border-b border-base-300 dark:border-slate-600">
          <input class="input input-sm input-bordered w-full"
                 placeholder="Search ports…"
                 [value]="searchQuery()"
                 (input)="searchQuery.set($any($event.target).value)" />
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          @if (filteredPorts().length === 0) {
            <p class="text-xs opacity-40 italic text-center py-8">No port data received from ship.</p>
          }
          @for (port of filteredPorts(); track port.id) {
            <div class="rounded-xl border overflow-hidden bg-base-100 shadow-sm cursor-pointer"
                 [class.border-sky-500]="selectedPortId() === port.id"
                 [class.border-base-300]="selectedPortId() !== port.id"
                 (click)="selectedPortId.set(port.id)">
              <div class="flex items-center gap-2 px-3 py-2">
                <span class="material-icons text-sky-500 text-sm">place</span>
                <span class="font-semibold text-sm flex-1 truncate">{{ port.name }}</span>
                @if (port.unlocode) {
                  <span class="badge badge-outline badge-xs font-mono">{{ port.unlocode }}</span>
                }
              </div>
              @if (port.notes) {
                <p class="px-3 pb-1.5 text-xs opacity-60 truncate">{{ port.notes }}</p>
              }
            </div>
          }
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3 pb-20 space-y-3">
        @if (!selectedPort()) {
          <div class="flex flex-col items-center justify-center h-48 gap-2 opacity-40
                      border-2 border-dashed rounded-xl mt-4">
            <span class="material-icons text-4xl">explore</span>
            <p class="text-sm">Select a port</p>
          </div>
        } @else {
          <div class="rounded-xl border border-base-300 dark:border-slate-600 overflow-hidden
                      bg-base-100 dark:bg-slate-800 shadow-sm">
            <div class="flex items-center gap-2 px-4 py-3 bg-base-200 dark:bg-slate-700 border-b
                        border-base-300 dark:border-slate-600">
              <span class="material-icons text-sky-500">location_on</span>
              <span class="font-bold text-base flex-1">{{ selectedPort()!.name }}</span>
              @if (selectedPort()!.unlocode) {
                <span class="badge badge-outline badge-sm font-mono">{{ selectedPort()!.unlocode }}</span>
              }
              @if (selectedPort()!.country) {
                <span class="badge badge-ghost badge-sm">{{ selectedPort()!.country }}</span>
              }
            </div>
            @if (selectedPort()!.notes) {
              <p class="px-4 py-2 text-xs opacity-60 italic">{{ selectedPort()!.notes }}</p>
            }
          </div>

          <!-- Berths sub-section header -->
          <div class="flex items-center gap-2 px-1 mt-1">
            <span class="material-icons text-sm text-sky-500">directions_boat</span>
            <span class="text-sm font-semibold opacity-70">Berths</span>
            <span class="badge badge-ghost badge-xs">{{ selectedPort()!.berths.length }}</span>
          </div>

          @if (selectedPort()!.berths.length === 0) {
            <p class="text-xs opacity-40 italic px-1">No berths defined.</p>
          }
          @for (berth of selectedPort()!.berths; track berth.id) {
            <app-berth-card-readonly [berth]="berth" />
          }
        }
      </div>
    </div>
  `
})
export class ShipSailingDirectionComponent implements OnInit {
  private shipSvc = inject(ShipService)

  selectedPortId = signal<number | null>(null)
  searchQuery = signal('')

  ports = computed(() => this.shipSvc.$sailingDirection())

  filteredPorts = computed(() => {
    const q = this.searchQuery().toLowerCase()
    return q
      ? this.ports().filter(p => p.name.toLowerCase().includes(q) || p.unlocode?.toLowerCase().includes(q))
      : this.ports()
  })

  selectedPort = computed(() =>
    this.ports().find(p => p.id === this.selectedPortId()) ?? null
  )

  ngOnInit(): void {
    const shipId = this.shipSvc.$ship()?.id
    if (shipId) {
      this.shipSvc.loadSailingDirection(shipId)
    }
    if (this.ports().length > 0 && !this.selectedPortId()) {
      this.selectedPortId.set(this.ports()[0].id)
    }
  }
}