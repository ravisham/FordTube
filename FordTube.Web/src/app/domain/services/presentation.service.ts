
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';




/**
  * Angular Service For for: FordTube.WebApi.Controllers.PresentationController
  */
@Injectable()
export class PresentationService {
  constructor(private httpClient: HttpClient) {}

  getProfiles(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Presentation/get-profiles`);
  }

}

