
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { AddOrEditZoneModel } from '../interfaces/addoreditzone.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.ZonesController
  */
@Injectable()
export class ZonesService {
  constructor(private httpClient: HttpClient) {}

  delete(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Zones/delete/${encodeURIComponent(id)}`);
  }

  add(model: AddOrEditZoneModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Zones/add`, model);
  }

  edit(id: string, model: AddOrEditZoneModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Zones/edit/${encodeURIComponent(id)}`, id);
  }

  getZoneDevices(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Zones/devices/${encodeURIComponent(id)}`);
  }

  list(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Zones/list`);
  }

}

