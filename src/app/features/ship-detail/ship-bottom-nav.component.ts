import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-ship-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="btm-nav border-t border-slate-700 bg-slate-800 dark:bg-slate-900"
    >
      @for (tab of tabs; track tab.route) {
        <a
          class="flex flex-col flex-1 items-center justify-center gap-1
                  text-xs text-white/60 dark:text-white/50"
          routerLinkActive="!text-sky-400 border-t-2 border-sky-400"
          [routerLink]="[tab.route]"
        >
          <span class="material-icons text-xl leading-none">{{
            tab.icon
          }}</span>
          <span class="btm-nav-label">{{ tab.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class ShipBottomNavComponent {
  tabs = [
    { route: 'rotation', icon: 'sailing', label: 'Rotation' },
    { route: 'noon', icon: 'my_location', label: 'Noon' },
    { route: 'mooring', icon: 'anchor', label: 'Mooring' },
    { route: 'sailing-direction', icon: 'explore', label: 'Ports' },
    { route: 'sync', icon: 'sync', label: 'Sync' },
  ];
}
