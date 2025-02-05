import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalUser } from 'src/app/domain/interfaces/localuser.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
/**
 * Service to handle user profile related operations.
 */
export class UserProfileService {
  private currentUserProfile = new BehaviorSubject<LocalUser | null>(null);

  /**
   * Constructor for UserProfileService.
   * @param httpClient The HTTP client for making requests.
   */
  constructor(private httpClient: HttpClient) { }

  /**
   * Fetches the user profile from the API.
   * @returns An observable of the user profile.
   */
  fetchUserProfile(): Observable<LocalUser> {
    return this.httpClient.get<LocalUser>(`${environment.maApiUrl}api/user/profile`);
  }

  /**
   * Sets the current user profile.
   * @param profile The user profile to set.
   */
  setUserProfile(profile: LocalUser): void {
    this.currentUserProfile.next(profile);
  }

  /**
   * Gets the current user profile as an observable.
   * @returns An observable of the current user profile.
   */
  getUserProfile(): Observable<LocalUser> {
    return this.currentUserProfile.asObservable();
  }

  /**
   * Gets the current user profile value.
   * @returns The current user profile value.
   */
  getCurrentUserProfile(): LocalUser | null {
    return this.currentUserProfile.value;
  }
}
