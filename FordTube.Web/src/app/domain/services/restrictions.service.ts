
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { CheckPermissionsModel } from '../interfaces/checkpermissions.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.RestrictionsController
  */
@Injectable()
export class RestrictionsService {
  constructor(private httpClient: HttpClient) {}

  market(userId: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Restrictions/Market?userId=${encodeURIComponent(userId)}`);
  }

  permissions(model: CheckPermissionsModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Restrictions/permissions`, model);
  }

}

