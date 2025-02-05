import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalUser } from '../interfaces/localuser.interface';

@Injectable({
  providedIn: 'root'
})
/**
 * Service to handle authentication related operations.
 */
export class AuthenticationService {
  /**
   * Constructor for AuthenticationService.
   * @param http The HTTP client for making API requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * Gets the current token from local storage.
   * @returns The current token.
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Validates the current token.
   * @returns Observable<{ valid: boolean, user: LocalUser }> The validation result.
   */
  validateToken(): Observable<{ valid: boolean, user: LocalUser }> {
    return this.http.get<{ valid: boolean, user: LocalUser }>(`${environment.maApiUrl}api/user/validate-token`);
  }

  /**
   * Clears the current token from local storage.
   */
  clearToken(): void {
    localStorage.removeItem('access_token');
  }
}
