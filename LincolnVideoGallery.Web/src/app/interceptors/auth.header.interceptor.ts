import { Injectable } from '@angular/core';
import { HttpHandler, HttpRequest, HttpInterceptor, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../domain/services/authentication.service';
import { environment } from '../../environments/environment';
import { FranchiseType } from '../domain/enums/franchisetype.enum';

@Injectable()
/**
 * Interceptor to add JWT token and franchise headers to the request and handle errors.
 */
export class AuthHeaderInterceptor implements HttpInterceptor {


    /**
   * Constructor for AuthHeaderInterceptor.
   * @param authenticationService The service for authentication operations.
   */
  constructor(private authenticationService: AuthenticationService) { }


    /**
   * Determines the franchise based on session storage or environment settings.
   * @returns The franchise type as a string.
   */
  getFranchise(): string {
    const franchise = sessionStorage.getItem('Franchise');
    if (franchise) {
      return franchise;
    }
    let franchiseType: string;
    switch (environment.franchise) {
      case FranchiseType.Ford:
        franchiseType = 'Ford';
        break;
      case FranchiseType.Lincoln:
        franchiseType = 'Lincoln';
        break;
      default:
        franchiseType = 'Both';
        break;
    }
    sessionStorage.setItem('Franchise', franchiseType);
    return franchiseType;
  }


    /**
   * Intercepts the HTTP request to add the Authorization and franchise headers.
   * Handles 401 Unauthorized errors by redirecting to ADFS for authentication.
   * @param req The HTTP request.
   * @param next The HTTP handler.
   * @returns Observable<HttpEvent<any>> The HTTP event observable.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authenticationService.getToken();
    const headersConfig: { [name: string]: string | string[] } = {
      'franchise': this.getFranchise()
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    const authReq = req.clone({ setHeaders: headersConfig });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.handleUnauthorizedError();
        }
        return throwError(error);
      })
    );
  }

    /**
   * Handles 401 Unauthorized errors by clearing the token and redirecting to ADFS.
   * @param token The current JWT token.
   */
  private handleUnauthorizedError(): void {
    this.authenticationService.clearToken();
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
