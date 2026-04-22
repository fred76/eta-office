import { Component, inject, OnInit, computed } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DecimalPipe } from '@angular/common'
import { FleetService } from '../../core/service/fleet.service'
import { SyncBadgeComponent } from '../../shared/sync-badge.component'
import type { ShipSummary } from '../../core/models/fleet.model'
import type { RotationModel, PortDataModel } from '../../../../shared/rotation-machinery.interface'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, SyncBadgeComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  protected fleetSvc = inject(FleetService)

  ngOnInit(): void {
    this.fleetSvc.loadFleet()
  }

  firstPort(rotation: RotationModel | null): string {
    return (rotation?.ports as any)?.[0]?.port ?? '—'
  }

  nextPort(rotation: RotationModel | null): string {
    if (!rotation?.ports?.length) return '—'
    const future = rotation.ports.find((p: any) => p.activities?.some((a: any) => !a.completed))
    return future?.port ?? rotation.ports[rotation.ports.length - 1]?.port ?? '—'
  }

  currentRobFO(rotation: RotationModel | null): number {
    if (!rotation?.ports?.length) return 0
    const port = rotation.ports[rotation.ports.length - 1]
    const activities = port?.activities ?? []
    const last = [...activities].reverse().find((a: any) => a.foRobMt !== undefined)
    return (last as any)?.foRobMt ?? rotation.initialFORob ?? 0
  }

  currentRobDO(rotation: RotationModel | null): number {
    if (!rotation?.ports?.length) return 0
    const port = rotation.ports[rotation.ports.length - 1]
    const activities = port?.activities ?? []
    const last = [...activities].reverse().find((a: any) => a.doRobMt !== undefined)
    return (last as any)?.doRobMt ?? rotation.initialDORob ?? 0
  }
}
