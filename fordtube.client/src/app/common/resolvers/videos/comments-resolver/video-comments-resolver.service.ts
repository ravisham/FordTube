import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { VideoService } from '../../../../domain/services/video.service';
import { CommentModel } from '../../../../domain/interfaces/comment.interface';

@Injectable({
  providedIn: 'root',
})
export class VideoCommentsResolverService implements Resolve<CommentModel> {
  constructor(private videoService: VideoService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<CommentModel> {
    return this.videoService.comments(route.queryParams.v);
  }
}
