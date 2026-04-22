import { Component, inject, OnInit, computed } from '@angular/core'
import { DecimalPipe } from '@angular/common'
import * as XLSX from 'xlsx'
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ReportService } from '../../core/service/report.service'
import { SyncBadgeComponent } from '../../shared/sync-badge.component'

echarts.use([
  BarChart, LineChart, GridComponent, TooltipComponent,
  LegendComponent, TitleComponent, DataZoomComponent, CanvasRenderer,
])

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DecimalPipe, NgxEchartsDirective, SyncBadgeComponent],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  protected reportSvc = inject(ReportService)

  ngOnInit(): void {
    this.reportSvc.load()
  }

  bunkerChartOptions = computed(() => {
    const rows = this.reportSvc.$report()
    const names = rows.map(r => r.shipName)
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['FO consumed (MT)', 'DO consumed (MT)'] },
      xAxis: { type: 'category', data: names, axisLabel: { rotate: 15 } },
      yAxis: { type: 'value', name: 'MT' },
      series: [
        { name: 'FO consumed (MT)', type: 'bar', data: rows.map(r => r.foConsumedMt), itemStyle: { color: '#0f172a' } },
        { name: 'DO consumed (MT)', type: 'bar', data: rows.map(r => r.doConsumedMt), itemStyle: { color: '#38bdf8' } },
      ],
    }
  })

  exportExcel(): void {
    const rows = this.reportSvc.$report().map(r => ({
      Vessel: r.shipName,
      'Last sync': r.lastSyncAt ?? 'Never',
      'FO cons (MT)': r.foConsumedMt,
      'DO cons (MT)': r.doConsumedMt,
      'Avg speed (kts)': r.avgSpeedKts ?? '',
      'Mooring RED': r.mooring.red,
      'Mooring AMBER': r.mooring.amber,
      'Mooring GREEN': r.mooring.green,
      'Total lines': r.mooring.total,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Report')
    XLSX.writeFile(wb, 'fleet-report.xlsx')
  }

  speedChartOptions = computed(() => {
    const rows = this.reportSvc.$report()
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: rows.map(r => r.shipName) },
      yAxis: { type: 'value', name: 'kts', min: 0 },
      series: [{
        name: 'Avg speed (kts)',
        type: 'bar',
        data: rows.map(r => r.avgSpeedKts ?? 0),
        itemStyle: { color: '#334155' },
      }],
    }
  })
}
