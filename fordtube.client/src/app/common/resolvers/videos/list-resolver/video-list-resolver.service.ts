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
import { SearchFieldType } from '../../../../domain/enums/searchfieldtype.enum';

@Injectable({
  providedIn: 'root'
})
export class VideoListResolverService implements Resolve<VideoSearchResponseModel> {
  constructor(private videoService: VideoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VideoSearchResponseModel> {
    const searchModel: VideoSearchRequestModel = {
      type: VideoType.All,
      categories: [route.queryParams.c],
      uploaders: [],
      uploaderIds: [],
      status: VideoStatus.Active,
      query: route.queryParams.q || '',
      count: route.data.count || 6,
      titleOnly: false,
      scrollId: null,
      sortField: this.getSortField(route.data.sort),
      sortDirection: route.data.d === 'asc' ? SortDirectionType.Asc : SortDirectionType.Desc,
      searchField: SearchFieldType.All,
      exactMatch: false
    };

    return this.videoService.search(searchModel).pipe(response => response);
  }

  getSortField(param: string): SortFieldType {
    if (param) {
      switch (param.toLowerCase()) {
      case 'whenuploaded':
        return SortFieldType.WhenUploaded;
      case 'uploadername':
        return SortFieldType.UploaderName;
      case 'duration':
        return SortFieldType.Duration;
      case 'score':
        return SortFieldType._Score;
      case 'title':
        return SortFieldType.Title;
      default:
        return SortFieldType.Title;
      }
    }
    return SortFieldType.Title;
  }
}
