
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { AddPlaylistRequestModel } from '../interfaces/addplaylistrequest.interface';
import { ManagePlaylistVideosModel } from '../interfaces/manageplaylistvideos.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.PlaylistController
  */
@Injectable()
export class PlaylistService {
  constructor(private httpClient: HttpClient) {}

  get(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Playlist/get`);
  }

  add(model: AddPlaylistRequestModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Playlist/add`, model);
  }

  delete(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Playlist/delete/${encodeURIComponent(id)}`);
  }

  manage(id: string, model: ManagePlaylistVideosModel): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Playlist/manage/${encodeURIComponent(id)}`);
  }

  manageFeatured(model: ManagePlaylistVideosModel): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Playlist/manage-featured`);
  }

}

