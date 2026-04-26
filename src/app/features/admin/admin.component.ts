import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FleetService } from '../../core/service/fleet.service';
import { AuthService } from '../../core/service/auth.service';
import { ApiService } from '../../core/service/api.service';
import { SyncBadgeComponent } from '../../shared/sync-badge.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, SyncBadgeComponent],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-primary">Admin — ETA Office</h1>
        <button class="btn btn-sm btn-ghost" (click)="logout()">Logout</button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Server Info -->
        <section class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base">Server Info</h2>
            @if (serverInfo()) {
              <dl class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt class="text-base-content/60">Port</dt>
                <dd class="font-mono">{{ serverInfo().port }}</dd>
                <dt class="text-base-content/60">Uptime</dt>
                <dd>{{ formatUptime(serverInfo().uptime) }}</dd>
                <dt class="text-base-content/60">Node version</dt>
                <dd class="font-mono">{{ serverInfo().nodeVersion }}</dd>
                <dt class="text-base-content/60">Environment</dt>
                <dd class="font-mono">{{ serverInfo().env }}</dd>
                @if (serverInfo().pm2) {
                  <dt class="text-base-content/60">PM2 status</dt>
                  <dd>
                    <span class="badge badge-xs"
                          [class.badge-success]="serverInfo().pm2.status === 'online'"
                          [class.badge-error]="serverInfo().pm2.status !== 'online'">
                      {{ serverInfo().pm2.status }}
                    </span>
                  </dd>
                  <dt class="text-base-content/60">Mode</dt>
                  <dd class="font-mono">{{ serverInfo().pm2.mode }}</dd>
                  <dt class="text-base-content/60">Restarts</dt>
                  <dd class="font-mono">{{ serverInfo().pm2.restarts }}</dd>
                  <dt class="text-base-content/60">CPU</dt>
                  <dd class="font-mono">{{ serverInfo().pm2.cpu }}</dd>
                  <dt class="text-base-content/60">Memory</dt>
                  <dd class="font-mono">{{ serverInfo().pm2.memory }}</dd>
                }
              </dl>
            } @else if (infoLoading()) {
              <span class="loading loading-spinner loading-sm"></span>
            } @else {
              <p class="text-sm text-base-content/40">Restarting — reload in a few seconds.</p>
            }
            <div class="mt-3">
              @if (showRestartConfirm()) {
                <div class="alert alert-warning py-2 text-sm mb-2">
                  <span>Press again within 5 seconds to confirm.</span>
                </div>
              }
              <button class="btn btn-warning btn-sm"
                      [disabled]="restartLoading()"
                      (click)="confirmRestart()">
                @if (restartLoading()) {
                  <span class="loading loading-spinner loading-xs"></span>
                } @else {
                  <span class="material-icons text-sm">restart_alt</span>
                }
                {{ showRestartConfirm() ? 'Confirm restart' : 'Restart Server' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Ships Management -->
        <section class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <div class="flex justify-between items-center mb-2">
              <h2 class="card-title text-base">Ships Management</h2>
              <button class="btn btn-primary btn-sm" (click)="openAdd()">
                + Add Ship
              </button>
            </div>
            @if (shipActionError()) {
              <div class="alert alert-error py-2 text-sm mb-2">{{ shipActionError() }}</div>
            }
            <div class="overflow-x-auto max-h-80">
              <table class="table table-xs">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>IMO</th>
                    <th>Last sync</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (ship of allShips(); track ship.id) {
                    <tr [class.opacity-50]="ship.active === 0">
                      <td class="font-medium">{{ ship.name }}</td>
                      <td class="text-base-content/60">{{ ship.imoNumber ?? '—' }}</td>
                      <td><app-sync-badge [lastSyncAt]="ship.lastSyncAt" /></td>
                      <td>
                        @if (ship.active === 0) {
                          <span class="badge badge-warning badge-xs">OUT OF SERVICE</span>
                        } @else {
                          <span class="badge badge-success badge-xs">ACTIVE</span>
                        }
                      </td>
                      <td class="flex gap-1 items-center">
                        <button class="btn btn-ghost btn-xs"
                                [disabled]="regenLoading() === ship.id || ship.active === 0"
                                (click)="regenToken(ship.id, ship.name)"
                                title="Regen token">
                          @if (regenLoading() === ship.id) {
                            <span class="loading loading-spinner loading-xs"></span>
                          } @else {
                            <span class="material-icons text-sm">key</span>
                          }
                        </button>
                        <button class="btn btn-ghost btn-xs text-info"
                                [disabled]="syncRequestLoading() === ship.id || ship.active === 0"
                                (click)="requestSync(ship.id)"
                                [title]="ship.forceFullSync ? 'Cancel sync request' : 'Request full sync'">
                          @if (syncRequestLoading() === ship.id) {
                            <span class="loading loading-spinner loading-xs"></span>
                          } @else if (ship.forceFullSync === 1) {
                            <span class="material-icons text-sm text-info opacity-50">sync</span>
                          } @else {
                            <span class="material-icons text-sm">sync</span>
                          }
                        </button>
                        <button class="btn btn-ghost btn-xs text-warning"
                                [disabled]="shipActionLoading() === ship.id"
                                (click)="openOutOfService(ship)"
                                [title]="ship.active ? 'Put out of service' : 'Reactivate'">
                          @if (shipActionLoading() === ship.id) {
                            <span class="loading loading-spinner loading-xs"></span>
                          } @else {
                            <span class="material-icons text-sm">{{ ship.active ? 'do_not_disturb' : 'check_circle' }}</span>
                          }
                        </button>
                        <button class="btn btn-ghost btn-xs text-error"
                                [disabled]="shipActionLoading() === ship.id"
                                (click)="openDelete(ship)"
                                title="Elimina nave">
                          <span class="material-icons text-sm">delete_forever</span>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="text-center text-base-content/40">No ships</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Global Sync Log -->
        <section class="card bg-base-200 shadow-sm lg:col-span-2">
          <div class="card-body">
            <div class="flex justify-between items-center mb-2">
              <h2 class="card-title text-base">Global Sync Log</h2>
              <button
                class="btn btn-ghost btn-sm"
                [disabled]="logLoading()"
                (click)="loadSyncLog()"
              >
                @if (logLoading()) {
                  <span class="loading loading-spinner loading-xs"></span>
                }
                Refresh
              </button>
            </div>
            @if (syncLog().length > 0) {
              <div class="overflow-x-auto max-h-64">
                <table class="table table-xs">
                  <thead>
                    <tr>
                      <th>Ship</th>
                      <th>Date/Time</th>
                      <th>Status</th>
                      <th>Size (KB)</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of syncLog(); track row.id) {
                      <tr>
                        <td class="font-medium">
                          {{ row.shipName ?? row.shipId }}
                        </td>
                        <td class="whitespace-nowrap">
                          {{ row.receivedAt | date: 'dd/MM HH:mm:ss' }}
                        </td>
                        <td>
                          <span
                            class="badge badge-xs"
                            [class.badge-success]="row.success"
                            [class.badge-error]="!row.success"
                          >
                            {{ row.success ? 'OK' : 'FAIL' }}
                          </span>
                        </td>
                        <td>{{ row.payloadSizeKb ?? '—' }}</td>
                        <td
                          class="max-w-xs truncate"
                          title="{{ row.errorMsg }}"
                        >
                          {{ row.errorMsg ?? '—' }}
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td
                          colspan="5"
                          class="text-center text-base-content/40"
                        >
                          No sync records
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else if (logLoading()) {
              <span class="loading loading-spinner loading-sm"></span>
            } @else {
              <p class="text-sm text-base-content/40">No sync records yet.</p>
            }
          </div>
        </section>

        <!-- Danger Zone -->
        <section
          class="card bg-base-200 shadow-sm border border-error/30 lg:col-span-2"
        >
          <div class="card-body">
            <h2 class="card-title text-base text-error">Danger Zone</h2>
            @if (showClearConfirm()) {
              <div class="alert alert-warning py-2 text-sm mb-2">
                <span>Press again within 5 seconds to confirm.</span>
              </div>
            }
            <button
              class="btn btn-error btn-sm"
              [disabled]="clearing()"
              (click)="confirmClear()"
            >
              @if (clearing()) {
                <span class="loading loading-spinner loading-xs"></span>
              }
              {{
                showClearConfirm() ? 'Confirm — Clear Data' : 'Clear Ship Data'
              }}
            </button>
            @if (clearMsg()) {
              <div
                class="alert alert-sm mt-2 py-1 text-sm"
                [class.alert-success]="!clearError()"
                [class.alert-error]="clearError()"
              >
                {{ clearMsg() }}
              </div>
            }
          </div>
        </section>
      </div>
    </div>

    <!-- Add ship modal -->
    @if (showAddModal()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">Register new ship</h3>

          @if (addError()) {
            <div class="alert alert-error mb-3 py-2 text-sm">
              {{ addError() }}
            </div>
          }

          <div class="flex flex-col gap-3">
            <label class="form-control">
              <span class="label-text text-xs">Ship ID *</span>
              <input
                class="input input-bordered input-sm"
                placeholder="mv-example-001"
                name="sid"
                [(ngModel)]="form.id"
              />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">Name *</span>
              <input
                class="input input-bordered input-sm"
                placeholder="MV Example"
                name="sname"
                [(ngModel)]="form.name"
              />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">IMO number</span>
              <input
                class="input input-bordered input-sm"
                placeholder="1234567"
                name="simo"
                [(ngModel)]="form.imoNumber"
              />
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label class="form-control">
                <span class="label-text text-xs">Flag</span>
                <input
                  class="input input-bordered input-sm"
                  placeholder="IT"
                  name="sflag"
                  [(ngModel)]="form.flag"
                />
              </label>
              <label class="form-control">
                <span class="label-text text-xs">Vessel type</span>
                <input
                  class="input input-bordered input-sm"
                  placeholder="Bulk Carrier"
                  name="svtype"
                  [(ngModel)]="form.vesselType"
                />
              </label>
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn btn-ghost btn-sm"
              (click)="showAddModal.set(false)"
            >
              Cancel
            </button>
            <button
              class="btn btn-primary btn-sm"
              [disabled]="addLoading()"
              (click)="submitAdd()"
            >
              @if (addLoading()) {
                <span class="loading loading-spinner loading-xs"></span>
              }
              Register
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="showAddModal.set(false)"></div>
      </div>
    }

    <!-- Out of service modal -->
    @if (outOfServiceTarget()) {
      @let oosTarget = outOfServiceTarget()!;
      <div class="modal modal-open">
        <div class="modal-box max-w-md">
          <h3 class="font-bold text-lg mb-1">
            {{ oosTarget.active ? 'Put out of service' : 'Reactivate ship' }}
          </h3>
          <div class="alert alert-warning py-3 text-sm my-4">
            <span class="material-icons text-base shrink-0">warning</span>
            @if (oosTarget.active) {
              <span>
                Setting <strong>{{ oosTarget.name }}</strong> out of service means it will
                no longer receive sync updates from the onboard app and will be excluded from
                KPIs and fleet reports. The ship and its historical data remain visible in the
                archive. This action is reversible.
              </span>
            } @else {
              <span>
                Reactivating <strong>{{ oosTarget.name }}</strong> will make it visible again
                in the fleet and reports. It will resume receiving sync updates from the onboard app.
              </span>
            }
          </div>
          @if (shipActionError()) {
            <div class="alert alert-error py-2 text-sm mb-2">{{ shipActionError() }}</div>
          }
          <div class="modal-action">
            <button class="btn btn-ghost btn-sm" (click)="outOfServiceTarget.set(null)">Cancel</button>
            <button class="btn btn-sm"
                    [class.btn-warning]="oosTarget.active"
                    [class.btn-success]="!oosTarget.active"
                    [disabled]="shipActionLoading() === oosTarget.id"
                    (click)="confirmOutOfService()">
              @if (shipActionLoading() === oosTarget.id) {
                <span class="loading loading-spinner loading-xs"></span>
              }
              {{ oosTarget.active ? 'Put out of service' : 'Reactivate' }}
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="outOfServiceTarget.set(null)"></div>
      </div>
    }

    <!-- Delete ship modal -->
    @if (deleteTarget()) {
      @let delTarget = deleteTarget()!;
      <div class="modal modal-open">
        <div class="modal-box max-w-md">
          <h3 class="font-bold text-lg text-error mb-1">Delete ship</h3>
          <div class="alert alert-error py-3 text-sm my-4">
            <span class="material-icons text-base shrink-0">delete_forever</span>
            <span>
              Deleting <strong>{{ delTarget.name }}</strong> is <strong>irreversible</strong>.
              All associated data will be permanently removed: rotation, noon positions, moorings,
              sync log, and the sync token. The ship will no longer be able to sync even if the
              onboard app attempts to connect.
            </span>
          </div>
          <label class="form-control mb-2">
            <span class="label-text text-xs mb-1">
              Type <strong>{{ delTarget.name }}</strong> to confirm
            </span>
            <input class="input input-bordered input-sm input-error"
                   placeholder="{{ delTarget.name }}"
                   [ngModel]="deleteConfirmText()"
                   (ngModelChange)="deleteConfirmText.set($event)" />
          </label>
          @if (shipActionError()) {
            <div class="alert alert-error py-2 text-sm mb-2">{{ shipActionError() }}</div>
          }
          <div class="modal-action">
            <button class="btn btn-ghost btn-sm" (click)="deleteTarget.set(null)">Cancel</button>
            <button class="btn btn-error btn-sm"
                    [disabled]="deleteConfirmText() !== delTarget.name || shipActionLoading() === delTarget.id"
                    (click)="confirmDelete()">
              @if (shipActionLoading() === delTarget.id) {
                <span class="loading loading-spinner loading-xs"></span>
              }
              Delete permanently
            </button>
          </div>
        </div>
        <div class="modal-backdrop" (click)="deleteTarget.set(null)"></div>
      </div>
    }

    <!-- New token display -->
    @if (newToken()) {
      <div class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-2">
            Sync token — {{ newTokenShip() }}
          </h3>
          <p class="text-sm text-base-content/60 mb-3">
            Copy this token and configure it on the ship. It won't be shown
            again.
          </p>
          <div
            class="bg-base-200 rounded p-3 font-mono text-sm break-all select-all"
          >
            {{ newToken() }}
          </div>
          <div class="modal-action">
            <button class="btn btn-primary btn-sm" (click)="newToken.set(null)">
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminComponent implements OnInit {
  protected fleetSvc = inject(FleetService);
  private authSvc = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  serverInfo = signal<any>(null);
  syncLog = signal<any[]>([]);
  infoLoading = signal(false);
  logLoading = signal(false);

  showAddModal = signal(false);
  addLoading = signal(false);
  addError = signal<string | null>(null);
  newToken = signal<string | null>(null);
  newTokenShip = signal<string | null>(null);
  regenLoading = signal<string | null>(null);
  form = { id: '', name: '', imoNumber: '', flag: '', vesselType: '' };

  allShips = signal<any[]>([]);

  outOfServiceTarget = signal<{ id: string; name: string; active: number } | null>(null);
  deleteTarget = signal<{ id: string; name: string } | null>(null);
  deleteConfirmText = signal('');
  shipActionLoading = signal<string | null>(null);
  shipActionError = signal<string | null>(null);

  showClearConfirm = signal(false);
  clearing = signal(false);
  clearMsg = signal<string | null>(null);
  clearError = signal(false);

  syncRequestLoading = signal<string | null>(null);
  showRestartConfirm = signal(false);
  restartLoading = signal(false);

  async ngOnInit() {
    await Promise.all([
      this.loadServerInfo(),
      this.loadSyncLog(),
      this.loadAllShips(),
    ]);
  }

  async loadAllShips() {
    try {
      this.allShips.set(await this.api.getAllShipsAdmin());
    } catch (e: any) {
      console.error('Failed to load ships:', e);
    }
  }

  async loadServerInfo() {
    this.infoLoading.set(true);
    try {
      this.serverInfo.set(await this.api.getAdminInfo());
    } catch (e: any) {
      console.error('Failed to load server info:', e);
    } finally {
      this.infoLoading.set(false);
    }
  }

  async loadSyncLog() {
    this.logLoading.set(true);
    try {
      this.syncLog.set(await this.api.getAdminSyncLog());
    } catch (e: any) {
      console.error('Failed to load sync log:', e);
    } finally {
      this.logLoading.set(false);
    }
  }

  formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }

  openAdd(): void {
    this.form = { id: '', name: '', imoNumber: '', flag: '', vesselType: '' };
    this.addError.set(null);
    this.showAddModal.set(true);
  }

  async submitAdd(): Promise<void> {
    if (!this.form.id || !this.form.name) {
      this.addError.set('Ship ID and name are required');
      return;
    }
    this.addLoading.set(true);
    this.addError.set(null);
    try {
      const res = await this.api.addShip({
        id: this.form.id,
        name: this.form.name,
        imoNumber: this.form.imoNumber || undefined,
        flag: this.form.flag || undefined,
        vesselType: this.form.vesselType || undefined,
      });
      this.showAddModal.set(false);
      this.newToken.set(res.syncToken);
      this.newTokenShip.set(this.form.name);
      await this.fleetSvc.loadFleet();
    } catch (e: any) {
      this.addError.set(e.message ?? 'Failed to add ship');
    } finally {
      this.addLoading.set(false);
    }
  }

  async regenToken(shipId: string, shipName: string): Promise<void> {
    this.regenLoading.set(shipId);
    try {
      const res = await this.api.regenToken(shipId);
      this.newToken.set(res.syncToken);
      this.newTokenShip.set(shipName);
    } catch (e: any) {
      alert('Failed to regenerate token: ' + (e.message ?? ''));
    } finally {
      this.regenLoading.set(null);
    }
  }

  openOutOfService(ship: any) {
    this.outOfServiceTarget.set({ id: ship.id, name: ship.name, active: ship.active });
    this.shipActionError.set(null);
  }

  async confirmOutOfService() {
    const t = this.outOfServiceTarget();
    if (!t) return;
    this.shipActionLoading.set(t.id);
    this.shipActionError.set(null);
    try {
      await this.api.setShipStatus(t.id, t.active === 0);
      await this.loadAllShips();
      this.outOfServiceTarget.set(null);
    } catch (e: any) {
      this.shipActionError.set(e.message ?? 'Operation failed');
    } finally {
      this.shipActionLoading.set(null);
    }
  }

  openDelete(ship: any) {
    this.deleteTarget.set({ id: ship.id, name: ship.name });
    this.deleteConfirmText.set('');
    this.shipActionError.set(null);
  }

  async confirmDelete() {
    const t = this.deleteTarget();
    if (!t) return;
    this.shipActionLoading.set(t.id);
    this.shipActionError.set(null);
    try {
      await this.api.deleteShip(t.id);
      await this.loadAllShips();
      this.deleteTarget.set(null);
    } catch (e: any) {
      this.shipActionError.set(e.message ?? 'Deletion failed');
    } finally {
      this.shipActionLoading.set(null);
    }
  }

  confirmClear() {
    if (!this.showClearConfirm()) {
      this.showClearConfirm.set(true);
      setTimeout(() => this.showClearConfirm.set(false), 5000);
      return;
    }
    this.clearData();
  }

  async clearData() {
    this.clearing.set(true);
    this.clearMsg.set(null);
    this.clearError.set(false);
    try {
      this.clearMsg.set('Feature not implemented yet');
      this.clearError.set(true);
    } catch (e: any) {
      this.clearMsg.set(e?.message ?? 'Failed to clear data');
      this.clearError.set(true);
    } finally {
      this.clearing.set(false);
      this.showClearConfirm.set(false);
    }
  }

  async requestSync(shipId: string): Promise<void> {
    this.syncRequestLoading.set(shipId);
    try {
      await this.api.requestSync(shipId);
      await this.loadAllShips();
    } catch (e: any) {
      alert('Sync request error: ' + (e.message ?? ''));
    } finally {
      this.syncRequestLoading.set(null);
    }
  }

  confirmRestart() {
    if (!this.showRestartConfirm()) {
      this.showRestartConfirm.set(true);
      setTimeout(() => this.showRestartConfirm.set(false), 5000);
      return;
    }
    this.doRestart();
  }

  async doRestart(): Promise<void> {
    this.restartLoading.set(true);
    this.showRestartConfirm.set(false);
    try {
      await this.api.restartServer();
    } catch {
      // server disconnects immediately — expected
    }
    setTimeout(() => window.location.reload(), 3000);
  }

  logout() {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }
}
