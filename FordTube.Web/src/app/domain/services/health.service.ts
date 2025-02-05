
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';




/**
  * Angular Service For for: FordTube.WebApi.Controllers.HealthController
  */
@Injectable()
export class HealthService {
  constructor(private httpClient: HttpClient) {}

  get(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}health`);
  }

  dataPowerXApiService(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}health/xapi`);
  }

  fordInfoDatabse(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}health/fordinfo`);
  }

  fordTubeDatabase(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}health/fordtube`);
  }

  vbrick(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}health/vbrick`);
  }

}

