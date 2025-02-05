import {
  Component,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { XapiTrackingService } from '../../../core/xapi/services/xapi.tracking.service';
import { XapiService } from '../../../domain/services/xapi.service';
import { VideoDetailsModel } from 'src/app/domain/interfaces/videodetails.interface';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { CategoryPathModel } from 'src/app/domain/interfaces/categorypath.interface';
import { Grouping, Statement } from 'src/app/core/xapi/models/xapi.interface';
import { DefinitionType } from 'src/app/core/xapi/enums/definition-type.enum';
import { SafeEmbedPipe } from '../../../common/pipes/safe-embed/safe-embed.pipe';
import revSdk, { PlayerStatus } from '@vbrick/rev-sdk';
import { VerbId } from 'src/app/core/xapi/enums/verb-id.enum';
import { removeEmptyProperties } from 'src/app/common/utilities/object-utilities';
import { getUrlParameter } from 'src/app/common/utilities/url-utilities';
import { UserTypeEnum } from '../../../domain/enums/usertype.enum';
import { UserService } from '../../../core/user/user.service';

@Component({
  selector: 'app-standalone',
  templateUrl: './standalone.component.html',
  styleUrls: ['./standalone.component.scss'],
})
export class StandaloneComponent implements OnInit, AfterViewInit {
  id: string = '';
  videoBaseUrl = environment.vbrickUrl;
  videoDetails: VideoDetailsModel | undefined;
  player: any;
  startTime: Date = new Date();
  videoUrl: any;
  duration: number = 0;

  get starsId(): string {
    return this.xapiTrackingService.TempStarsId || this.xapiTrackingService.StarsId;
  }

  get courseId(): string {
    return this.xapiTrackingService.TempCourseId || this.xapiTrackingService.CourseId;
  }

  constructor(
    private router: Router,
    private currentRoute: ActivatedRoute,
    private xapiTrackingService: XapiTrackingService,
    private safeEmbedPipe: SafeEmbedPipe,
    private xApiService: XapiService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.id = this.currentRoute.snapshot.queryParamMap.get('video_key') || '';
    this.videoUrl = this.safeEmbedPipe.transform(`${this.videoBaseUrl + this.id}&popupAuth=true`);

    if (!this.id) {
      console.error('Video Key / Video Id unable to be parsed from the querystring.');
      this.router.navigate(['/']);
    }

    this.currentRoute.data.subscribe(
      (data) => {
        this.videoDetails = data['videoDetailsResponse'];
      },
      (error: any) => {
        console.error('Unable to retrieve video details.');
        console.error(error);
      }
    );
  }

  getDurationOnLoad(
    player: any,
    callback: (error: any, duration: number) => any
  ): void {
    const interval = 250;
    const maxAttempts = (10 * 1000) / interval;

    const pollDuration = (attempts: number) => {
      player.getDuration((duration: number) => {
        if (duration > 0) {
          this.duration = duration;
          callback(null, duration);
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(() => pollDuration(attempts + 1), interval);
        }
      });
    };

    pollDuration(0);
  }

  ngAfterViewInit(): void {
    const token = {};

    this.player = revSdk.embedVideo('#embed', this.id, {
      log: true,
      popupAuth: true,
      ...token,
      baseUrl: this.videoBaseUrl,
    });

    this.player.on('playerStatusChanged', (e: { status: PlayerStatus }) => {
      if (e.status === PlayerStatus.Playing) {
        if (!this.startTime) {
          this.startTime = new Date();
        }
      }
    });

    this.player.on('videoLoaded', () => {
      if (!this.startTime) {
        console.log("Start Time Set on Ready, we couldn't get the initial 'play' event");
        this.startTime = new Date();
      }
    });

    this.player.on('playerStatusChanged', (e: { status: PlayerStatus }) => {
      if (e.status === PlayerStatus.Ended) {
        const categories: Grouping[] = [];

        if (this.videoDetails) {
          this.videoDetails.categoryPaths.forEach((value: CategoryPathModel) => {
            categories.push({
              id: 'https://forddealersrev.dealerconnection.com/#/media/videos/category/' + value.categoryId,
              definition: {
                name: { 'en-US': value.name },
                type: DefinitionType.CATEGORY,
              },
              objectType: 'Activity',
            });
          });
        }

        const currentStartTime = this.startTime ? this.startTime.getTime() : new Date().getTime() - 30 * 60000;
        const watchDuration = moment.duration(new Date().getTime() - currentStartTime);

        this.userService.user$.subscribe((user) => {
          const payload: Statement = {
            actor: {
              name: `${user && user.firstName ? user.firstName : ''} ${user && user.lastName ? user.lastName : ''}`,
              objectType: 'Agent',
              account: {
                homePage: user && user.userTypeId === UserTypeEnum.Employee ? 'https://www.wslb2b.ford.com' : 'https://wslx.dealerconnection.com',
                name: user && user.userName ? user.userName : '',
              },
            },
            verb: {
              id: VerbId.COMPLETE,
              display: { 'en-US': 'Completed Video' },
            },
            context: {
              contextActivities: {
                grouping: [
                  {
                    id: window.location.origin,
                    definition: {
                      name: { 'en-US': environment.franchise === 0 ? 'Ford Tube' : 'Lincoln Video Gallery' },
                      type: DefinitionType.ORGANIZATION,
                    },
                    objectType: 'Activity',
                  },
                  ...categories,
                ],
                other: [
                  {
                    id: this.starsId ? 'https://xapi.ford.com/extension/starsFlag' : '',
                    objectType: this.starsId ? 'Activity' : '',
                  },
                ],
              },
              extensions: {
                'https://xapi.ford.com/extension/courseid': this.courseId,
                'https://xapi.ford.com/extension/starsid': this.starsId,
              },
            },
            object: {
              id: `https://xapi.ford.com/activities/${environment.franchise === 0 ? 'fordtube' : 'lincolnvideogallery'}/videos/${this.videoDetails ? this.videoDetails.id : ''}`,
              objectType: 'Activity',
              definition: {
                name: { 'en-US': this.videoDetails ? this.videoDetails.title : '' },
                type: DefinitionType.VIDEO,
                description: { 'en-US': this.videoDetails ? this.videoDetails.description : '' },
                moreInfo: `${window.location.origin}${window.location.pathname}?video_key=${getUrlParameter('video_key')}`,
              },
            },
            result: {
              duration: `P0Y0M0DT${watchDuration.hours()}H${watchDuration.minutes()}M${watchDuration.seconds()}S`,
            },
          };

          this.xApiService.statements(removeEmptyProperties(payload)).subscribe();
        });
      }
    });
  }
}
