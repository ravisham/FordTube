import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { FeaturedService } from '../../../../domain/services/featured.service';
import { GetCategoryModel } from '../../../../domain/interfaces/getcategory.interface';

@Injectable({
  providedIn: 'root'
})
export class VideoFeaturedCategoryListResolverService implements Resolve<GetCategoryModel[]> {
  constructor(private featuredService: FeaturedService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<GetCategoryModel[]> {
    return this.featuredService.get().pipe(response => response);
  }
}
