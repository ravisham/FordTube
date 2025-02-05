import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { VideoService } from '../../../../domain/services/video.service';

@Injectable({
  providedIn: 'root',
})
export class StandaloneVideoIdResolverService implements Resolve<string> {
  constructor(
    private videoService: VideoService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return this.videoService.getId(route.queryParams.video_key);
  }
}
