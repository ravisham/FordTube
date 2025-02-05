import { Component, OnInit } from '@angular/core';
import { VideoSearchResponseModel } from '../../../domain/interfaces/videosearchresponse.interface';
import { flattenDeep } from 'lodash';
import { VideoService } from '../../../domain/services/video.service';
import { AdminMenuItems } from '../../layout/admin-nav/enum/menu-items';

@Component({
  selector: 'app-private-videos',
  templateUrl: './private-videos.component.html',
  styleUrls: ['./private-videos.component.scss']
})
export class PrivateVideosComponent implements OnInit {
  videos: VideoSearchResponseModel[] = [];
  totalVideos: string = '';
  scrollId = '';
  currentMenuItem = AdminMenuItems.PrivateVideos;

  constructor(private videosService: VideoService) {}

  fillVideos() {
    this.videosService.privateVideos(this.scrollId).subscribe(
      result => {
        if (result) {
          if (result.videos != null && result.videos.length > 0) {
            this.videos = flattenDeep([this.videos, result.videos]);
          }
          this.totalVideos = result.totalVideos;
          this.scrollId = result.scrollId;
          console.log(this.videos);
        }
      },
      error => console.log('Error: ', error)
    );
  }

  moreVideos() {
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    this.fillVideos();
  }
}
