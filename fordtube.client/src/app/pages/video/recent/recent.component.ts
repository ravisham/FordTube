import { Component, OnInit } from '@angular/core';
import { VideoService } from '../../../domain/services/video.service';
import { VideoSearchRequestModel } from '../../../domain/interfaces/videosearchrequest.interface';
import { VideoType } from '../../../domain/enums/videotype.enum';
import { VideoStatus } from '../../../domain/enums/videostatus.enum';
import { SortFieldType } from '../../../domain/enums/sortfieldtype.enum';
import { SortDirectionType } from '../../../domain/enums/sortdirectiontype.enum';
import { SearchPanelInterface } from '../../../domain/interfaces/search-panel.interface';
import { ActivatedRoute } from '@angular/router';
import { VideoSearchResponseItemModel } from '../../../domain/interfaces/videosearchresponseitem.interface';
import { flattenDeep } from 'lodash';
import { SearchFieldType } from '../../../domain/enums/searchfieldtype.enum';

@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss']
})
export class RecentComponent implements OnInit {
  countOnPage = 15;
  filter: SearchPanelInterface = { query: '', categoryIds: [] };
  videos: VideoSearchResponseItemModel[] = [];
  totalVideos = 0;
  scrollId: string = '';

  constructor(private videosService: VideoService, private currentRoute: ActivatedRoute) {}

  searchVideos(value: SearchPanelInterface | undefined) {
    this.videos = [];
    this.filter = value || { query: '', categoryIds: [] };
    this.scrollId = '';
    this.fillVideos();
    return false;
  }

  fillVideos() {
    const searchModel: VideoSearchRequestModel = {
      type: VideoType.All,
      categories: this.filter.categoryIds,
      uploaders: [],
      uploaderIds: [],
      status: VideoStatus.Active,
      query: this.filter.query || '',
      count: this.countOnPage,
      titleOnly: false,
      scrollId: this.scrollId,
      sortField: SortFieldType.WhenUploaded,
      sortDirection: SortDirectionType.Desc,
      exactMatch: false,
      searchField: SearchFieldType.All
    };
    this.videosService.search(searchModel).subscribe(
      result => {
        if (result != null && result.videos != null && result.videos.length > 0) {
          this.scrollId = result.scrollId;
          this.totalVideos = result.totalVideos;
          this.videos = flattenDeep([this.videos, result.videos]);
        }
      },
      error => console.log('Error: ', error)
    );
  }

  loadMore(id: string) {
    this.scrollId = id;
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    this.filter = {
      query: '',
      categoryIds: []
    };
    const routeData = this.currentRoute.snapshot.data;
    this.filter.categoryIds = routeData['categoryResponse'] || [];
    this.videos = routeData['videosSearchResponse'] ? routeData['videosSearchResponse'].videos : [];
    this.totalVideos = routeData['videosSearchResponse'] ? routeData['videosSearchResponse'].totalVideos : 0;
    this.scrollId = routeData['videosSearchResponse'] ? routeData['videosSearchResponse'].scrollId : '';
  }
}
