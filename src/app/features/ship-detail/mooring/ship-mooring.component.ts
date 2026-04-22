import { Component, inject, OnInit, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DecimalPipe } from '@angular/common'
import { ShipService } from '../../../core/service/ship.service'
import { TrafficLightComponent } from '../../../shared/traffic-light.component'
import { MooringCanvasReadonlyComponent } from './mooring-canvas-readonly.component'
import { ActivatedRoute } from '@angular/router'
import type { MooringLine } from '../../../../../shared/mooring-line.model'
import type { TrafficLightColor } from '../../../../../shared/mooring-line.model'

@Component({
  selector: 'app-ship-mooring',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TrafficLightComponent, MooringCanvasReadonlyComponent],
  templateUrl: './ship-mooring.component.html',
})
export class ShipMooringComponent implements OnInit {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  filterStatus = signal('')
  selected     = signal<MooringLine | null>(null)

  filteredLines = computed(() => {
    const mooring = this.shipSvc.$mooring()
    if (!mooring) return []
    let lines = mooring.lines
    const f = this.filterStatus()
    if (f) lines = lines.filter(l => this.trafficLight(l) === f)
    return lines
  })

  ngOnInit(): void {
    const shipId = this.route.parent!.snapshot.paramMap.get('id')!
    this.shipSvc.loadMooring(shipId)
  }

  trafficLight(line: MooringLine): TrafficLightColor {
    if (line.status === 'RETIRED' || line.status === 'OUT_OF_SERVICE') return 'GREY'
    const last = line.inspections?.[line.inspections.length - 1]
    if (!last) return 'GREY'
    if (last.actionRequired === 'RETIRE' || last.overallCondition === 'RETIRE') return 'RED'
    if (last.actionRequired === 'EARLY_REINSPECTION' || last.wearZoneStatus === 'CRITICAL') return 'RED'
    if (last.actionRequired === 'MONITOR' || last.overallCondition === 'MARGINAL') return 'AMBER'
    if (last.wearZoneStatus === 'MONITOR') return 'AMBER'
    return 'GREEN'
  }

  get redCount(): number { return this.shipSvc.$mooring()?.lines.filter(l => this.trafficLight(l) === 'RED').length ?? 0 }
  get amberCount(): number { return this.shipSvc.$mooring()?.lines.filter(l => this.trafficLight(l) === 'AMBER').length ?? 0 }
  get greenCount(): number { return this.shipSvc.$mooring()?.lines.filter(l => this.trafficLight(l) === 'GREEN').length ?? 0 }
}
