import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import type { ActivityModel } from '../../../../../shared/rotation-machinery.interface';

@Component({
  selector: 'app-timeline-box',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div
      class="flex flex-col min-w-[9rem] rounded-lg overflow-hidden text-xs shadow-sm border border-opacity-30"
      [class]="borderColor()"
    >
      <div class="flex flex-col gap-0.5 px-2 py-1.5 bg-base-100">
        <div class="flex items-center gap-1 text-base-content">
          <span class="text-xs opacity-60">⏱</span>
          <span
            >{{
              activity()?.timeNeededForOperation | number: '1.1-1'
            }}
            hrs</span
          >
          @if (activity()?.isEcaArea === 'Inside ECA Area') {
            <span class="badge badge-warning badge-xs">ECA</span>
          }
        </div>

        @if (activity()?.activityType === 'Sea Passage') {
          <div class="flex items-center gap-1 text-base-content">
            <span class="text-xs opacity-60">📏</span>
            <span
              >{{ activity()?.distance }} nm "&#64;"
              {{ activity()?.speedKts }} kts</span
            >
          </div>
        }

        @if (
          [
            'Loading',
            'Discharging',
            'Cleaning',
            'Layby Berth',
            'Bunkering',
          ].includes(activity()?.activityType ?? '')
        ) {
          <div class="flex items-center gap-1 text-base-content">
            <span class="text-xs opacity-60">⚓</span>
            <span>{{ activity()?.toBerth }}</span>
          </div>
        }

        @if (activity()?.activityType === 'Shifting') {
          <div class="flex items-center gap-1 text-base-content">
            <span class="text-xs opacity-60">→</span>
            <span>To: {{ activity()?.toBerth }}</span>
          </div>
        }

        <div class="border-t border-base-300 my-0.5"></div>

        <div class="flex items-center gap-1 font-medium text-base-content">
          <span class="text-xs opacity-60">📅</span>
          <span>{{ activity()?.ETX }} {{ activity()?.date_Derived }}</span>
        </div>

        <div class="border-t border-base-300 my-0.5"></div>

        <div class="flex items-center gap-1">
          <span class="inline-block w-2 h-2 rounded-full bg-orange-400"></span>
          <span class="text-base-content">FO</span>
          <span class="font-semibold text-orange-500">{{
            activity()?.robFO_Derived | number: '1.1-1'
          }}</span>
          <span class="text-base-content opacity-60">MT</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
          <span class="text-base-content">DO</span>
          <span class="font-semibold text-sky-500">{{
            activity()?.robDO_Derived | number: '1.1-1'
          }}</span>
          <span class="text-base-content opacity-60">MT</span>
        </div>
      </div>
    </div>
  `,
})
export class TimelineBoxComponent {
  activity = input<ActivityModel>();

  borderColor = computed(() => {
    const map: Record<string, string> = {
      'Sea Passage': 'border-sky-500',
      'Pilotage Inbound': 'border-cyan-500',
      'Pilotage Outbound': 'border-cyan-500',
      Anchoring: 'border-amber-500',
      Drifting: 'border-amber-400',
      Loading: 'border-emerald-500',
      Discharging: 'border-emerald-600',
      Cleaning: 'border-violet-500',
      Shifting: 'border-orange-500',
      'Layby Berth': 'border-zinc-400',
      Bunkering: 'border-rose-500',
      'Canal Transit': 'border-indigo-500',
    };
    return map[this.activity()?.activityType ?? ''] ?? 'border-zinc-400';
  });
}
