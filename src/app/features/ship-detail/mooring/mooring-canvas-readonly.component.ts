import { Component, computed, input, signal } from '@angular/core'
import type { MooringItem, MooringLine, CanvasSection, TrafficLightColor } from '../../../../../shared/mooring-line.model'

function computeTL(lineIds: string[], lines: MooringLine[]): TrafficLightColor {
  if (lineIds.length === 0) return 'GREY'
  const tls = lineIds.map(id => {
    const l = lines.find(x => x.id === id)
    if (!l) return 'GREY' as TrafficLightColor
    if (l.status === 'RETIRED' || l.status === 'OUT_OF_SERVICE') return 'GREY' as TrafficLightColor
    const last = l.inspections?.[l.inspections.length - 1]
    if (!last) return 'GREY' as TrafficLightColor
    if (last.actionRequired === 'RETIRE' || last.overallCondition === 'RETIRE') return 'RED' as TrafficLightColor
    if (last.actionRequired === 'EARLY_REINSPECTION' || last.wearZoneStatus === 'CRITICAL') return 'RED' as TrafficLightColor
    if (last.actionRequired === 'MONITOR' || last.overallCondition === 'MARGINAL') return 'AMBER' as TrafficLightColor
    if (last.wearZoneStatus === 'MONITOR') return 'AMBER' as TrafficLightColor
    return 'GREEN' as TrafficLightColor
  })
  if (tls.includes('RED')) return 'RED'
  if (tls.includes('AMBER')) return 'AMBER'
  if (tls.includes('GREEN')) return 'GREEN'
  return 'GREY'
}

const TL_COLOR: Record<string, string> = {
  GREEN: '#22c55e', AMBER: '#f59e0b', RED: '#ef4444', GREY: '#9ca3af'
}

@Component({
  selector: 'app-mooring-canvas-readonly',
  standalone: true,
  template: `
    <div class="rounded-xl border border-base-300 bg-white overflow-hidden">

      <!-- Section tabs -->
      <div class="flex border-b border-base-300 text-xs font-semibold">
        @for (s of sections; track s) {
          <button class="flex-1 py-2 transition-colors"
                  [class]="section() === s ? 'bg-primary text-primary-content' : 'bg-base-100 text-base-content hover:bg-base-200'"
                  (click)="section.set(s)">
            {{ s.toUpperCase() }}
          </button>
        }
      </div>

      <!-- SVG canvas (pointer-events none — read only) -->
      <svg class="w-full block" viewBox="0 0 600 520"
           [attr.preserveAspectRatio]="section() === 'bow' ? 'xMidYMax meet' : 'xMidYMid meet'"
           style="pointer-events:none">

        <!-- BOW background -->
        @if (section() === 'bow') {
          <defs>
            <clipPath id="hullClipRO">
              <path d="M20,515 C20,316.973 171.417,77.055 300,15 C431.868,79.935 583.658,313.463 583.658,515 Z"/>
            </clipPath>
          </defs>
          <path d="M20,515 C20,316.973 171.417,77.055 300,15 C431.868,79.935 583.658,313.463 583.658,515 Z"
                fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <g clip-path="url(#hullClipRO)">
            <path d="M120,223 C148,150 238,40 290,32 C296,24 306,24 312,32 C364,40 454,150 482,223 Z"
                  fill="rgba(255,255,255,0.88)" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/>
            <text x="300" y="140" text-anchor="middle" dominant-baseline="middle"
                  font-size="11" font-weight="700" fill="#0369a1" letter-spacing="2" font-family="sans-serif">STORAGE</text>
            <line x1="30" y1="230" x2="570" y2="230" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
            <path d="M570,506 L30,506 C33,399 63,313 111,240 L489,240 C541,321 568,409 570,506 Z"
                  fill="rgba(255,255,255,0.88)" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/>
            <text x="300" y="378" text-anchor="middle" dominant-baseline="middle"
                  font-size="13" font-weight="700" fill="#0369a1" letter-spacing="2" font-family="sans-serif">MOORING STATION</text>
          </g>
          <path d="M20,515 C20,316.973 171.417,77.055 300,15 C431.868,79.935 583.658,313.463 583.658,515 Z"
                fill="none" stroke="#0284c7" stroke-width="2.5"/>
          <line x1="300" y1="15" x2="300" y2="515" stroke="#0284c7" stroke-width="1" stroke-dasharray="8,6" opacity="0.35"/>
        }

        <!-- DECK background -->
        @if (section() === 'deck') {
          <rect x="18" y="10" width="564" height="500" rx="6" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <line x1="30" y1="250" x2="570" y2="250" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
          <rect x="30" y="20" width="540" height="480" rx="4" fill="rgba(255,255,255,0.88)" stroke="#0284c7" stroke-width="1.5"/>
          <text x="300" y="371" text-anchor="middle" dominant-baseline="middle"
                font-size="13" font-weight="700" fill="#0369a1" letter-spacing="2" font-family="sans-serif">MOORING STATION</text>
          <line x1="300" y1="10" x2="300" y2="510" stroke="#0284c7" stroke-width="1" stroke-dasharray="8,6" opacity="0.35"/>
        }

        <!-- AFT background -->
        @if (section() === 'aft') {
          <path d="M18,10 L582,10 L519,510 L81,510 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M30,22 L570,22 L540,235 L60,235 Z" fill="rgba(255,255,255,0.88)" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/>
          <text x="300" y="128" text-anchor="middle" dominant-baseline="middle"
                font-size="11" font-weight="700" fill="#0369a1" letter-spacing="2" font-family="sans-serif">STORAGE</text>
          <line x1="92" y1="244" x2="508" y2="244" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
          <path d="M60,253 L540,253 L508,500 L92,500 Z" fill="rgba(255,255,255,0.88)" stroke="#0284c7" stroke-width="1.5" stroke-linejoin="round"/>
          <text x="300" y="376" text-anchor="middle" dominant-baseline="middle"
                font-size="13" font-weight="700" fill="#0369a1" letter-spacing="2" font-family="sans-serif">MOORING STATION</text>
          <line x1="300" y1="10" x2="300" y2="510" stroke="#0284c7" stroke-width="1" stroke-dasharray="8,6" opacity="0.35"/>
        }

        <!-- Items -->
        @for (item of visibleItems(); track item.id) {
          <g [attr.transform]="'translate(' + item.x + ',' + item.y + ')'">
            <g [attr.transform]="'rotate(' + item.rotation + ',24,24)'">

              @if (item.type === 'basket') {
                <rect x="4" y="4" width="40" height="40" rx="9" fill="#e5e7eb" stroke="#6b7280" stroke-width="1.5"/>
                <circle cx="24" cy="24" r="11" fill="none" stroke="#9ca3af" stroke-width="2"/>
                <circle cx="24" cy="24" r="6" fill="none" stroke="#9ca3af" stroke-width="2"/>
                <circle cx="24" cy="24" r="2" fill="#9ca3af"/>
                <rect x="1" y="1" width="46" height="46" rx="10" fill="none"
                      [attr.stroke]="itemBorderColor(item)" stroke-width="2" stroke-dasharray="4,2"/>
              }

              @if (item.type === 'winch') {
                <rect x="5" y="10" width="38" height="28" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
                <rect x="5" y="14" width="9" height="20" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
                <rect x="15" y="11" width="4" height="26" rx="1" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
                <rect x="29" y="11" width="4" height="26" rx="1" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
                <rect x="19" y="13" width="10" height="22" rx="1" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
                <rect x="34" y="14" width="9" height="20" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
                <rect x="0" y="2" width="48" height="44" rx="3" fill="none"
                      [attr.stroke]="itemBorderColor(item)" stroke-width="2" stroke-dasharray="4,2"/>
              }

              @if (item.type === 'spare-rope') {
                <path d="M 8,16 L 8,36 C 8,39 14,41 22,41 C 30,41 36,39 36,36 L 36,16" fill="#e5e7eb"/>
                <ellipse cx="22" cy="16" rx="14" ry="3.5" fill="#d1d5db" stroke="#6b7280" stroke-width="1.5"/>
                <ellipse cx="22" cy="36" rx="14" ry="3.5" fill="#d1d5db" stroke="#6b7280" stroke-width="1.5"/>
                <rect x="1" y="1" width="46" height="46" rx="4" fill="none"
                      [attr.stroke]="itemBorderColor(item)" stroke-width="2" stroke-dasharray="4,2"/>
              }

            </g>

            <!-- Label -->
            <text x="24" y="57" text-anchor="middle" font-size="9" font-weight="700"
                  font-family="sans-serif"
                  [attr.fill]="item.lineIds.length > 0 ? '#86efac' : '#fcd34d'">
              {{ itemLabel(item) }}
            </text>

            @if (item.type === 'basket' && item.lineIds.length > 0) {
              <text x="24" y="67" text-anchor="middle" font-size="8" font-family="sans-serif" fill="rgba(255,255,255,0.7)">
                {{ basketHours(item) }}h
              </text>
            }

            @if (item.type !== 'basket' && item.lineIds.length === 1) {
              <text x="24" y="67" text-anchor="middle" font-size="8" font-family="sans-serif" fill="rgba(255,255,255,0.7)">
                {{ lineHours(item.lineIds[0]) }}h
              </text>
            }

          </g>
        }

        @if (visibleItems().length === 0) {
          <text x="300" y="280" text-anchor="middle" font-size="14" fill="#94a3b8" font-family="sans-serif">
            No items placed in this section
          </text>
        }
      </svg>
    </div>
  `,
})
export class MooringCanvasReadonlyComponent {
  items = input<MooringItem[]>([])
  lines = input<MooringLine[]>([])

  section = signal<CanvasSection>('bow')
  sections: CanvasSection[] = ['bow', 'deck', 'aft']

  visibleItems = computed(() =>
    this.items().filter(i => (i.canvasSection ?? 'bow') === this.section())
  )

  itemBorderColor(item: MooringItem): string {
    if (item.lineIds.length === 0) return '#f59e0b'
    return TL_COLOR[computeTL(item.lineIds, this.lines())] ?? '#9ca3af'
  }

  itemLabel(item: MooringItem): string {
    if (item.type === 'basket') {
      const n = item.lineIds.length
      return n === 0 ? '+' : `${n} line${n > 1 ? 's' : ''}`
    }
    if (item.lineIds.length === 0) return '+'
    return this.lines().find(l => l.id === item.lineIds[0])?.label ?? '+'
  }

  basketHours(item: MooringItem): number {
    return Math.round(item.lineIds.reduce((sum, id) => {
      return sum + (this.lines().find(l => l.id === id)?.totalServiceHours ?? 0)
    }, 0))
  }

  lineHours(lineId: string): number {
    return Math.round(this.lines().find(l => l.id === lineId)?.totalServiceHours ?? 0)
  }
}
