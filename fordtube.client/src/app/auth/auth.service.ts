import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { UserService } from '../core/user/user.service';
import { EncryptionService } from '../common/encryption/encryption.service';

/**
 * @description AuthService handles authentication logic, including token exchange, user information retrieval, and managing authentication state.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ : Observable<boolean>;
  private token: string | null = null;
  private franchise: string | null = null;


  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private encryptionService: EncryptionService
  ) {
    this.loadSession();
   this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Loads authentication and encryption keys from session storage.
   */
  private loadSession(): void {
    const token = localStorage.getItem('token');
    const franchise = localStorage.getItem('Franchise');
    const aesKey = localStorage.getItem('aesKey');

    if (token && aesKey) {
      this.token = token;
      this.franchise = franchise;
      this.isAuthenticatedSubject.next(true);
      this.encryptionService.setKey(aesKey);
      this.userService.loadUserInfo().subscribe();
    }
  }

  /**
   * Checks if the user is authenticated.
   * @returns {boolean} True if authenticated, false otherwise.
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Sets the authentication state and token.
   * @param {boolean} authenticated - Authentication state.
   * @param {string | null} token - JWT token.
   * @param {string | null} franchise - Franchise information.
   * @param {string} aesKey - AES key for decryption.
   */
  setAuthenticated(authenticated: boolean, token: string | null, franchise: string | null, aesKey: string = ''): void {
    this.isAuthenticatedSubject.next(authenticated);
    this.token = token;
    this.franchise = franchise;
    if (authenticated && token) {
      localStorage.setItem('token', token);
      if (franchise) {
        localStorage.setItem('Franchise', franchise);
      }
      if (aesKey) {
        this.encryptionService.setKey(aesKey);
        localStorage.setItem('aesKey', aesKey);
      }
      this.userService.loadUserInfo().subscribe();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('Franchise');
      localStorage.removeItem('aesKey');
    }
  }

  /**
   * Exchanges the access token for a JWT and loads the user information.
   * @param {string} accessToken - The access token from AD FS.
   * @returns {Promise<void>} A promise that resolves when the token is exchanged and user info is loaded.
   */
  exchangeToken(accessToken: string): Promise<void> {
    return this.http.post<{ token: string, franchise: string, aesKey: string }>(`${environment.maApiUrl}api/auth/exchange-token`, { accessToken })
      .toPromise()
      .then(response => {
        if (response && response.token && response.aesKey) {
          this.setAuthenticated(true, response.token, response.franchise, response.aesKey);
        } else {
          this.setAuthenticated(false, null, null, '');
          throw new Error('Token exchange failed');
        }
      })
      .catch(error => {
        console.error('Token exchange failed', error);
        this.setAuthenticated(false, null, null, '');
        throw error;
      });
  }

  /**
   * Refreshes the JWT token.
   * @returns {Observable<void>} An observable that emits when the token is refreshed.
   */
  refreshToken(): Observable<void> {
    const token = this.getToken();
    if (!token) {
      return throwError('No token to refresh');
    }
    return this.http.post<{ token: string, franchise: string, aesKey: string }>(`${environment.maApiUrl}api/auth/refresh-token`, { token })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.setAuthenticated(true, response.token, response.franchise, response.aesKey);
          } else {
            this.setAuthenticated(false, null, null, '');
            this.router.navigate(['/login']);
          }
        }),
        catchError(error => {
          console.error('Token refresh failed', error);
          this.setAuthenticated(false, null, null, '');
          this.router.navigate(['/login']);
          return throwError(error);
        }),
        map(() => void 0)
      );
  }

  /**
   * Logs out the user.
   */
  logout(): void {
    this.setAuthenticated(false, null, null, '');
    localStorage.removeItem('token');
    localStorage.clear();
    this.clearOAuthCookies();
  }

  /**
   * Gets the JWT token from session storage.
   * @returns {string | null} The JWT token.
   */
  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  /**
   * Gets the franchise from session storage.
   * @returns {string | null} The franchise.
   */
  getFranchise(): string | null {
    return this.franchise || localStorage.getItem('Franchise');
  }

  /**
   * Clears OAuth related cookies to prevent header size issues.
   */
  private clearOAuthCookies(): void {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      if (cookie.trim().startsWith('MSIS') || cookie.trim().startsWith('OAuthSessionInfo')) {
        document.cookie = cookie.split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
      }
    });
  }

  /**
   * Redirects the user to the ADFS login page.
   * @param {string} returnUrl - The return URL after login.
   */
  redirectToAdfs(returnUrl: string): void {
    const adfsLoginUrl = `${environment.adfsDomain}/oauth2/authorize/` +
      `?client_id=${encodeURIComponent(environment.adfsClientId)}` +
      `&redirect_uri=${encodeURIComponent(environment.adfsRedirectUri + "?returnURL=" + returnUrl)}` +
      `&resource=${encodeURIComponent(environment.adfsResource)}` +
      `&response_type=id_token%20token&scope=openid%20profile%20email%20allatclaims%20user_impersonation` +
      `&nonce=${Date.now()}`;
    window.location.href = adfsLoginUrl;
  }
}
