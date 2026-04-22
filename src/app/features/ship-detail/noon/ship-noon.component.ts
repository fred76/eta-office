import { Component, inject, OnInit, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DecimalPipe } from '@angular/common'
import { ShipService } from '../../../core/service/ship.service'
import { ActivatedRoute } from '@angular/router'
import type { NoonPosition } from '../../../../../shared/noon-position.model'
import * as XLSX from 'xlsx'

@Component({
  selector: 'app-ship-noon',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './ship-noon.component.html',
})
export class ShipNoonComponent implements OnInit {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  filterVoyage = signal('')
  filterFrom   = signal('')
  filterTo     = signal('')
  selected     = signal<NoonPosition | null>(null)

  filteredEntries = computed(() => {
    let rows = this.shipSvc.$noon()
    const v = this.filterVoyage().toLowerCase()
    if (v) rows = rows.filter(r => r.voyageNumber?.toLowerCase().includes(v))
    if (this.filterFrom()) rows = rows.filter(r => r.date >= this.filterFrom())
    if (this.filterTo())   rows = rows.filter(r => r.date <= this.filterTo())
    return rows
  })

  ngOnInit(): void {
    const shipId = this.route.parent!.snapshot.paramMap.get('id')!
    this.shipSvc.loadNoon(shipId)
  }

  openDetail(entry: NoonPosition): void { this.selected.set(entry) }
  closeDetail(): void { this.selected.set(null) }

  exportExcel(): void {
    const rows = this.filteredEntries().map(e => ({
      Date: e.date, Voyage: e.voyageNumber, Condition: e.condition,
      'From': e.portFrom, 'To': e.portTo,
      Lat: `${e.lat} ${e.latHemi}`, Lon: `${e.lon} ${e.lonHemi}`,
      'Course (T)': e.courseTrue, 'SOG (kts)': e.speedSog, 'Log (kts)': e.speedLog,
      'Dist noon-noon': e.distanceSinceLastNoon, 'Dist to go': e.distanceToGo,
      'FO ROB (MT)': e.foRobMt, 'DO ROB (MT)': e.doRobMt,
      'FO cons (MT)': e.foConsumedMt, 'DO cons (MT)': e.doConsumedMt,
      Wind: `${e.windDirection} Bft${e.windBeaufort}`,
      'Sea state': e.seaState, 'Baro (hPa)': e.baroPressureHpa,
      'Air temp (°C)': e.airTempC, 'Sea temp (°C)': e.seaTempC,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Noon Log')
    XLSX.writeFile(wb, `noon-log-${this.shipSvc.$ship()?.name ?? 'ship'}.xlsx`)
  }
}
