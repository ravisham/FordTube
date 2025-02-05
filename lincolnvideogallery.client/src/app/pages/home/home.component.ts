import { Component, OnInit } from '@angular/core';
import { CategoriesService } from '../../domain/services/categories.service';
import { SearchInterface } from '../../domain/interfaces/search.interface';
import { VideoSearchResponseModel } from '../../domain/interfaces/videosearchresponse.interface';
import { VideoService } from '../../domain/services/video.service';
import { VideoSearchRequestModel } from '../../domain/interfaces/videosearchrequest.interface';
import { VideoType } from '../../domain/enums/videotype.enum';
import { VideoStatus } from '../../domain/enums/videostatus.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { flattenDeep } from 'lodash';
import { SortDirectionType } from '../../domain/enums/sortdirectiontype.enum';
import { SortFieldType } from '../../domain/enums/sortfieldtype.enum';
import { SearchFieldType } from '../../domain/enums/searchfieldtype.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  filter: SearchInterface;
  categories: any[] = [];
  category: string;
  countOnPage = 15;
  videos: VideoSearchResponseModel[] = [];
  id: string = "";
  scrollId: string = "";
  totalVideos: number = 0;
  isLoading: boolean = false;

  constructor(
    private videosService: VideoService,
    private categoriesService: CategoriesService,
    private currentRoute: ActivatedRoute,
    private router: Router
  ) {
    const queryParams = this.currentRoute.snapshot.queryParamMap;
    this.filter = {
      categoryIds: queryParams.has('c') ? [queryParams.get('c')] : ['all'],
      query: encodeURI(queryParams.has('q') ? queryParams.get('q') : ''),
      sortField: this.getSortField(queryParams.has('s') ? queryParams.get('s') : ''),
      sortDirection: queryParams.get('d') === 'desc' ? SortDirectionType.Asc : SortDirectionType.Desc,
      tags: queryParams.get('f') === 'true'
    };
    this.category = queryParams.has('c') ? queryParams.get('c') : 'all';
  }

  getFilter() {
    const queryParams = this.currentRoute.snapshot.queryParamMap;
    const searchFilter: SearchInterface = {
      categoryIds: queryParams.has('c') ? [queryParams.get('c')] : ['all'],
      query: queryParams.has('q') ? queryParams.get('q') : '',
      sortField: this.getSortField(
        this.isHomePage() ? 'when' : (queryParams.has('s') ? queryParams.get('s') : '')
      ),
      sortDirection: queryParams.get('d') === 'asc' ? SortDirectionType.Asc : SortDirectionType.Desc,
      tags: queryParams.get('f') === 'true'
    };
    return searchFilter;
  }

  private isHomePage(): boolean {
    return this.currentRoute.snapshot.data['isHomePage'] || false;
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

  getSortFieldText(sortFieldTextValue: SortFieldType | number) {
    switch (sortFieldTextValue) {
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
      default:
        return ''; // Add a default return statement
    }
  }

  callSearch() {
    const route = this.category !== 'all' ? 'category' : 'search';
    this.router.navigate([route], {
      queryParams: this.filter.query === ''
        ? {
            c: this.category,
            s: this.getSortFieldText(this.filter.sortField),
            d: SortDirectionType[this.filter.sortDirection].toLowerCase(),
            f: this.filter.tags.toString(),
          }
        : {
            q: this.filter.query,
            c: this.category,
            s: this.getSortFieldText(this.filter.sortField),
            d: SortDirectionType[this.filter.sortDirection].toLowerCase(),
            f: this.filter.tags.toString(),
          },
    });

    const categoryFullPath = this.categories.find((c: { categoryId: string }) => c.categoryId === this.category);

    window["dataLayer"].push({
      event: "category",
      title: categoryFullPath ? categoryFullPath['fullpath'] : ''
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
      scrollId: this.scrollId,
      sortField: this.filter.sortField,
      sortDirection: this.filter.sortDirection,
      exactMatch: this.filter.tags,
      searchField: this.filter.tags ? SearchFieldType.Tags : SearchFieldType.All,
    };
    this.videosService.search(searchModel).subscribe(
      (result) => {
        if (result) {
          if (result.videos != null && result.videos.length > 0) {
            this.videos = flattenDeep([this.videos, result.videos]);
          }
          this.totalVideos = result.totalVideos;
          this.scrollId = result.scrollId;
        }
      },
      (error) => console.log('Error: ', error),
      () => {
        this.isLoading = false;
      }
    );
  }

  moreVideos(id: string) {
    this.scrollId = id;
    this.fillVideos();
    return false;
  }

  Init() {
    this.scrollId = '';
    this.categories.unshift({
      categoryId: 'all',
      fullpath: 'All Categories',
      name: 'All Categories',
    } as never);
    this.filter = this.getFilter();
    this.fillVideos();
  }

  ngOnInit() {
    if (this.filter.query && this.filter.query !== '' && this.filter.query !== 'null') {
      this.isLoading = true;
    }
    if (this.router.url.indexOf('category') > 0 && this.currentRoute.snapshot.queryParamMap.get('c')) {
      const categoryId = this.currentRoute.snapshot.queryParamMap.get('c');
      if (categoryId !== null) {
        this.categoriesService.getChildren(categoryId).subscribe(
          (response) => {
            this.categories = response;
            this.Init();
          },
          (error) => console.log('Error: ', error)
        );
      } else {
       
        this.categoriesService.get().subscribe(
          (response) => {
            this.categories = response;
            this.Init();
          },
          (error) => console.log('Error: ', error)
        );
      }
    } else {
     
      this.categoriesService.get().subscribe(
        (response) => {
          this.categories = response;
          this.Init();
        },
        (error) => console.log('Error: ', error)
      );
    }
  }
}
