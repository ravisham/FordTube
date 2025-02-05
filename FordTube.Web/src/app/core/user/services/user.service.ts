import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IUser } from './user';

/**
 * @description UserService handles user-related operations and state management.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<IUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Loads the user information from the API and updates the user state.
   * @returns {Observable<void>} An observable that emits when the user information is loaded.
   */
  loadUserInfo(): Observable<void> {
    return this.http.get<IUser>(`${environment.maApiUrl}api/auth/userinfo`).pipe(
      tap((user: IUser | null) => {
        this.userSubject.next(user);
      }),
      catchError(error => {
        console.error('Failed to load user info', error);
        this.userSubject.next(null);
        return of(null);
      }),
      map(() => void 0) // Ensure return type is void
    );
  }

  /**
   * Sets the user token and loads the user information.
   * @param {string} token - The JWT token.
   */
  setUserToken(token: string): void {
    localStorage.setItem('token', token);
    this.loadUserInfo().subscribe();
  }
}
