
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { CreateEventModel } from '../interfaces/createevent.interface';
import { CalendarEventModel } from '../interfaces/calendarevent.interface';
import { EditEventModel } from '../interfaces/editevent.interface';
import { EditEventAccessControlModel } from '../interfaces/editeventaccesscontrol.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.EventsController
  */
@Injectable()
export class EventsService {
  constructor(private httpClient: HttpClient) {}

  list(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Events/list`);
  }

  add(model: CreateEventModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Events/add`, model);
  }

  download(model: CalendarEventModel): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Events/download`);
  }

  edit(id: string, model: EditEventModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Events/edit/${encodeURIComponent(id)}`, model);
  }

  editAccess(id: string, model: EditEventAccessControlModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Events/edit-access/${encodeURIComponent(id)}`, model);
  }

  get(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Events/get/${encodeURIComponent(id)}`);
  }

  report(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Events/report/${encodeURIComponent(id)}`);
  }

}

