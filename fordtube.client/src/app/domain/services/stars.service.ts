
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';




/**
  * Angular Service For for: FordTube.WebApi.Controllers.StarsController
  */
@Injectable()
export class StarsService {
  constructor(private httpClient: HttpClient) {}

  get(userId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Stars/Get?userId=${encodeURIComponent(userId)}`);
  }

  fromFordInfo(userId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Stars/FromFordInfo?userId=${encodeURIComponent(userId)}`);
  }

  post(userId: string, value: string): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Stars?userId=${encodeURIComponent(userId)}&value=${encodeURIComponent(value)}`, userId);
  }

  showUpdateStars(userId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Stars/ShowUpdateStars?userId=${encodeURIComponent(userId)}`);
  }

}

