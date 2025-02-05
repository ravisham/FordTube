import { Component, OnInit } from '@angular/core';
import { flattenDeep } from 'lodash';
import { VideoSearchResponseItemModel } from '../../../domain/interfaces/videosearchresponseitem.interface';
import { VideoService } from '../../../domain/services/video.service';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-archives',
  templateUrl: './admin.archives.component.html',
  styleUrls: ['./admin.archives.component.scss']
})
export class AdminArchivesComponent implements OnInit {
  videos: VideoSearchResponseItemModel[] = [];
  totalVideos = 0;
  scrollId = '';
  currentMenuItem = AdminMenuItems.Archives;
  reverseSort = false;
  sortField = 'whenUploaded';

  constructor(private videosService: VideoService) {}

  setSortField(field: string) {
    if (field !== this.sortField) {
      this.reverseSort = false;
      this.sortField = field;
      return;
    }
    this.reverseSort = !this.reverseSort;
  }

  removeVideo(videoId: string) {
    this.scrollId = '';
    this.videosService.deleteRequest(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.id !== videoId;
        });
        this.videos = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  unarchiveVideo(videoId: string) {
    this.scrollId = '';
    this.videosService.unarchive(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.id !== videoId;
        });
        this.videos = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  getCsvUrl() {
    return environment.maApiUrl + 'api/video/archive-csv';
  }

  fillVideos() {
    this.videosService.archives(this.scrollId).subscribe(
      result => {
        if (result != null && result.videos != null && result.videos.length > 0) {
          this.scrollId = result.scrollId;
          this.totalVideos = result.totalVideos;
          this.videos = flattenDeep([this.videos, result.videos]);
          console.log(this.videos);
        }
      },
      error => console.log('Error: ', error)
    );
  }

  allowNextButton() {
    if (this.videos.length > 0) {
      return this.totalVideos > this.videos.length;
    } else {
      return true;
    }
  }

  loadMore() {
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    this.fillVideos();
  }
}
