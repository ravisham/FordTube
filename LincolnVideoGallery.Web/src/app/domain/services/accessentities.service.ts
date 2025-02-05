
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


/**
  * Angular Service For for: FordTube.WebApi.Controllers.AccessEntitiesController
  */
@Injectable()
export class AccessEntitiesService {
  constructor(private httpClient: HttpClient) { }


  getAll(): Observable<any> { return this.httpClient.get(`${environment.maApiUrl}api/AccessEntities/getall`); }


  search(query: string, type: string): Observable<any> { return this.httpClient.get(`${environment.maApiUrl}api/AccessEntities/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`); }
}
