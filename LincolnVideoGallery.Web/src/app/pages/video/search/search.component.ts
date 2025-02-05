import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../../../domain/services/categories.service';
import { SearchInterface } from '../../../domain/interfaces/search.interface';
import { VideoSearchResponseModel } from '../../../domain/interfaces/videosearchresponse.interface';
import { VideoService } from '../../../domain/services/video.service';
import { VideoSearchRequestModel } from '../../../domain/interfaces/videosearchrequest.interface';
import { VideoType } from '../../../domain/enums/videotype.enum';
import { VideoStatus } from '../../../domain/enums/videostatus.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { flattenDeep } from 'lodash';
import { SortDirectionType } from '../../../domain/enums/sortdirectiontype.enum';
import { SortFieldType } from '../../../domain/enums/sortfieldtype.enum';
import { SearchFieldType } from '../../../domain/enums/searchfieldtype.enum';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  shouldShowLoadingTiles = false;
  isLoading = false;

  filter: SearchInterface = {
    categoryIds: this.currentRoute.snapshot.queryParamMap.get('c') ? [this.currentRoute.snapshot.queryParamMap.get('c')] : ['all'],
    query: encodeURI(this.currentRoute.snapshot.queryParamMap.get('q')) || '',
    sortField: this.getSortField(this.currentRoute.snapshot.queryParamMap.get('s')),
    sortDirection: this.currentRoute.snapshot.queryParamMap.get('d') === 'desc' ? SortDirectionType.Asc : SortDirectionType.Desc,
    tags: this.currentRoute.snapshot.queryParamMap.get('f') === 'true'
  };
  categories = [];
  category = this.currentRoute.snapshot.queryParamMap.get('c') || 'all';
  countOnPage = 15;
  videos: VideoSearchResponseModel[] = [];
  id: string;
  scrollId: string;
  totalVideos: number;

  constructor(private videosService: VideoService, private categoriesService: CategoriesService, private currentRoute: ActivatedRoute, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
  }

  getFilter() {
    const searchFilter: SearchInterface = {
      categoryIds: this.currentRoute.snapshot.queryParamMap.get('c') ? [this.currentRoute.snapshot.queryParamMap.get('c')] : ['all'],
      query: this.currentRoute.snapshot.queryParamMap.get('q') || '',
      sortField: this.getSortField(this.isHomePage() ? 'when' : this.currentRoute.snapshot.queryParamMap.get('s')),
      sortDirection: this.currentRoute.snapshot.queryParamMap.get('d') === 'asc' ? SortDirectionType.Asc : SortDirectionType.Desc,
      tags: this.currentRoute.snapshot.queryParamMap.get('f') === 'true'
    };
    return searchFilter;
  }

  private isHighestRated(): boolean {
    return this.currentRoute.snapshot.data.isHighestRatedPage || false;
  }

  private isHomePage(): boolean {
    return this.currentRoute.snapshot.data.isHomePage || false;
  }

  getTitle() {
    if (this.router.url.indexOf('highest-rated') > 0) {
      return 'Highest Rated Videos';
    }
    if (this.router.url.indexOf('search') > 0) {
      return 'Search Videos';
    }
    if (this.router.url.indexOf('category') > 0) {
      return 'Category Videos';
    }
    return 'Most Recent Videos';
  }

  getSortField(param: string): SortFieldType {
    if (param) {
      switch (param.toLowerCase()) {
        case 'when':
          return SortFieldType.WhenUploaded;
        case 'uploader':
          return SortFieldType.UploaderName;
        case 'duration':
          return SortFieldType.Duration;
        case 'score':
          return SortFieldType._Score;
        case 'title':
          return SortFieldType.Title;
        default:
          return this.router.url.indexOf('category') > 0 ? SortFieldType.WhenUploaded : SortFieldType.Title;
      }
    }
    return this.router.url.indexOf('category') > 0 ? SortFieldType.WhenUploaded : SortFieldType.Title;
  }

  getSortFieldText(value: SortFieldType | number): string {
    if (typeof value === 'string') {
      value = parseInt(value, 10);
    }

    switch (value) {
      case SortFieldType.Title:
        return 'title';
      case SortFieldType.WhenUploaded:
        return 'when';
      case SortFieldType.UploaderName:
        return 'uploader';
      case SortFieldType.Duration:
        return 'duration';
      case SortFieldType._Score:
        return 'score';
    }
  }

  callSearch() {
    const route = this.category !== 'all' ? 'category' : 'search';
    this.router.navigate([route], {
      queryParams:
        this.filter.query === ''
          ? {
              c: this.category,
              s: this.getSortFieldText(this.filter.sortField),
              d: SortDirectionType[this.filter.sortDirection].toLowerCase(),
              f: this.filter.tags.toString()
            }
          : {
              q: this.filter.query,
              c: this.category,
              s: this.getSortFieldText(this.filter.sortField),
              d: SortDirectionType[this.filter.sortDirection].toLowerCase(),
              f: this.filter.tags.toString()
            }
    });

    const categoryFullPath = this.categories.find((c: { categoryId: string; }) => c.categoryId === this.category);

    window["dataLayer"].push({
      event: 'vPageview',     
      pageUrl: window.location,
      pageTitle: categoryFullPath.fullpath
    });
  }

  fillVideos() {

    const searchModel: VideoSearchRequestModel = {
      type: VideoType.All,
      categories: this.category === 'all' ? [] : [this.category],
      uploaders: [],
      uploaderIds: [],
      status: VideoStatus.Active,
      query: this.filter.query,
      count: this.countOnPage,
      titleOnly: false,
      scrollId: this.scrollId || null,
      sortField: this.filter.sortField,
      sortDirection: this.filter.sortDirection,
      exactMatch: this.filter.tags,
      searchField: this.filter.tags ? SearchFieldType.Tags : SearchFieldType.All
    };
    this.videosService.search(searchModel).subscribe(
      result => {
        if (result) {
          if (result.videos != null && result.videos.length > 0) {
            this.videos = flattenDeep([this.videos, result.videos]);
          }
          this.totalVideos = result.totalVideos;
          this.scrollId = result.scrollId;
        }
      },
      error => console.log('Error: ', error),
      ()=>{
        this.shouldShowLoadingTiles = false;
        this.isLoading = false;
      }
    );
  }

  moreVideos(id) {
    this.scrollId = id;
    this.fillVideos();
    return false;
  }

  Init() {
    this.scrollId = null;
    this.categories.unshift({
      categoryId: 'all',
      fullpath: 'All Categories',
      name: 'All Categories'
    });
    this.filter = this.getFilter();
    this.fillVideos();
  }

  ngOnInit() {
    if (this.isHighestRated() || this.isHomePage()) {
      this.shouldShowLoadingTiles = true;
    }

    if(this.filter.query && this.filter.query !== '' && this.filter.query !== 'null') {
      this.isLoading = true;
    }

    if (this.router.url.indexOf('category') > 0 && this.currentRoute.snapshot.queryParamMap.get('c')) {
      this.categoriesService.getChildren(this.currentRoute.snapshot.queryParamMap.get('c')).subscribe(
        response => {
          this.categories = response;
          this.Init();
          const categoryFullPath = this.categories.find((c: { categoryId: string; }) => c.categoryId === this.category);
          window['dataLayer'].push({
            event: 'vPageview',
            pageUrl: window.location,
            pageTitle: categoryFullPath.fullpath
          });
        },
        error => console.log('Error: ', error)
      );
    } else {
      this.categoriesService.get().subscribe(
        response => {
          this.categories = response;
          this.Init();
        },
        error => console.log('Error: ', error)
      );
    }
  }
}
