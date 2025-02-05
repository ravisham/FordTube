import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { VideoService } from '../../../../domain/services/video.service';
import { VideoDetailsModel } from '../../../../domain/interfaces/videodetails.interface';
import { getCookie } from '../../../utilities/cookie-utilities';
import { FlaggedDetailsRequestModel } from '../../../../domain/interfaces/flaggeddetailsrequest.interface';

@Injectable({
  providedIn: 'root',
})
export class VideoDetailsResolverService implements Resolve<VideoDetailsModel> {
  constructor(private videoService: VideoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<VideoDetailsModel> {
    const model: FlaggedDetailsRequestModel = {
      id: route.queryParams.v || route.queryParams.video_key,
      userName: getCookie('userid') == null ? 'null' : getCookie('userid'),
    };
    return this.videoService.detailsFlagged(model);
  }
}
