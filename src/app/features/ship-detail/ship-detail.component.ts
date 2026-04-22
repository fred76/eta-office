import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router'
import { ShipService } from '../../core/service/ship.service'
import { ShipHeaderComponent } from '../../shared/ship-header.component'

@Component({
  selector: 'app-ship-detail',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ShipHeaderComponent],
  templateUrl: './ship-detail.component.html',
})
export class ShipDetailComponent implements OnInit, OnDestroy {
  protected shipSvc = inject(ShipService)
  private route     = inject(ActivatedRoute)

  ngOnInit(): void {
    const shipId = this.route.snapshot.paramMap.get('id')!
    this.shipSvc.loadShip(shipId)
  }

  ngOnDestroy(): void {
    this.shipSvc.reset()
  }

  get shipId(): string {
    return this.route.snapshot.paramMap.get('id')!
  }
}
