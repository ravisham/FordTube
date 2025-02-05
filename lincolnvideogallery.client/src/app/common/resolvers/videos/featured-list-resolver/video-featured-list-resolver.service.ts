import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { VideoSearchResponseItemModel } from '../../../../domain/interfaces/videosearchresponseitem.interface';
import { FeaturedService } from '../../../../domain/services/featured.service';
import { FeaturedVideosRequestModel } from '../../../../domain/interfaces/featuredvideosrequest.interface';

@Injectable({
  providedIn: 'root'
})
export class VideoFeaturedListResolver implements Resolve<VideoSearchResponseItemModel[]> {
  constructor(private featuredService: FeaturedService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VideoSearchResponseItemModel[]> {
    const searchModel: FeaturedVideosRequestModel = {
      query: null,
      count: route.data.count || 6,
      scrollId: null,
      categories: []
    };
    return this.featuredService.videos(searchModel).pipe(response => response);
  }
}
