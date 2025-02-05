
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';




/**
  * Angular Service For for: FordTube.WebApi.Controllers.DisclaimerController
  */
@Injectable()
export class DisclaimerService {
  constructor(private httpClient: HttpClient) {}

  showUpdateDisclaimer(userId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Disclaimer/ShowUpdateDisclaimer?userId=${encodeURIComponent(userId)}`);
  }

  updateDisclaimerLastSeen(userId: string): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Disclaimer/UpdateDisclaimerLastSeen?userId=${encodeURIComponent(userId)}`, userId);
  }

}

