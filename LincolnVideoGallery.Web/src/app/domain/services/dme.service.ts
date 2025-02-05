
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { AddDmeModel } from '../interfaces/adddme.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.DmeController
  */
@Injectable()
export class DmeService {
  constructor(private httpClient: HttpClient) {}

  list(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Dme/list`);
  }

  add(model: AddDmeModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Dme/add`, model);
  }

  delete(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Dme/delete?id=${encodeURIComponent(id)}`);
  }

}

