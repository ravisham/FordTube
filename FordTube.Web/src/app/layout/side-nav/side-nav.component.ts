import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, OnInit, AfterViewInit } from '@angular/core';

import { SideNavService } from './services/side-nav.service';
import { CategoriesService } from '../../domain/services/categories.service';
import { UserRoleEnum } from '../../domain/enums/userroletype.enum';
import { getCookie, setCookie } from '../../common/utilities/cookie-utilities';
import { Router, NavigationStart } from '@angular/router';
import { UserTypeEnum } from '../../domain/enums/usertype.enum';
import { UserProfileService } from '../../core/user/services/user.profile.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  animations: [
    trigger('transform', [
      state(
        'open',
        style({
          transform: 'translate3d(0, 0, 0)',
          visibility: 'visible'
        })
      ),
      state(
        'void',
        style({
          visibility: 'hidden'
        })
      ),
      transition('void => open', animate('250ms ease-in')),
      transition('open => void', animate('250ms ease-out'))
    ])
  ]
})
export class SideNavComponent implements OnInit, AfterViewInit {
  username: string;

  constructor(
    private sideNavService: SideNavService,
    private categoriesService: CategoriesService,
    private router: Router,
    private userProfileService: UserProfileService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.state === 'open') {
          this.state = 'void';
          this.isCollapsed = true;
          this.sideNavService.resetMenu();
        }
      }
    });
  }

  state = 'void';
  categories = [];
  isCollapsed = true;

  @HostBinding('@transform')
  get toggleState() {
    return this.state;
  }

  get showEmployeeDealerItems(): boolean {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    const userType = parseInt(getCookie('userTypeId'), 10);
    return (
      userRole === UserRoleEnum.SUPER_ADMIN ||
      userRole === UserRoleEnum.DEALER_ADMIN ||
      userRole === UserRoleEnum.DEALER ||
      userType === UserTypeEnum.Nonovvm ||
      userType === UserTypeEnum.Supplier ||
      userType === UserTypeEnum.Other
    );
  }

  get showDealerItems(): boolean {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    return userRole === UserRoleEnum.SUPER_ADMIN || userRole === UserRoleEnum.DEALER_ADMIN || userRole === UserRoleEnum.DEALER;
  }

  get showAdminItems(): boolean {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    return userRole === UserRoleEnum.SUPER_ADMIN || userRole === UserRoleEnum.DEALER_ADMIN;
  }

  ngOnInit() {
    this.sideNavService.getToggleMenu().subscribe((open: boolean) => {
      this.userProfileService.getUserProfile().subscribe(profile => {
        this.username = profile.userName;

        if (this.username != getCookie('userid')) {
          setCookie('userid', this.username);
        }

        if (profile.userRoleId != parseInt(getCookie('userRoleId'), 10)) {
          setCookie('userRoleId', profile.userRoleId.toString());
          setCookie('userTypeId', profile.userTypeId.toString());
        }
      });

      if (open) {
        this.state = 'open';
      } else {
        this.state = 'void';
        this.isCollapsed = true;
      }
    });
  }

  ngAfterViewInit(): void {
    this.getCategories();
  }

  toggleMenu($event: Event) {
    $event.preventDefault();
    this.sideNavService.setToggleMenu();
  }

  private getCategories() {
    this.categoriesService.getRoot().subscribe(
      response => {
        this.categories = response;
      },
      error => console.log('Error: ', error)
    );
  }
}
