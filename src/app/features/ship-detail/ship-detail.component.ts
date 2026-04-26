import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { RouterOutlet, ActivatedRoute } from '@angular/router'
import { ShipService } from '../../core/service/ship.service'
import { ShipHeaderComponent } from '../../shared/ship-header.component'
import { ShipBottomNavComponent } from './ship-bottom-nav.component'

@Component({
  selector: 'app-ship-detail',
  standalone: true,
  imports: [RouterOutlet, ShipHeaderComponent, ShipBottomNavComponent],
  templateUrl: './ship-detail.component.html',
})
export class ShipDetailComponent implements OnInit, OnDestroy {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  ngOnInit(): void {
    const shipId = this.route.snapshot.paramMap.get('id')!
    this.shipSvc.loadShip(shipId)
    this.shipSvc.loadSailingDirection(shipId)
  }

  ngOnDestroy(): void {
    this.shipSvc.reset()
  }

  get shipId(): string {
    return this.route.snapshot.paramMap.get('id')!
  }
}
