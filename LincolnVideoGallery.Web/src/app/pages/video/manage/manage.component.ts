import { Component, OnInit } from '@angular/core';
import { VideoService } from '../../../domain/services/video.service';
import { VideoSearchResponseItemModel } from '../../../domain/interfaces/videosearchresponseitem.interface';
import { flattenDeep } from 'lodash';
import { ManageVideoModel } from '../../../domain/interfaces/managevideo.interface';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { UserProfileService } from 'src/app/core/user/services/user.profile.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  videos: VideoSearchResponseItemModel[] = [];
  totalVideos = 0;
  scrollId = '';
  username: string;

  constructor(
    private videosService: VideoService,
    private userProfileService: UserProfileService
  ) { }

  removeVideo(ind: number) {
    this.scrollId = null;
    const id = this.videos[ind].id;
    this.videosService.delete(id).subscribe(
      result => {
        this.totalVideos--;
        this.videos.splice(ind, 1);
      },
      error => console.log('Error: ', error)
    );
    return false;
  }

  async fillVideos() {
    this.userProfileService.getUserProfile().subscribe(profile => {
      this.username = profile.userName;

      const userRole = profile.userRoleId;
      const isAdmin = userRole === UserRoleEnum.SUPER_ADMIN || userRole === UserRoleEnum.DEALER_ADMIN;

      const model: ManageVideoModel = {
        scrollId: this.scrollId,
        userName: isAdmin ? null : this.username
      };

      this.videosService.userVideos(model).subscribe(
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
    });
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
