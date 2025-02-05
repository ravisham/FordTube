import { animate, state, style, transition, trigger } from '@angular/animations';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Component, HostBinding, OnInit, AfterViewInit } from '@angular/core';
import { SideNavService } from './services/side-nav.service';
import { CategoriesService } from '../../domain/services/categories.service';
import { UserRoleEnum } from '../../domain/enums/userroletype.enum';
import { Router, NavigationStart } from '@angular/router';
import { UserTypeEnum } from '../../domain/enums/usertype.enum';
import { UserService } from '../../core/user/user.service';

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
  state = 'void';
  categories: any[] = [];
  isCollapsed = true;

  constructor(
    private sideNavService: SideNavService,
    private categoriesService: CategoriesService,
    private router: Router,
    private userService: UserService
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

  @HostBinding('@transform')
  get toggleState() {
    return this.state;
  }

  get showEmployeeDealerItems(): boolean {
    return this.checkUserRoles([
      UserRoleEnum.SUPER_ADMIN,
      UserRoleEnum.DEALER_ADMIN,
      UserRoleEnum.DEALER
    ], [
      UserTypeEnum.Nonovvm,
      UserTypeEnum.Supplier,
      UserTypeEnum.Other
    ]);
  }

  get showDealerItems(): boolean {
    return this.checkUserRoles([
      UserRoleEnum.SUPER_ADMIN,
      UserRoleEnum.DEALER_ADMIN,
      UserRoleEnum.DEALER
    ]);
  }

  get showAdminItems(): boolean {
    return this.checkUserRoles([
      UserRoleEnum.SUPER_ADMIN
    ]);
  }

  ngOnInit() {
    this.sideNavService.getToggleMenu().subscribe((open: boolean) => {
      this.userService.user$.subscribe(user => {
        if (user) {
          this.username = user.userName;
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
    this.userService.users().pipe(
      switchMap(user => {
        if (user) {
          return this.categoriesService.getRoot();
        } else {
          return of([]);
        }
      })
    ).subscribe(
      response => {
        this.categories = response;
      },
      error => console.log('Error: ', error)
    );
  }

  private checkUserRoles(validRoles: UserRoleEnum[], validTypes?: UserTypeEnum[]): boolean {
    let showItems = false;
    this.userService.user$.subscribe(user => {
      if (user) {
        const userRole = user.userRoleId;
        const userType = user.userTypeId;
        showItems = validRoles.includes(userRole) || (validTypes && validTypes.includes(userType));
      }
    }).unsubscribe();
    return showItems;
  }
}
