
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';




/**
  * Angular Service For for: FordTube.WebApi.Controllers.XapiController
  */
@Injectable()
export class XapiService {
  constructor(private httpClient: HttpClient) {}

  statements(statement: any): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Xapi/statements`, statement);
  }

}

