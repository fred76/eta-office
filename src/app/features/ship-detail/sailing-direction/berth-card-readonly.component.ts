import { Component, input, computed, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import type { BerthMaster } from '../../../../../shared/sailing-direction.interface'
import type { BerthInfo, TugsRequired } from '../../../../../shared/sailing-direction.interface'

@Component({
  selector: 'app-berth-card-readonly',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-base-300 dark:border-slate-600 overflow-hidden bg-base-100 dark:bg-slate-800 shadow-sm">
      <div class="flex items-center gap-2 px-3 py-2 bg-base-200 dark:bg-slate-700 border-b
                  border-base-300 dark:border-slate-600">
        <span class="material-icons text-sm text-sky-500">directions_boat</span>
        <span class="font-semibold text-sm flex-1">{{ berth().name }}</span>
        @if (berth().notes) {
          <span class="text-xs opacity-60 truncate max-w-[120px]">{{ berth().notes }}</span>
        }
        <button class="btn btn-ghost btn-xs btn-circle" (click)="expanded.set(!expanded())">
          <span class="material-icons text-sm">{{ expanded() ? 'expand_less' : 'expand_more' }}</span>
        </button>
      </div>

      @if (expanded()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 text-sm">

          @if (info.receptionFacility || info.garbageDisposal) {
            <div class="rounded-lg border border-base-300 dark:border-slate-600 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm">recycling</span> Reception / Environment
              </p>
              @if (info.receptionFacility) {
                <div class="text-xs">Reception facility: {{ info.receptionFacility }}</div>
              }
              @if (info.garbageDisposal) {
                <div class="text-xs">Garbage: <span class="capitalize">{{ info.garbageDisposal }}</span></div>
              }
            </div>
          }

          @if (info.preferredMooringSide || info.tugsRequiredMooring || info.tugsRequiredUnmooring) {
            <div class="rounded-lg border border-base-300 dark:border-slate-600 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm">anchor</span> Mooring
              </p>
              @if (info.preferredMooringSide) {
                <div class="text-xs">Mooring side: <span class="badge badge-info badge-xs capitalize">{{ info.preferredMooringSide }}</span></div>
              }
              @if (info.tugsRequiredMooring) {
                <div class="text-xs mt-1">Tugs mooring: {{ formatTugs(info.tugsRequiredMooring) }}</div>
              }
              @if (info.tugsRequiredUnmooring) {
                <div class="text-xs">Tugs unmooring: {{ formatTugs(info.tugsRequiredUnmooring) }}</div>
              }
              @if (info.tugsNotes) {
                <div class="text-xs opacity-60 mt-1">{{ info.tugsNotes }}</div>
              }
            </div>
          }

          @if (info.freshwaterAvailable || info.bunkeringAvailable) {
            <div class="rounded-lg border border-base-300 dark:border-slate-600 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm">water_drop</span> Utilities
              </p>
              @if (info.freshwaterAvailable) {
                <div class="flex items-center gap-1 text-xs">
                  <span class="material-icons text-sm {{ info.freshwaterType !== 'none' ? 'text-green-500' : 'text-red-500' }}">
                    {{ info.freshwaterType !== 'none' ? 'check_circle' : 'cancel' }}
                  </span>
                  Freshwater: {{ info.freshwaterType ?? 'Yes' }}
                </div>
              }
              @if (info.bunkeringAvailable) {
                <div class="flex items-center gap-1 text-xs mt-1">
                  <span class="material-icons text-sm text-green-500">check_circle</span>
                  Bunkering: {{ info.bunkerTypes || 'Yes' }}
                </div>
              }
            </div>
          }

          @if (info.maxDraft || info.maxLOA) {
            <div class="rounded-lg border border-base-300 dark:border-slate-600 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm">straighten</span> Dimensions
              </p>
              @if (info.maxDraft) {
                <div class="text-xs">Max Draft: {{ info.maxDraft }} m</div>
              }
              @if (info.maxLOA) {
                <div class="text-xs">Max LOA: {{ info.maxLOA }} m</div>
              }
            </div>
          }

          @if (info.craneMoveRate || info.numberOfCranes || info.reeferPlugsCount || info.shorePowerAvailable) {
            <div class="rounded-lg border border-base-300 dark:border-slate-600 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm text-violet-500">inventory_2</span> Container
              </p>
              @if (info.craneMoveRate) {
                <div class="text-xs">Crane rate: {{ info.craneMoveRate }} moves/hr</div>
              }
              @if (info.numberOfCranes) {
                <div class="text-xs">Cranes: {{ info.numberOfCranes }}</div>
              }
              @if (info.reeferPlugsCount) {
                <div class="text-xs">Reefer plugs: {{ info.reeferPlugsCount }}</div>
              }
              @if (info.shorePowerAvailable) {
                <div class="text-xs">Shore power: {{ info.shorePowerSpec ?? 'Yes' }}</div>
              }
            </div>
          }

          @if (info.maxLoadingRateMT || info.maxDischargeRateMT || info.shipGearAllowed || info.grabAvailable || info.conveyorAvailable || info.dustSuppressionRequired) {
            <div class="rounded-lg border border-base-300 dark:border-slate-600 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm text-orange-500">grain</span> Bulk Carrier
              </p>
              @if (info.maxLoadingRateMT) {
                <div class="text-xs">Load rate: {{ info.maxLoadingRateMT }} MT/hr</div>
              }
              @if (info.maxDischargeRateMT) {
                <div class="text-xs">Disch rate: {{ info.maxDischargeRateMT }} MT/hr</div>
              }
              @if (info.shipGearAllowed) {
                <div class="text-xs">Ship gear: <span class="material-icons text-sm text-green-500 inline-block align-middle">check_circle</span></div>
              }
              @if (info.grabAvailable) {
                <div class="text-xs">Shore grab: <span class="material-icons text-sm text-green-500 inline-block align-middle">check_circle</span></div>
              }
              @if (info.conveyorAvailable) {
                <div class="text-xs">Conveyor: <span class="material-icons text-sm text-green-500 inline-block align-middle">check_circle</span></div>
              }
              @if (info.dustSuppressionRequired) {
                <div class="text-xs">Dust suppression: <span class="material-icons text-sm text-green-500 inline-block align-middle">check_circle</span></div>
              }
            </div>
          }

          @if (berth().cargoes && berth().cargoes!.length > 0) {
            <div class="rounded-lg border md:col-span-2 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm text-amber-500">local_shipping</span>
                Tanker — Cargo Operations
              </p>
              @for (c of berth().cargoes!; track c.id) {
                <div class="flex flex-wrap gap-x-4 gap-y-0.5 text-xs bg-base-200 dark:bg-slate-700 rounded px-2 py-1.5 mt-1">
                  <span class="font-semibold text-amber-600 dark:text-amber-400">{{ c.cargoName }}</span>
                  @if (c.maxLoadingRateCbm)    { <span class="opacity-70">Ld: {{ c.maxLoadingRateCbm }} CBM/hr</span> }
                  @if (c.maxDischargeRateCbm)  { <span class="opacity-70">Dsch: {{ c.maxDischargeRateCbm }} CBM/hr</span> }
                  @if (c.maxManifoldPressureBar){ <span class="opacity-70">Press: {{ c.maxManifoldPressureBar }} bar</span> }
                  @if (c.cargoConnectionType)   { <span class="opacity-70 capitalize">Conn: {{ c.cargoConnectionType }}</span> }
                  @if (c.hoseArmSizeInch)       { <span class="opacity-70">{{ c.hoseArmSizeInch }}"</span> }
                </div>
              }
            </div>
          }

          @if (info.generalNotes) {
            <div class="rounded-lg border md:col-span-2 p-3">
              <p class="flex items-center gap-1 text-xs font-semibold opacity-60 mb-2">
                <span class="material-icons text-sm">notes</span> Notes
              </p>
              <p class="text-sm whitespace-pre-wrap opacity-80">{{ info.generalNotes }}</p>
            </div>
          }

          @if (info.lastUpdatedBy) {
            <p class="col-span-full text-xs opacity-40 text-right">Updated by: {{ info.lastUpdatedBy }}</p>
          }

        </div>
      }
    </div>
  `
})
export class BerthCardReadonlyComponent {
  berth = input.required<BerthMaster>()
  expanded = signal(false)

  get info(): BerthInfo {
    return this.berth().berthInfo ?? {} as BerthInfo
  }

  formatTugs(t: string): string {
    return { mandatory: 'Mandatory', recommended: 'Recommended', not_required: 'Not required' }[t] ?? t
  }
}