import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { VideoService } from '../../../../domain/services/video.service';
import { VideoDetailsModel } from '../../../../domain/interfaces/videodetails.interface';
import { UserService } from '../../../../core/user/user.service';
import { FlaggedDetailsRequestModel } from '../../../../domain/interfaces/flaggeddetailsrequest.interface';

@Injectable({
  providedIn: 'root',
})
export class VideoDetailsResolverService implements Resolve<VideoDetailsModel> {
  constructor(
    private videoService: VideoService,
    private userService: UserService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<VideoDetailsModel> {
    const user = this.userService.getUser();
    const userId = user ? user.userName : 'null';
    const model: FlaggedDetailsRequestModel = {
      id: route.queryParams.v || route.queryParams.video_key,
      userName: userId,
    };
    return this.videoService.detailsFlagged(model);
  }
}
