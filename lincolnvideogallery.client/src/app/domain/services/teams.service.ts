
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { AddTeamModel } from '../interfaces/addteam.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.TeamsController
  */
@Injectable()
export class TeamsService {
  constructor(private httpClient: HttpClient) {}

  delete(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Teams/delete/${encodeURIComponent(id)}`);
  }

  add(model: AddTeamModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Teams/add`, model);
  }

  edit(id: string, model: AddTeamModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Teams/edit/${encodeURIComponent(id)}`, model);
  }

  list(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Teams/list`);
  }

  search(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Teams/search`);
  }

}

