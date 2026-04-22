import { Component, computed, input } from '@angular/core'
import { TimelineBoxComponent } from './timeline-box.component'
import type { ActivityModel } from '../../../../../shared/rotation-machinery.interface'

const ICONS: Record<string, string> = {
  'Sea Passage': '⛵', 'Loading': '📦', 'Discharging': '📤',
  'Bunkering': '⛽', 'Anchoring': '⚓', 'Pilotage Inbound': '🔼',
  'Pilotage Outbound': '🔽', 'Canal Transit': '🌊', 'Drifting': '🌀',
  'Shifting': '↔', 'Cleaning': '🧹', 'Layby Berth': '🔲',
}

const COLORS: Record<string, string> = {
  'Sea Passage': 'btn-info', 'Pilotage Inbound': 'btn-info', 'Pilotage Outbound': 'btn-info',
  'Anchoring': 'btn-warning', 'Drifting': 'btn-warning',
  'Loading': 'btn-success', 'Discharging': 'btn-success', 'Cleaning': 'btn-secondary',
  'Shifting': 'btn-warning', 'Layby Berth': 'btn-ghost', 'Bunkering': 'btn-error',
  'Canal Transit': 'btn-primary',
}

@Component({
  selector: 'app-activity-timeline-readonly',
  standalone: true,
  imports: [TimelineBoxComponent],
  template: `
    @if (activities().length === 0) {
      <p class="text-sm text-base-content/40 px-2">No activities</p>
    } @else {
      <div class="overflow-x-auto pb-2">
        <ul class="timeline">
          @for (a of activities(); track a.idOrder ?? $index; let first = $first; let last = $last) {
            <li>
              @if (!first) { <hr /> }

              @if ($even) {
                <div class="timeline-start timeline-box shadow-none border-0 bg-transparent p-0">
                  <app-timeline-box [activity]="a" />
                </div>
              } @else {
                <div class="timeline-end timeline-box shadow-none border-0 bg-transparent p-0">
                  <app-timeline-box [activity]="a" />
                </div>
              }

              <div class="timeline-middle">
                <div class="btn btn-circle btn-sm {{ btnColor(a) }} pointer-events-none select-none">
                  {{ icon(a) }}
                </div>
              </div>

              @if (!last) { <hr /> }
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class ActivityTimelineReadonlyComponent {
  activities = input<ActivityModel[]>([])

  icon(a: ActivityModel): string {
    return ICONS[a.activityType ?? ''] ?? '●'
  }

  btnColor(a: ActivityModel): string {
    return COLORS[a.activityType ?? ''] ?? 'btn-ghost'
  }
}
