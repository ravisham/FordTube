import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

/**
 * @description UserAuthGuard restricts access to routes until the user is authenticated.
 */
@Injectable({
  providedIn: 'root'
})
export class UserAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private jwtHelperService: JwtHelperService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (localStorage.getItem("token") != null) {
          let isExpired = this.jwtHelperService.isTokenExpired(localStorage.getItem("token"));
          if (isExpired == true) {
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url.replace("?", "%%%%%").replace(/&/g, '%%%%%%') } });

          }
        }
        if (isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url.replace("?", "%%%%%").replace(/&/g, '%%%%%%') } });
          return false;
        }
      })
    );
  }
}
