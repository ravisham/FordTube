import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { UserTypeEnum } from '../../../domain/enums/usertype.enum';
import { AuthenticationService } from '../../../domain/services/authentication.service';
import { UserProfileService } from '../services/user.profile.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Guard to check if the user is an employee dealer admin.
 */
export class UserEmployeeDealerAdminGuard implements CanActivate {
  /**
   * Constructor for UserEmployeeDealerAdminGuard.
   * @param authenticationService The authentication service.
   * @param userProfileService The user profile service.
   */
  constructor(
    private authenticationService: AuthenticationService,
    private userProfileService: UserProfileService
  ) { }

  /**
   * Determines if the route can be activated.
   * @param next The activated route snapshot.
   * @param state The router state snapshot.
   * @returns An observable, promise, or boolean indicating if the route can be activated.
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.authenticationService.getToken();
    if (!token) {
      return false;
    }

    return this.authenticationService.validateToken().toPromise().then(response => {
      if (response.valid) {
        this.userProfileService.getUserProfile().subscribe(profile => {
          if (profile.userRoleId === UserRoleEnum.DEALER_ADMIN || profile.userRoleId === UserRoleEnum.SUPER_ADMIN || profile.userRoleId === UserRoleEnum.DEALER || profile.userTypeId === UserTypeEnum.Nonovvm || profile.userTypeId === UserTypeEnum.Supplier || profile.userTypeId === UserTypeEnum.Other) {
            return true;
          }
        });
        return false;
      } else {
        return false;
      }
    }).catch(() => {
      return false;
    });
  }
}
