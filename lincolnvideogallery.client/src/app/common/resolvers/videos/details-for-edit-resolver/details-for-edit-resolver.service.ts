import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { VideoService } from '../../../../domain/services/video.service';
import { VideoDetailsModel } from '../../../../domain/interfaces/videodetails.interface';

@Injectable({
  providedIn: 'root'
})
export class VideoDetailsForEditResolverService implements Resolve<VideoDetailsModel> {
  constructor(private videoService: VideoService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VideoDetailsModel> {
    return this.videoService.detailsForEdit(route.queryParams.v).pipe(response => response);
  }
}
