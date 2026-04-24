import { Component, computed, input } from '@angular/core'
import { TimelineBoxComponent } from './timeline-box.component'
import type { ActivityModel } from '../../../../../shared/rotation-machinery.interface'

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
                  <span class="material-icons text-base leading-none">{{ icon(a) }}</span>
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
    return a.icon ?? ICONS[a.activityType ?? ''] ?? 'circle'
  }

  btnColor(a: ActivityModel): string {
    return COLORS[a.activityType ?? ''] ?? 'btn-ghost'
  }
}
