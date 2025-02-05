import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../../../domain/services/authentication.service';
import { environment } from 'src/environments/environment';
import { UserProfileService } from '../services/user.profile.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Guard to protect routes that require authentication and specific roles.
 */
export class SecurityGuard implements CanActivate {
  /**
   * Constructor for SecurityGuard.
   * @param authenticationService The service for authentication operations.
   * @param userProfileService The service for user profile operations.
   */
  constructor(
    private authenticationService: AuthenticationService,
    private userProfileService: UserProfileService
  ) { }

  /**
   * Determines whether the route can be activated.
   * @param next The activated route snapshot.
   * @param state The router state snapshot.
   * @returns Observable<boolean> indicating whether the route can be activated.
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const token = this.authenticationService.getToken();
    if (!token) {
      this.redirectToAdfs();
      return new Observable<boolean>(observer => observer.next(false));
    }

    return this.authenticationService.validateToken().pipe(
      map(response => {
        if (response.valid) {
          this.userProfileService.fetchUserProfile().subscribe(profile => {
            if (profile) {
              this.userProfileService.setUserProfile(profile);
            }
          });
          return true;
        } else {
          this.redirectToAdfs();
          return false;
        }
      })
    );
  }

  /**
   * Redirects to ADFS for authentication.
   */
  private redirectToAdfs(): void {
    const returnUrl = encodeURIComponent(window.location.href);
    const adfsLoginUrl = `${environment.adfsDomain}/oauth2/authorize/` +
      `?client_id=${encodeURIComponent(environment.adfsClientId)}` +
      `&redirect_uri=${encodeURIComponent(environment.adfsRedirectUri)}` +
      `&resource=${encodeURIComponent(environment.adfsResource)}` +
      `&response_type=code&scope=openid%20profile%20email%20allatclaims%20user_impersonation` +
      `&response_mode=form_post&nonce=${Date.now()}` +
      `&state=${returnUrl}`;
    window.location.href = adfsLoginUrl;
  }
}
