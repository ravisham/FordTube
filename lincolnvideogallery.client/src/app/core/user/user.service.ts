import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IUser } from './user';
import { FranchiseType } from '../../domain/enums/franchisetype.enum';
import { EncryptionService } from '../../common/encryption/encryption.service';

/**
 * @description UserService handles user-related operations and state management.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<IUser | null>(null);
  private isLoadingUserInfo = false;

  user$ = this.userSubject.asObservable();
  users$ = new ReplaySubject(1);
  constructor(private http: HttpClient, private encryptionService: EncryptionService) { }
  users() {
    return this.users$;
  }
  /**
    * Loads the user information from the API and updates the user state.
    * @returns {Observable<void>} An observable that emits when the user information is loaded.
    */
  loadUserInfo(): Observable<void> {
    if (this.isLoadingUserInfo) {
      return of(undefined);
    }

    this.isLoadingUserInfo = true;

    return this.http
      .get<{ data: string }>(`${environment.maApiUrl}api/auth/userinfo`)
      .pipe(
        map(response => {
          const decryptedData = this.encryptionService.decrypt(response.data);
          return decryptedData as IUser;
        }),
        tap((user: IUser | null) => {
          this.isLoadingUserInfo = false;
          this.users$.next(user);
          if (user && user.franchise) {
            if (user.franchise === 2) {
              this.setFranchiseInSessionStorage(environment.franchise === 0 ? 'Ford' : 'Lincoln');
            } else {
              this.setFranchiseInSessionStorage(user.franchise === 0 ? 'Ford' : 'Lincoln');
            }
          }
          if (user && user.starsId) {
            localStorage.setItem('starsId', user.starsId);
          }
          this.userSubject.next(user);
        }),
        catchError((error) => {
          this.isLoadingUserInfo = false;
          console.error('Failed to load user info', error);
          this.userSubject.next(null);
          this.users$.next(null);
          return of(null);
        }),
        map(() => void 0) // Ensure return type is void
      );
  }

  /**
   * Sets the AES key for decryption and loads the user information.
   * @param key The AES key.
   */
  setAesKey(key: string): void {
    this.encryptionService.setKey(key);
    this.loadUserInfo().subscribe();
  }

  /**
   * Sets the user token and loads the user information.
   * @param {string} token - The JWT token.
   */
  setUserToken(token: string): void {
    localStorage.setItem('token', token);
    this.loadUserInfo().subscribe();
  }

  /**
   * Gets the current user information.
   * @returns {IUser | null} The current user information.
   */
  getUser(): IUser | null {
    return this.userSubject.getValue();
  }

  /**
   * Gets the user role ID.
   * @returns {number | null} The user role ID.
   */
  getUserRoleId(): number | null {
    const user = this.getUser();
    return user ? user.userRoleId : null;
  }

  /**
   * Gets the user name.
   * @returns {string | null} The user name.
   */
  getUserName(): string | null {
    const user = this.getUser();
    return user ? user.userName : null;
  }

  /**
   * Gets the user type ID.
   * @returns {number | null} The user type ID.
   */
  getUserTypeId(): number | null {
    const user = this.getUser();
    return user ? user.userTypeId : null;
  }

  /**
   * Gets the user stars ID.
   * @returns {number | null} The user stars ID.
   */
  getStarsId(): string | null {
    const user = this.getUser();
    return user ? user.starsId : null;
  }

  /**
   * Gets the user ID.
   * @returns {string | null} The user ID.
   */
  getUserId(): string | null {
    const user = this.getUser();
    return user ? user.userName : null;
  }

  /**
   * Gets the user first name.
   * @returns {string | null} The user first name.
   */
  getFirstName(): string | null {
    const user = this.getUser();
    return user ? user.firstName : null;
  }

  /**
   * Gets the user last name.
   * @returns {string | null} The user last name.
   */
  getLastName(): string | null {
    const user = this.getUser();
    return user ? user.lastName : null;
  }

  /**
   * Gets the franchise from session storage.
   * @returns {string | null} The franchise as a string or null if not set.
   */
  private getFranchiseFromSessionStorage(): string | null {
    return localStorage.getItem('Franchise');
  }

  /**
   * Gets the franchise as an integer.
   * @returns {number} The franchise as an integer.
   */
  getFranchiseAsInt(): number {
    const franchiseFromSessionStorage = this.getFranchiseFromSessionStorage();
    if (!franchiseFromSessionStorage) {
      return environment.franchise;
    }

    return this.getFranchiseIntFromString(franchiseFromSessionStorage);
  }

  /**
   * Gets the franchise as a string.
   * @returns {string} The franchise as a string.
   */
  getFranchiseAsString(): string {
    const franchiseFromSessionStorage = this.getFranchiseFromSessionStorage();
    if (!franchiseFromSessionStorage) {
      return this.getFranchiseStringFromInt(environment.franchise);
    }

    return franchiseFromSessionStorage;
  }

  /**
   * Converts an integer franchise value to its corresponding string representation.
   * @param {number} franchiseInt - The integer franchise value.
   * @returns {string} The string representation of the franchise.
   */
  private getFranchiseStringFromInt(franchiseInt: number): string {
    switch (franchiseInt) {
      case FranchiseType.Ford:
        return 'Ford';
      case FranchiseType.Lincoln:
        return 'Lincoln';
      case FranchiseType.Both:
        return 'Both';
      default:
        return 'Unknown';
    }
  }

  /**
   * Converts a string franchise value to its corresponding integer representation.
   * @param {string} franchiseString - The string franchise value.
   * @returns {number} The integer representation of the franchise.
   */
  private getFranchiseIntFromString(franchiseString: string): number {
    switch (franchiseString) {
      case 'Ford':
        return FranchiseType.Ford;
      case 'Lincoln':
        return FranchiseType.Lincoln;
      case 'Both':
        return FranchiseType.Both;
      default:
        return environment.franchise;
    }
  }

  /**
   * Sets the franchise in session storage.
   * @param {string} franchise - The franchise to set.
   */
  setFranchiseInSessionStorage(franchise: string): void {
    localStorage.setItem('Franchise', franchise);
  }

  /**
   * Smart method to get the franchise value from session storage or fallback to environment.
   * @param {string} format - The format in which to return the franchise value.
   * @returns {string | number} The franchise value in the specified format.
   */
  getFranchiseSmart(format: 'string' | 'int'): string | number {
    const franchiseFromSessionStorage = this.getFranchiseFromSessionStorage();
    if (!franchiseFromSessionStorage) {
      if (format === 'string') {
        return this.getFranchiseStringFromInt(environment.franchise);
      } else {
        return environment.franchise;
      }
    }

    if (format === 'string') {
      return franchiseFromSessionStorage;
    } else {
      return this.getFranchiseIntFromString(franchiseFromSessionStorage);
    }
  }
}
