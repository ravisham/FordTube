
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { SlideDtoModel } from '../interfaces/slidedto.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.CarouselController
  */
@Injectable()
export class CarouselService {
  constructor(private httpClient: HttpClient) {}

  getActive(franchise: number): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Carousel/GetActive/${franchise}`);
  }

  getAll(franchise: number): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Carousel/GetAll/${franchise}`);
  }

  get(id: number): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Carousel/${id}`);
  }

  post(slide: SlideDtoModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Carousel`, slide);
  }

  put(id: number, slide: SlideDtoModel): Observable<any> {
  return this.httpClient.put(`${environment.maApiUrl}api/Carousel/${id}`, slide);
  }

  delete(id: number): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Carousel/${id}`);
  }

}

