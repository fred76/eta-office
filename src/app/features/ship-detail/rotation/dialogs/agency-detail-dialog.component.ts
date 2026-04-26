import { Component, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import type { ActivityModel } from '../../../../../../shared/rotation-machinery.interface'

@Component({
  selector: 'app-agency-detail-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="flex flex-col">
      <div class="bg-base-300 p-4 flex items-center gap-2">
        <span class="material-icons text-sky-500">person</span>
        <span class="font-semibold">Agency — {{ portName }}</span>
      </div>

      <div mat-dialog-content class="p-4">
        @if (a.agency) {
          <div class="space-y-3 text-sm">
            @if (a.agency.agName) {
              <div class="flex items-center gap-2">
                <span class="material-icons text-base opacity-60">person</span>
                <span class="font-semibold">{{ a.agency.agName }}</span>
              </div>
            }
            @if (a.agency.agMobile) {
              <div class="flex items-center gap-2">
                <span class="material-icons text-base opacity-60">phone</span>
                <span>{{ a.agency.agMobile }}</span>
              </div>
            }
            @if (a.agency.agEmail) {
              <div class="flex items-center gap-2">
                <span class="material-icons text-base opacity-60">email</span>
                <span>{{ a.agency.agEmail }}</span>
              </div>
            }
            @if (a.agency.agAddress) {
              <div class="flex items-start gap-2">
                <span class="material-icons text-base opacity-60">home</span>
                <span class="whitespace-pre-wrap">{{ a.agency.agAddress }}</span>
              </div>
            }
          </div>
        } @else {
          <p class="opacity-50 italic">No agency assigned for this activity.</p>
        }
      </div>

      <div mat-dialog-actions align="end" class="p-3 border-t">
        <button class="btn btn-sm" mat-dialog-close>Close</button>
      </div>
    </div>
  `,
})
export class AgencyDetailDialogComponent {
  a: ActivityModel

  constructor(@Inject(MAT_DIALOG_DATA) data: ActivityModel) {
    this.a = data
  }

  get portName(): string {
    return this.a.toBerth ?? '—'
  }
}