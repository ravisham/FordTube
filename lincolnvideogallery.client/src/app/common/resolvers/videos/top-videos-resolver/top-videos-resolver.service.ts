import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { VideoService } from '../../../../domain/services/video.service';
import { SortDirectionType } from '../../../../domain/enums/sortdirectiontype.enum';
import { SortFieldType } from '../../../../domain/enums/sortfieldtype.enum';
import { VideoStatus } from '../../../../domain/enums/videostatus.enum';
import { VideoType } from '../../../../domain/enums/videotype.enum';
import { VideoSearchResponseModel } from '../../../../domain/interfaces/videosearchresponse.interface';
import { VideoSearchRequestModel } from '../../../../domain/interfaces/videosearchrequest.interface';

@Injectable({
  providedIn: 'root'
})
export class TopVideosResolverService implements Resolve<VideoSearchResponseModel> {
  constructor(private videoService: VideoService) { }

  resolve(): Observable<VideoSearchResponseModel> {
    return this.videoService.topVideos('').pipe(response => response);
  }
}
