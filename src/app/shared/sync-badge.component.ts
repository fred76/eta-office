import { Component, input, computed } from '@angular/core'
import { CommonModule } from '@angular/common'

type SyncStatus = 'ok' | 'late' | 'critical' | 'never'

@Component({
  selector: 'app-sync-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sync-badge.component.html',
})
export class SyncBadgeComponent {
  lastSyncAt = input<string | null>(null)

  status = computed<SyncStatus>(() => {
    const ts = this.lastSyncAt()
    if (!ts) return 'never'
    const ageMs = Date.now() - new Date(ts).getTime()
    const ageH  = ageMs / 3_600_000
    if (ageH < 4)  return 'ok'
    if (ageH < 12) return 'late'
    return 'critical'
  })

  label = computed(() => {
    const ts = this.lastSyncAt()
    if (!ts) return 'Never'
    const ageMs = Date.now() - new Date(ts).getTime()
    const ageH  = Math.floor(ageMs / 3_600_000)
    const ageM  = Math.floor((ageMs % 3_600_000) / 60_000)
    if (ageH === 0) return `${ageM}m ago`
    return `${ageH}h ago`
  })
}
