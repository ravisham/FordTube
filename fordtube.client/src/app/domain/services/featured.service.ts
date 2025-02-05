
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';


import { FeaturedVideosRequestModel } from '../interfaces/featuredvideosrequest.interface';
import { AddFeaturedCategoryModel } from '../interfaces/addfeaturedcategory.interface';

/**
  * Angular Service For for: FordTube.WebApi.Controllers.FeaturedController
  */
@Injectable()
export class FeaturedService {
  constructor(private httpClient: HttpClient) {}

  get(): Observable<any> {
  return this.httpClient.get(`${environment.maApiUrl}api/Featured/get`);
  }

  videos(model: FeaturedVideosRequestModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Featured/videos`, model);
  }

  delete(id: string): Observable<any> {
  return this.httpClient.delete(`${environment.maApiUrl}api/Featured/delete/${encodeURIComponent(id)}`);
  }

  add(model: AddFeaturedCategoryModel): Observable<any> {
  return this.httpClient.post(`${environment.maApiUrl}api/Featured/add`, model);
  }

}

