
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';




/**
  * Angular Service For for: FordTube.WebApi.Controllers.FaqController
  */
@Injectable()
export class FaqService {
  constructor(private httpClient: HttpClient) {}

  get(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Faq/get`);
  }

  groups(franchiseId: number): Observable<any> {

    if (franchiseId > 1) {
      franchiseId = environment.franchise;
    }

  return this.httpClient.get(`${environment.maApiUrl}api/Faq/groups?franchiseId=${franchiseId}`);
  }

}

