import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';

import { AddCategoryRequestModel } from '../interfaces/addcategoryrequest.interface';
import { FranchiseType } from '../enums/franchisetype.enum';

/**
 * Angular Service For for: FordTube.WebApi.Controllers.CategoriesController
 */
@Injectable()
export class CategoriesService {
  constructor(private httpClient: HttpClient) {}

  delete(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.maApiUrl}api/Categories/delete/${encodeURIComponent(id)}`);
  }

  add(model: AddCategoryRequestModel): Observable<any> {
    return this.httpClient.post(`${environment.maApiUrl}api/Categories/add`, model);
  }

  get(): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Categories/get`);
  }

  getChildren(id: string): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Categories/children/${encodeURIComponent(id)}`);
  }

  getRoot(): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Categories/get-root`);
  }

  getFranchise(): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Categories/franchise`);
  }

  category(id: string): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Categories/category/${encodeURIComponent(id)}`);
  }

  franchiseCategories(franchise: FranchiseType): Observable<any> {
    return this.httpClient.put(`${environment.maApiUrl}api/Categories/franchise-categories`, franchise);
  }

  homePageCategories(): Observable<any> {
    return this.httpClient.get(`${environment.maApiUrl}api/Categories/homepage-categories`);
  }
}
