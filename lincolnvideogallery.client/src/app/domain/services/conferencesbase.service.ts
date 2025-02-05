
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { StartRecordingModel } from '../interfaces/startrecording.interface';
import { RecordingModel } from '../interfaces/recording.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.ConferencesBaseController
  */
@Injectable()
export class ConferencesBaseService {
  constructor(private httpClient: HttpClient) {}

  startRecording(model: StartRecordingModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/ConferencesBase/start-recording`, model);
  }

  stopRecording(model: RecordingModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/ConferencesBase/stop-recording`, model);
  }

  status(id: string): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/ConferencesBase/status/${encodeURIComponent(id)}`);
  }

}

