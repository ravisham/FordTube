import { Component, OnInit } from '@angular/core';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';
import { VideoService } from '../../../domain/services/video.service';
import { flattenDeep } from 'lodash';
import { FlaggedVideoItemModel } from '../../../domain/interfaces/flaggedvideoitem.interface';

@Component({
  selector: 'app-flagged-videos',
  templateUrl: './flagged-videos.component.html',
  styleUrls: ['./flagged-videos.component.scss'],
})
export class FlaggedVideosComponent implements OnInit {
  videos: FlaggedVideoItemModel[] = [];
  totalVideos = 0;
  scrollId = '';
  currentMenuItem = AdminMenuItems.FlaggedVideos;

  constructor(private videosService: VideoService) {}

  get allowNextButton(): boolean {
    if (this.videos.length > 0) {
      return this.totalVideos > this.videos.length;
    } else {
      return false;
    }
  }

  removeVideo(videoId: string) {
    this.scrollId = '';
    this.videosService.deleteRequest(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.video.id !== videoId;
        });
        this.videos = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  unflagVideo(videoId: string) {
    this.scrollId = '';
    this.videosService.unflag(videoId).subscribe(
      result => {
        this.totalVideos--;
        const filtered = this.videos.filter(video => {
          return video.video.id !== videoId;
        });
        this.videos = filtered;
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  fillVideos() {
    this.videosService.flagged(this.scrollId).subscribe(
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

  loadMore() {
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    this.fillVideos();
  }
}
