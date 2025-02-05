import { Component, OnInit, OnDestroy } from '@angular/core';
import { VideoService } from '../../../domain/services/video.service';
import { VideoSearchResponseItemModel } from '../../../domain/interfaces/videosearchresponseitem.interface';
import { flattenDeep } from 'lodash';
import { ManageVideoModel } from '../../../domain/interfaces/managevideo.interface';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { UserService } from "../../../core/user/user.service";
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit, OnDestroy {
  videos: VideoSearchResponseItemModel[] = [];
  totalVideos = 0;
  scrollId = '';
  username: string = '';
  userSubscription: Subscription = new Subscription();

  constructor(
    private videosService: VideoService,
    private userService: UserService
  ) { }

  removeVideo(ind: number) {
    this.scrollId = '';
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

  fillVideos() {
    this.userSubscription = this.userService.user$.pipe(
      switchMap(user => {
        if (user) {
          this.username = user.userName;
          const userRole = user.userRoleId;
          const isAdmin = (userRole === UserRoleEnum.SUPER_ADMIN);

          const model: ManageVideoModel = {
            scrollId: this.scrollId,
            userName: isAdmin ? null : this.username
          };

          return this.videosService.userVideos(model);
        } else {
          return of({ videos: [], scrollId: '', totalVideos: 0 });
        }
      })
    ).subscribe(
      result => {
        if (result && result.videos && result.videos.length > 0) {
          this.scrollId = result.scrollId;
          this.totalVideos = result.totalVideos;
          this.videos = flattenDeep([this.videos, result.videos]);
          console.log(this.videos);
        }
      },
      error => console.log('Error: ', error)
    );

    // Load user information if not already loaded
    //this.userService.loadUserInfo().subscribe();
  }

  allowNextButton(): boolean {
    return this.videos.length > 0 ? this.totalVideos > this.videos.length : true;
  }

  loadMore() {
    this.fillVideos();
    return false;
  }

  ngOnInit() {
    this.fillVideos();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
