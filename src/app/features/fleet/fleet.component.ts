import { Component, inject, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { FleetService } from '../../core/service/fleet.service'
import { AuthService } from '../../core/service/auth.service'
import { ApiService } from '../../core/service/api.service'
import { SyncBadgeComponent } from '../../shared/sync-badge.component'

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [RouterLink, FormsModule, SyncBadgeComponent],
  templateUrl: './fleet.component.html',
})
export class FleetComponent implements OnInit {
  protected fleetSvc = inject(FleetService)
  protected authSvc  = inject(AuthService)
  private api        = inject(ApiService)

  showAddModal  = signal(false)
  addLoading    = signal(false)
  addError      = signal<string | null>(null)
  newToken      = signal<string | null>(null)
  newTokenShip  = signal<string | null>(null)
  regenLoading  = signal<string | null>(null)

  form = { id: '', name: '', imoNumber: '', flag: '', vesselType: '' }

  ngOnInit(): void {
    this.fleetSvc.loadFleet()
  }

  openAdd(): void {
    this.form = { id: '', name: '', imoNumber: '', flag: '', vesselType: '' }
    this.addError.set(null)
    this.showAddModal.set(true)
  }

  async submitAdd(): Promise<void> {
    if (!this.form.id || !this.form.name) {
      this.addError.set('Ship ID and name are required')
      return
    }
    this.addLoading.set(true)
    this.addError.set(null)
    try {
      const res = await this.api.addShip({
        id: this.form.id, name: this.form.name,
        imoNumber: this.form.imoNumber || undefined,
        flag: this.form.flag || undefined,
        vesselType: this.form.vesselType || undefined,
      })
      this.showAddModal.set(false)
      this.newToken.set(res.syncToken)
      this.newTokenShip.set(this.form.name)
      await this.fleetSvc.loadFleet()
    } catch (e: any) {
      this.addError.set(e.message ?? 'Failed to add ship')
    } finally {
      this.addLoading.set(false)
    }
  }

  async regenToken(shipId: string, shipName: string): Promise<void> {
    this.regenLoading.set(shipId)
    try {
      const res = await this.api.regenToken(shipId)
      this.newToken.set(res.syncToken)
      this.newTokenShip.set(shipName)
    } catch (e: any) {
      alert('Failed to regenerate token: ' + (e.message ?? ''))
    } finally {
      this.regenLoading.set(null)
    }
  }
}
