import { Component, inject, OnInit, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DecimalPipe } from '@angular/common'
import { ShipService } from '../../../core/service/ship.service'
import { TrafficLightComponent } from '../../../shared/traffic-light.component'
import { MooringCanvasReadonlyComponent } from './mooring-canvas-readonly.component'
import { ActivatedRoute } from '@angular/router'
import type { MooringLine, MooringItem, TrafficLightColor } from '../../../../../shared/mooring-line.model'

type MooringView = 'canvas' | 'item-detail' | 'basket-detail'

@Component({
  selector: 'app-ship-mooring',
  standalone: true,
  imports: [FormsModule, DecimalPipe, TrafficLightComponent, MooringCanvasReadonlyComponent],
  templateUrl: './ship-mooring.component.html',
})
export class ShipMooringComponent implements OnInit {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  view = signal<MooringView>('canvas')
  selectedItem = signal<MooringItem | null>(null)
  selectedLine = signal<MooringLine | null>(null)
  basketLines = computed(() => {
    const item = this.selectedItem()
    if (!item || item.type !== 'basket' || !item.lineIds.length) return []
    return item.lineIds.map((id: string) => this.shipSvc.$mooring()?.lines.find(l => l.id === id)).filter(Boolean) as MooringLine[]
  })

  ngOnInit(): void {
    const shipId = this.route.parent!.snapshot.paramMap.get('id')!
    this.shipSvc.loadMooring(shipId)
  }

  onItemClick(item: MooringItem): void {
    this.selectedItem.set(item)
    if (item.type === 'basket') {
      this.view.set('basket-detail')
    } else if (item.lineIds.length === 1) {
      const line = this.shipSvc.$mooring()?.lines.find(l => l.id === item.lineIds[0])
      if (line) {
        this.selectedLine.set(line)
        this.view.set('item-detail')
      }
    } else {
      this.view.set('item-detail')
    }
  }

  getItemLabel(item: MooringItem): string {
    const prefix = item.type === 'basket' ? 'B' : item.type === 'winch' ? 'W' : 'S'
    return prefix + item.id
  }

  onLineClick(line: MooringLine): void {
    this.selectedLine.set(line)
    this.view.set('item-detail')
  }

  closeDetail(): void {
    this.view.set('canvas')
    this.selectedItem.set(null)
    this.selectedLine.set(null)
  }

  trafficLight(line: MooringLine): TrafficLightColor {
    if (line.status === 'RETIRED' || line.status === 'OUT_OF_SERVICE') return 'GREY'
    const inspections = line.inspections ?? []
    if (inspections.length === 0) return 'GREY'
    const hasRed = inspections.some((i: any) =>
      i.actionRequired === 'RETIRE' || i.overallCondition === 'RETIRE' ||
      i.actionRequired === 'EARLY_REINSPECTION' || i.wearZoneStatus === 'CRITICAL'
    )
    if (hasRed) return 'RED'
    const hasAmber = inspections.some((i: any) =>
      i.actionRequired === 'MONITOR' || i.overallCondition === 'MARGINAL' ||
      i.wearZoneStatus === 'MONITOR'
    )
    if (hasAmber) return 'AMBER'
    return 'GREEN'
  }

  get redCount(): number { return this.shipSvc.$mooring()?.lines.filter(l => this.trafficLight(l) === 'RED').length ?? 0 }
  get amberCount(): number { return this.shipSvc.$mooring()?.lines.filter(l => this.trafficLight(l) === 'AMBER').length ?? 0 }
  get greenCount(): number { return this.shipSvc.$mooring()?.lines.filter(l => this.trafficLight(l) === 'GREEN').length ?? 0 }

  getItemsForCanvas(): any[] {
    return this.shipSvc.$mooring()?.items ?? []
  }

  getLinesForCanvas(): any[] {
    return this.shipSvc.$mooring()?.lines ?? []
  }
}
