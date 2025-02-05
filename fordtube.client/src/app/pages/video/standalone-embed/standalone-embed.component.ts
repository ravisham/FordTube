import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { XapiService } from 'src/app/domain/services/xapi.service';
import { DefinitionType } from 'src/app/core/xapi/enums/definition-type.enum';
import { Statement, Grouping } from 'src/app/core/xapi/models/xapi.interface';
import { CategoryPathModel } from 'src/app/domain/interfaces/categorypath.interface';
import { VerbId } from 'src/app/core/xapi/enums/verb-id.enum';
import { getUrlParameter } from 'src/app/common/utilities/url-utilities';
import { removeEmptyProperties } from 'src/app/common/utilities/object-utilities';
import * as moment from 'moment';
import { XapiTrackingService } from '../../../core/xapi/services/xapi.tracking.service';
import { VideoDetailsModel } from 'src/app/domain/interfaces/videodetails.interface';
import revSdk, { PlayerStatus } from '@vbrick/rev-sdk';
import { UserTypeEnum } from '../../../domain/enums/usertype.enum';
import { UserService } from '../../../core/user/user.service';

@Component({
  selector: 'app-standalone-embed',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './standalone-embed.component.html',
  styleUrls: ['./standalone-embed.component.scss'],
})
export class StandaloneEmbedComponent
  implements OnInit, OnDestroy, AfterViewInit {
  videoBaseUrl = environment.vbrickUrl;
  videoId: string = '';
  videoKey: string = '';
  player: any;
  startTime: Date = new Date();
  videoDetails: VideoDetailsModel = {} as VideoDetailsModel;
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
    private xapiService: XapiService,
    private xapiTrackingService: XapiTrackingService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Auto Create a Service Session on the IDP to allow all users to view protected video.
    this.currentRoute.data.subscribe(
      (data) => {
        this.videoDetails = data['videoDetailsResponse'];
        this.videoId = this.videoDetails.id;
      },
      (error: any) => {
        console.error('Unable to retrieve video details.');
        console.error(error);
      }
    );

    this.videoKey =
      this.currentRoute.snapshot.queryParamMap.get('video_key') ||
      this.currentRoute.snapshot.queryParamMap.get('v') || '';

    if (!this.videoKey) {
      this.router.navigate(['/']);
    }

    // Ensure iframe occupies the entire screen.
    if (!document.body.className.includes('embed-responsive')) {
      document.body.className += ' embed-responsive';
    }
  }

  ngOnDestroy() {
    // Ensure responsive CSS class is removed from iframe upon destruction.
    document.body.className = document.body.className.replace('embed-responsive', '');
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

    this.player = revSdk.embedVideo('#embed', this.videoId, {
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

    this.player.on('playerStatusChanged', (e: { status: PlayerStatus }) => {
      if (e.status === PlayerStatus.Ended) {
        const categories: Grouping[] = [];

        this.videoDetails.categoryPaths.forEach((value: CategoryPathModel) => {
          categories.push({
            id: `https://forddealersrev.dealerconnection.com/#/media/videos/category/${value.categoryId}`,
            definition: {
              name: { 'en-US': value.name },
              type: DefinitionType.CATEGORY,
            },
            objectType: 'Activity',
          });
        });

        const watchDuration = moment.duration(new Date().getTime() - this.startTime.getTime());

        this.userService.user$.subscribe(user => {
          let payload: Statement = {
            actor: {
              name: `${user && user.firstName ? user.firstName : ''} ${user && user.lastName ? user.lastName : ''}`,
              objectType: 'Agent',
              account: {
                homePage: user && user.userTypeId === UserTypeEnum.Employee ? 'https://www.wslb2b.ford.com' : 'https://wslx.dealerconnection.com',
                name: user && user.userName ? user.userName.toString() : '',
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
              id: `https://xapi.ford.com/activities/${environment.franchise === 0 ? 'fordtube' : 'lincolnvideogallery'}/videos/${this.videoDetails.id}`,
              objectType: 'Activity',
              definition: {
                name: { 'en-US': this.videoDetails.title },
                type: DefinitionType.VIDEO,
                description: { 'en-US': this.videoDetails.description },
                moreInfo: `${window.location.origin}${window.location.pathname}?video_key=${getUrlParameter('video_key')}`,
              },
            },
            result: {
              duration: `P0Y0M0DT${watchDuration.hours()}H${watchDuration.minutes()}M${watchDuration.seconds()}S`,
            },
          };

          payload = removeEmptyProperties(payload);

          this.xapiService.statements(payload).subscribe();
        });
      }
    });
  }
}
