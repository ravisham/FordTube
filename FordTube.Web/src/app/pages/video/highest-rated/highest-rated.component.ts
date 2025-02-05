import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { VideoService } from '../../../domain/services/video.service';
import { VideoSearchRequestModel } from '../../../domain/interfaces/videosearchrequest.interface';
import { VideoType } from '../../../domain/enums/videotype.enum';
import { VideoStatus } from '../../../domain/enums/videostatus.enum';
import { SortFieldType } from '../../../domain/enums/sortfieldtype.enum';
import { SortDirectionType } from '../../../domain/enums/sortdirectiontype.enum';
import { SearchPanelInterface } from '../../../domain/interfaces/search-panel.interface';
import { CategoriesService } from '../../../domain/services/categories.service';
import { VideoSearchResponseItemModel } from '../../../domain/interfaces/videosearchresponseitem.interface';
import { ActivatedRoute } from '@angular/router';
import { flattenDeep } from 'lodash';
import { SearchFieldType } from '../../../domain/enums/searchfieldtype.enum';

@Component({
  selector: 'app-highest-rated',
  templateUrl: './highest-rated.component.html',
  styleUrls: ['./highest-rated.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class HighestRatedComponent implements OnInit {
  countOnPage = 15;
  filter: SearchPanelInterface;
  videos: VideoSearchResponseItemModel[] = [];
  totalVideos = 0;
  scrollId: string = null;

  constructor(private videosService: VideoService,
              private categoriesService: CategoriesService,
              private currentRoute: ActivatedRoute) {
  }

  searchVideos(value) {
    this.videos = [];
    this.filter = value;
    this.scrollId = null;
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
      query: this.filter.query,
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

  loadMore(id) {
    this.scrollId = id;
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    this.filter = {
      query: '',
      categoryIds: []
    };
    this.filter.categoryIds = this.currentRoute.snapshot.data.categoryResponse;
    this.videos = this.currentRoute.snapshot.data.videosSearchResponse.videos;
    this.totalVideos = this.currentRoute.snapshot.data.videosSearchResponse.totalVideos;
    this.scrollId = this.currentRoute.snapshot.data.videosSearchResponse.scrollId;
  }
}
