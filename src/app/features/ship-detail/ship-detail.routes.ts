import { Routes } from '@angular/router'
import { ShipDetailComponent } from './ship-detail.component'

export const shipDetailRoutes: Routes = [
  {
    path: '',
    component: ShipDetailComponent,
    children: [
      { path: '', redirectTo: 'rotation', pathMatch: 'full' },
      {
        path: 'rotation',
        loadComponent: () =>
          import('./rotation/ship-rotation.component').then(m => m.ShipRotationComponent),
      },
      {
        path: 'noon',
        loadComponent: () =>
          import('./noon/ship-noon.component').then(m => m.ShipNoonComponent),
      },
      {
        path: 'mooring',
        loadComponent: () =>
          import('./mooring/ship-mooring.component').then(m => m.ShipMooringComponent),
      },
      {
        path: 'sync',
        loadComponent: () =>
          import('./sync-log/ship-sync-log.component').then(m => m.ShipSyncLogComponent),
      },
      {
        path: 'sailing-direction',
        loadComponent: () =>
          import('./sailing-direction/ship-sailing-direction.component')
            .then(m => m.ShipSailingDirectionComponent),
      },
    ],
  },
]
