import { Component, inject } from '@angular/core';
import { ShipService } from '../../../core/service/ship.service';
import { ActivityTimelineReadonlyComponent } from './activity-timeline-readonly.component';
import type { ActivityModel } from '../../../../../shared/rotation-machinery.interface';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-ship-rotation',
  standalone: true,
  imports: [ActivityTimelineReadonlyComponent],
  templateUrl: './ship-rotation.component.html',
})
export class ShipRotationComponent {
  protected shipSvc = inject(ShipService);

  rotation = this.shipSvc.$rotation;

  robFO(activity: ActivityModel): number | null {
    return (activity as any).robFO_Derived ?? null;
  }

  robDO(activity: ActivityModel): number | null {
    return (activity as any).robDO_Derived ?? null;
  }

  activityIcon(a: ActivityModel): string {
    const map: Record<string, string> = {
      'Sea Passage': '⛵',
      Loading: '📦',
      Discharging: '📤',
      Bunkering: '⛽',
      Anchoring: '⚓',
      'Pilotage Inbound': '🔼',
      'Pilotage Outbound': '🔽',
      'Canal Transit': '🌊',
      Drifting: '🌀',
    };
    return map[a.activityType ?? ''] ?? '●';
  }

  durationH(a: ActivityModel): string {
    if (!a.timeNeededForOperation) return '—';
    const h = Math.floor(a.timeNeededForOperation);
    const m = Math.round((a.timeNeededForOperation - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  exportExcel(): void {
    const rot = this.rotation();
    if (!rot) return;
    const rows: any[] = [];
    for (const port of rot.ports) {
      for (const a of port.activities ?? []) {
        rows.push({
          Port: port.port,
          Voyage: port.voyageNumber ?? '',
          Activity: a.activityType ?? '',
          Duration: this.durationH(a),
          'Distance (nm)': a.distance ?? '',
          'Speed (kts)': a.speedKts ?? '',
          'ROB FO': this.robFO(a) ?? '',
          'ROB DO': this.robDO(a) ?? '',
          Notes: a.notes ?? '',
        });
      }
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rotation');
    XLSX.writeFile(wb, `rotation-${this.shipSvc.$ship()?.name ?? 'ship'}.xlsx`);
  }

  exportPDF(): void {
    const rot = this.rotation();
    if (!rot) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const ship = this.shipSvc.$ship();
    doc.setFontSize(14);
    doc.text(`Rotation — ${ship?.name ?? 'Ship'}`, 14, 16);
    doc.setFontSize(9);
    doc.text(
      `Initial FO ROB: ${rot.initialFORob ?? '—'} MT   DO ROB: ${rot.initialDORob ?? '—'} MT`,
      14,
      23,
    );

    const body: any[][] = [];
    for (const port of rot.ports) {
      for (const a of port.activities ?? []) {
        body.push([
          port.port ?? '',
          port.voyageNumber ?? '',
          a.activityType ?? '',
          this.durationH(a),
          a.distance != null ? `${Math.round(a.distance)} nm` : '—',
          a.speedKts != null ? `${a.speedKts} kts` : '—',
          this.robFO(a) != null ? `${Math.round(this.robFO(a)!)}` : '—',
          this.robDO(a) != null ? `${Math.round(this.robDO(a)!)}` : '—',
        ]);
      }
    }

    autoTable(doc, {
      startY: 28,
      head: [
        [
          'Port',
          'Voyage',
          'Activity',
          'Duration',
          'Distance',
          'Speed',
          'ROB FO',
          'ROB DO',
        ],
      ],
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });
    doc.save(`rotation-${ship?.name ?? 'ship'}.pdf`);
  }
}
