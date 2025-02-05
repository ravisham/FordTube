import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { AuthenticationService } from '../../../domain/services/authentication.service';
import { UserProfileService } from '../services/user.profile.service';

@Injectable()
/**
 * Guard to check if the user is an admin.
 */
export class UserAdminGuard implements CanActivate {
  /**
   * Constructor for UserAdminGuard.
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
   * @returns An observable, promise, or boolean indicating if the route can be activated.
   */
  canActivate(next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.authenticationService.getToken();
    if (!token) {
      return false;
    }

    return this.authenticationService.validateToken().toPromise().then(response => {
      if (response.valid) {
        this.userProfileService.getUserProfile().subscribe(userProfile => {
          if (userProfile.userRoleId === UserRoleEnum.DEALER_ADMIN || userProfile.userRoleId === UserRoleEnum.SUPER_ADMIN) {
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
