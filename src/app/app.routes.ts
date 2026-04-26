import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'
import { LoginComponent } from './features/auth/login.component'
import { LayoutComponent } from './features/layout/layout.component'
import { FleetComponent } from './features/fleet/fleet.component'

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'fleet', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'fleet', pathMatch: 'full' },
      { path: 'fleet',     component: FleetComponent },
      {
        path: 'ship/:id',
        loadChildren: () =>
          import('./features/ship-detail/ship-detail.routes').then(m => m.shipDetailRoutes),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin.component').then(m => m.AdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
]
