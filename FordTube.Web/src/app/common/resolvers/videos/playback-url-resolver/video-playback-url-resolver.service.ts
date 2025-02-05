import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { VideoService } from '../../../../domain/services/video.service';
import { VideoPlaybackUrlResponseModel } from '../../../../domain/interfaces/videoplaybackurlresponse.interface';

@Injectable({
  providedIn: 'root',
})
export class VideoPlaybackUrlResolverService
  implements Resolve<VideoPlaybackUrlResponseModel> {
  constructor(private videoService: VideoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.videoService.getPlaybackUrl(route.queryParams.v);
  }
}
