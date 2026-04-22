import { Component, input, computed } from '@angular/core'
import type { TrafficLightColor } from '../../../shared/mooring-line.model'

@Component({
  selector: 'app-traffic-light',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      [class]="classes()">
      <span class="w-2 h-2 rounded-full" [class]="dotClass()"></span>
      {{ label() }}
    </span>
  `,
})
export class TrafficLightComponent {
  color = input<TrafficLightColor>('GREY')

  classes = computed(() => {
    switch (this.color()) {
      case 'GREEN': return 'bg-success/20 text-success'
      case 'AMBER': return 'bg-warning/20 text-warning'
      case 'RED':   return 'bg-error/20 text-error'
      default:      return 'bg-base-300 text-base-content/40'
    }
  })

  dotClass = computed(() => {
    switch (this.color()) {
      case 'GREEN': return 'bg-success'
      case 'AMBER': return 'bg-warning'
      case 'RED':   return 'bg-error'
      default:      return 'bg-base-content/20'
    }
  })

  label = computed(() => this.color())
}
