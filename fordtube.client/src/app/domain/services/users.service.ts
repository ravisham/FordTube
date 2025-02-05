import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';

import { LocalUser } from '../interfaces/localuser.interface';

/**
 * Angular Service For for: FordTube.WebApi.Controllers.UsersController
 */
@Injectable()
export class UsersService {
  constructor(private httpClient: HttpClient) {}

  add(model: LocalUser): Observable<any> {
    return this.httpClient.post(`${environment.maApiUrl}api/Users/add`, model);
  }

  get(id: string): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Users/get/${encodeURIComponent(id)}`);
  }

  current(): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Users/current`);
  }


  getByEmail(email: string): Observable <any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Users/get-by-email?email=${encodeURIComponent(email)}`);
  }


  getByUserName(userName: string): Observable <any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Users/get-by-username?userName=${encodeURIComponent(userName)}`);
  }

  delete(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.maApiUrl}api/Users/delete/${encodeURIComponent(id)}`);
  }
}
