
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { AddOrEditGroupModel } from '../interfaces/addoreditgroup.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.GroupsController
  */
@Injectable()
export class GroupsService {
  constructor(private httpClient: HttpClient) {}

  addGroup(model: AddOrEditGroupModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Groups/add`, model);
  }

  deleteGroup(groupId: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Groups/delete`);
  }

  editGroup(id: string, model: AddOrEditGroupModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Groups/edit/${encodeURIComponent(id)}`, model);
  }

  searchGroup(id: string): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Groups/search/${encodeURIComponent(id)}`, null);
  }

  marketGroups(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Groups/market-groups`);
  }

  roleGroups(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Groups/role-groups`);
  }

}

