import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import type { ShipSummary, AuthResponse, SyncReceipt } from '../models/fleet.model'
import type { RotationModel, MachineryModel } from '../../../../shared/rotation-machinery.interface'
import type { NoonPosition } from '../../../../shared/noon-position.model'
import type { PortWithBerths } from '../../../../shared/sailing-direction.interface'

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient)

  // Auth
  login(email: string, password: string): Promise<AuthResponse> {
    return firstValueFrom(this.http.post<AuthResponse>('/api/auth/login', { email, password }))
  }

  // Fleet
  getFleet(): Promise<ShipSummary[]> {
    return firstValueFrom(this.http.get<ShipSummary[]>('/api/fleet'))
  }

  getShip(shipId: string): Promise<ShipSummary> {
    return firstValueFrom(this.http.get<ShipSummary>(`/api/fleet/${shipId}`))
  }

  // Ship data
  getRotation(shipId: string): Promise<RotationModel | null> {
    return firstValueFrom(this.http.get<RotationModel | null>(`/api/ship/${shipId}/rotation`))
  }

  getMachinery(shipId: string): Promise<MachineryModel | null> {
    return firstValueFrom(this.http.get<MachineryModel | null>(`/api/ship/${shipId}/machinery`))
  }

  getNoonPositions(shipId: string): Promise<NoonPosition[]> {
    return firstValueFrom(this.http.get<NoonPosition[]>(`/api/ship/${shipId}/noon`))
  }

  getMooring(shipId: string): Promise<{ items: any[]; lines: any[] }> {
    return firstValueFrom(this.http.get<{ items: any[]; lines: any[] }>(`/api/ship/${shipId}/mooring`))
  }

  getSyncLog(shipId: string): Promise<SyncReceipt[]> {
    return firstValueFrom(this.http.get<SyncReceipt[]>(`/api/ship/${shipId}/sync-log`))
  }

  getShipSailingDirection(shipId: string): Promise<PortWithBerths[]> {
    return firstValueFrom(this.http.get<PortWithBerths[]>(`/api/ship/${shipId}/sailing-direction`))
  }

  getFleetReport(): Promise<FleetReportRow[]> {
    return firstValueFrom(this.http.get<FleetReportRow[]>('/api/reports'))
  }

  addShip(payload: { id: string; name: string; imoNumber?: string; flag?: string; vesselType?: string }): Promise<{ id: string; syncToken: string }> {
    return firstValueFrom(this.http.post<{ id: string; syncToken: string }>('/api/fleet', payload))
  }

  regenToken(shipId: string): Promise<{ syncToken: string }> {
    return firstValueFrom(this.http.post<{ syncToken: string }>(`/api/fleet/${shipId}/regen-token`, {}))
  }

  // Admin
  getAdminInfo(): Promise<{ uptime: number; nodeVersion: string; env: string; port: number }> {
    return firstValueFrom(this.http.get<{ uptime: number; nodeVersion: string; env: string; port: number }>('/api/admin/info'))
  }

  getAdminSyncLog(limit?: number): Promise<any[]> {
    const url = limit ? `/api/admin/sync-log?limit=${limit}` : '/api/admin/sync-log'
    return firstValueFrom(this.http.get<any[]>(url))
  }

  getAllShipsAdmin(): Promise<{ id: string; name: string; imoNumber: string | null; lastSyncAt: string | null; active: number; forceFullSync: number }[]> {
    return firstValueFrom(this.http.get<any[]>('/api/admin/ships'))
  }

  requestSync(shipId: string): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.post<{ ok: boolean }>(`/api/admin/ships/${shipId}/request-sync`, {}))
  }

  restartServer(): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.post<{ ok: boolean }>('/api/admin/restart', {}))
  }

  setShipStatus(shipId: string, active: boolean): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.patch<{ ok: boolean }>(`/api/admin/ships/${shipId}/status`, { active }))
  }

  deleteShip(shipId: string): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.delete<{ ok: boolean }>(`/api/admin/ships/${shipId}`))
  }
}

export interface FleetReportRow {
  shipId:       string
  shipName:     string
  lastSyncAt:   string | null
  foConsumedMt: number
  doConsumedMt: number
  avgSpeedKts:  number | null
  mooring: { red: number; amber: number; green: number; total: number }
}
