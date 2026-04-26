import { Component, input, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TimelineBoxComponent } from './timeline-box.component';
import { ActivityDetailDialogComponent } from './dialogs/activity-detail-dialog.component';
import { AgencyDetailDialogComponent } from './dialogs/agency-detail-dialog.component';
import type { ActivityModel } from '../../../../../shared/rotation-machinery.interface';

const ICONS: Record<string, string> = {
  'Sea Passage': 'sailing',
  'Pilotage Inbound': 'compare_arrows',
  'Pilotage Outbound': 'compare_arrows',
  Loading: 'file_download',
  Discharging: 'file_upload',
  Cleaning: 'cyclone',
  Shifting: 'repeat',
  'Layby Berth': 'hourglass_empty',
  Bunkering: 'local_gas_station',
  Anchoring: 'anchor',
  Drifting: 'anchor',
  'Canal Transit': 'alt_route',
};

const COLORS: Record<string, string> = {
  'Sea Passage': 'btn-info',
  'Pilotage Inbound': 'btn-info',
  'Pilotage Outbound': 'btn-info',
  Anchoring: 'btn-info',
  Drifting: 'btn-info',
  Loading: 'btn-info',
  Discharging: 'btn-info',
  Cleaning: 'btn-info',
  Shifting: 'btn-info',
  'Layby Berth': 'btn-info',
  Bunkering: 'btn-info',
  'Canal Transit': 'btn-info',
};

@Component({
  selector: 'app-activity-timeline-readonly',
  standalone: true,
  imports: [TimelineBoxComponent, MatDialogModule],
  template: `
    @if (activities().length === 0) {
      <p class="text-sm text-base-content/40 px-2">No activities</p>
    } @else {
      <div class="overflow-x-auto pb-2">
        <ul class="timeline">
          @for (
            a of activities();
            track a.idOrder ?? $index;
            let first = $first;
            let last = $last
          ) {
            <li>
              @if (!first) {
                <hr />
              }

              @if ($even) {
                <div
                  class="timeline-start timeline-box shadow-none border-0 bg-transparent p-0"
                >
                  <app-timeline-box [activity]="a" />
                </div>
              } @else {
                <div
                  class="timeline-end timeline-box shadow-none border-0 bg-transparent p-0"
                >
                  <app-timeline-box [activity]="a" />
                </div>
              }

              <div class="timeline-middle relative">
                <button
                  class="btn btn-circle btn-sm {{ btnColor(a) }}"
                  (click)="openDetail(a)"
                >
                  <span class="material-icons text-base leading-none">{{
                    icon(a)
                  }}</span>
                </button>
                @if (AGENCY_TYPES.has(a.activityType ?? '') && a.agency) {
                  @if ($even) {
                    <button
                      class="btn btn-circle btn-xs btn-info absolute -bottom-5 -right-5"
                      (click)="$event.stopPropagation(); openAgency(a)"
                      title="Agency"
                    >
                      <span class="material-icons text-xs">person</span>
                    </button>
                  } @else {
                    <button
                      class="btn btn-circle btn-xs btn-info absolute -top-5 -right-5"
                      (click)="$event.stopPropagation(); openAgency(a)"
                      title="Agency"
                    >
                      <span class="material-icons text-xs">person</span>
                    </button>
                  }
                }
              </div>

              @if (!last) {
                <hr />
              }
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class ActivityTimelineReadonlyComponent {
  activities = input<ActivityModel[]>([]);
  private dialog = inject(MatDialog);

  readonly AGENCY_TYPES = new Set([
    'Loading',
    'Discharging',
    'Cleaning',
    'Layby Berth',
    'Anchoring',
    'Canal Transit',
    'Bunkering',
  ]);

  icon(a: ActivityModel): string {
    return a.icon ?? ICONS[a.activityType ?? ''] ?? 'circle';
  }

  btnColor(a: ActivityModel): string {
    return COLORS[a.activityType ?? ''] ?? 'btn-ghost';
  }

  openDetail(a: ActivityModel): void {
    this.dialog.open(ActivityDetailDialogComponent, {
      data: a,
      maxWidth: '480px',
      width: '95vw',
    });
  }

  openAgency(a: ActivityModel): void {
    this.dialog.open(AgencyDetailDialogComponent, { data: a, width: '360px' });
  }
}
