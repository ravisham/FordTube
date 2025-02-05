import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { XapiService } from 'src/app/domain/services/xapi.service';
import { DefinitionType } from 'src/app/core/xapi/enums/definition-type.enum';
import { Statement, Grouping } from 'src/app/core/xapi/models/xapi.interface';
import { CategoryPathModel } from 'src/app/domain/interfaces/categorypath.interface';
import { getCookie } from 'src/app/common/utilities/cookie-utilities';
import { VerbId } from 'src/app/core/xapi/enums/verb-id.enum';
import { getUrlParameter } from 'src/app/common/utilities/url-utilities';
import { removeEmptyProperties } from 'src/app/common/utilities/object-utilities';
import {
  getLastName,
  getFirstName,
} from 'src/app/common/utilities/username-utilities';
import * as moment from 'moment';
import { XapiTrackingService } from '../../../core/xapi/services/xapi.tracking.service';
import { VideoDetailsModel } from 'src/app/domain/interfaces/videodetails.interface';
import revSdk, { PlayerStatus } from '@vbrick/rev-sdk';
import { UserTypeEnum } from 'src/app/domain/enums/usertype.enum';

@Component({
  selector: 'app-standalone-embed',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './standalone-embed.component.html',
  styleUrls: ['./standalone-embed.component.scss'],
})
export class StandaloneEmbedComponent
  implements OnInit, OnDestroy, AfterViewInit {
  videoBaseUrl = environment.vbrickUrl;
  videoId;
  videoKey;
  player: any;
  startTime: Date;
  videoDetails: VideoDetailsModel;

  get starsId(): string {
    if (
      this.xapiTrackingService.TempStarsId &&
      this.xapiTrackingService.TempStarsId !== 'null'
    ) {
      return this.xapiTrackingService.TempStarsId;
    } else {
      return this.xapiTrackingService.StarsId;
    }
  }

  get courseId(): string {
    if (
      this.xapiTrackingService.TempCourseId &&
      this.xapiTrackingService.TempCourseId !== 'null'
    ) {
      return this.xapiTrackingService.TempCourseId;
    } else {
      return this.xapiTrackingService.CourseId;
    }
  }

  constructor(
    private router: Router,
    private currentRoute: ActivatedRoute,
    private xapiService: XapiService,
    private xapiTrackingService: XapiTrackingService
  ) {}

  ngOnInit() {
    // Auto Create a Service Session on the IDP to allow all users to view protected video.
    this.currentRoute.data.subscribe(
      (data: { videoDetailsResponse: VideoDetailsModel }) => {
        this.videoDetails = data.videoDetailsResponse;
        this.videoId = this.videoDetails.id;
      },

      (error: any) => {
        console.error('Unable to retrieve video details. \r\n');
        console.error(error);
      }
    );

    this.videoKey =
      this.currentRoute.snapshot.queryParamMap.get('video_key') ||
      this.currentRoute.snapshot.queryParamMap.get('v');

    if (this.videoKey === null || this.videoKey === '') {
      this.router.navigate(['/']);
    }

    // Ensure iframe occupies the entire screen.
    if (document.body.className.indexOf('embed-responsive') === -1) {
      document.body.className += ' ' + 'embed-responsive';
    }
  }

  ngOnDestroy() {
    // Ensure responsive CSS class is removed from iframe upon destruction.
    document.body.className = document.body.className.replace(
      'embed-responsive',
      ''
    );
  }

  getDurationOnLoad(
    player: any,
    callback: (error: any, duration: number) => any
  ): void {
    // setting retry interval to 250 ms
    const interval = 250;
    // timeout after 10 seconds
    const maxattempts = (10 * 1000) / interval;
    function pollDuration(attempts: number) {
      player.getDuration((duration: number) => {
        // check if duration has been calculated yet
        if (duration && duration > 0) {
          this.duration = duration;
          callback(null, duration);
          return;
        }
        // try again to get duration
        if (attempts < maxattempts) {
          setTimeout(pollDuration, interval, attempts + 1);
        }
      });
    }
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

    this.player.on('playerStatusChanged', (e) => {
      if (e.status == PlayerStatus.Playing) {       
        if (!this.startTime) {
          this.startTime = new Date();
        }
      }
    });

    this.player.on('playerStatusChanged', (e) => {
      if (e.status == PlayerStatus.Ended) {    
      const categories: Grouping[] = [];

      this.videoDetails.categoryPaths.forEach((value: CategoryPathModel) => {
        categories.push({
          id:
            'https://forddealersrev.dealerconnection.com/#/media/videos/category/' +
            value.categoryId,
          definition: {
            name: {
              'en-US': value.name,
            },
            type: DefinitionType.CATEGORY,
          },
          objectType: 'Activity',
        });
      });

      const watchDuration = moment.duration(
        new Date().getTime() - this.startTime.getTime()
      );

      let payload: Statement = {
        actor: {
          name: getFirstName() + ' ' + getLastName(),
          objectType: 'Agent',
          account: {
            homePage: getCookie('acigroup') && getCookie('acigroup').toLocaleLowerCase() === "employee" ? 'https://www.wslb2b.ford.com' : 'https://wslx.dealerconnection.com',
            name: getCookie('userid'),
          },
        },
        verb: {
          id: VerbId.COMPLETE,
          display: {
            'en-US': 'Completed Video',
          },
        },
        context: {
          contextActivities: {
            grouping: [
              {
                id: window.location.origin,
                definition: {
                  name: {
                    'en-US':
                      environment.franchise === 0
                        ? 'Ford Tube'
                        : 'Lincoln Video Gallery',
                  },
                  type: DefinitionType.ORGANIZATION,
                },
                objectType: 'Activity',
              },
              ...categories,
            ],
            other: [
              {
                id: this.starsId
                  ? 'https://xapi.ford.com/extension/starsFlag'
                  : null,
                objectType: this.starsId ? 'Activity' : null,
              },
            ],
          },
          extensions: {
            'https://xapi.ford.com/extension/courseid': this.courseId,
            'https://xapi.ford.com/extension/starsid': this.starsId,
          },
        },
        object: {
          id:
            'https://xapi.ford.com/activities/' +
            (environment.franchise === 0 ? 'fordtube' : 'lincolnvideogallery') +
            '/videos/' +
            this.videoDetails.id,
          objectType: 'Activity',
          definition: {
            name: {
              'en-US': this.videoDetails.title,
            },
            type: DefinitionType.VIDEO,
            description: {
              'en-US': this.videoDetails.description,
            },
            moreInfo:
              window.location.origin +
              window.location.pathname +
              '?video_key=' +
              getUrlParameter('video_key'),
          },
        },
        result: {
          duration: `P0Y0M0DT${watchDuration.hours()}H${watchDuration.minutes()}M${watchDuration.seconds()}S`,
        },
      };

      payload = removeEmptyProperties(payload);

      this.xapiService.statements(payload).subscribe();
  }});
  }
}
