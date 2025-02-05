import { Component, OnInit, Input } from '@angular/core';
import { AdminMenuItems } from './enum/menu-items';
import { environment } from '../../../../environments/environment';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  templateUrl: './admin-nav.component.html',
  styleUrls: ['./admin-nav.component.scss']
})
export class AdminNavComponent implements OnInit {
  @Input()
  menuItem: AdminMenuItems;
  menuItems = AdminMenuItems;
  isCollapsed = true;

  constructor(private router: Router) {
    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.isCollapsed = true;
      }
    });
  }

  reportsRedirect() {
    window.open(environment.vbrickReportsUrl, '_blank').focus();
  }

  ngOnInit() {}
}
