import { Component, inject, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common'
import { ShipService } from '../../../core/service/ship.service'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-ship-sync-log',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './ship-sync-log.component.html',
})
export class ShipSyncLogComponent implements OnInit {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  ngOnInit(): void {
    const shipId = this.route.parent!.snapshot.paramMap.get('id')!
    this.shipSvc.loadSyncLog(shipId)
  }
}
