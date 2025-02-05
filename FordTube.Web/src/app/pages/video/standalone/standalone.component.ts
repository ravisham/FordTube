import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
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
import {
  getFirstName,
  getLastName,
} from 'src/app/common/utilities/username-utilities';
import { getCookie } from 'src/app/common/utilities/cookie-utilities';
import { VerbId } from 'src/app/core/xapi/enums/verb-id.enum';
import { getUrlParameter } from 'src/app/common/utilities/url-utilities';
import { removeEmptyProperties } from 'src/app/common/utilities/object-utilities';
import { SafeEmbedPipe } from '../../../common/pipes/safe-embed/safe-embed.pipe';
import revSdk, { PlayerStatus } from '@vbrick/rev-sdk';
import { UserTypeEnum } from 'src/app/domain/enums/usertype.enum';

@Component({
  selector: 'app-standalone',
  templateUrl: './standalone.component.html',
  styleUrls: ['./standalone.component.scss'],
})
export class StandaloneComponent implements OnInit, AfterViewInit {
  id: string;
  videoBaseUrl = environment.vbrickUrl;
  videoDetails: VideoDetailsModel;
  player: any;
  startTime: Date;
  videoUrl: any;

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
    private xapiTrackingService: XapiTrackingService,
    private safeEmbedPipe: SafeEmbedPipe,
    private xApiService: XapiService
  ) {}

  ngOnInit() {

    this.id = this.currentRoute.snapshot.queryParamMap.get('video_key');

    this.videoUrl = this.safeEmbedPipe.transform(`${this.videoBaseUrl + this.id}&popupAuth=true`);


    if (this.id === null || this.id === '') {
      console.error(
        'Video Key / Video Id unable to be parsed from the querystring. \r\n'
      );
      this.router.navigate(['/']);
    }

    this.currentRoute.data.subscribe(
      (data: { videoDetailsResponse: any }) => {
        this.videoDetails = data.videoDetailsResponse;
      },
      (error: any) => {
        console.error('Unable to retrieve video details. \r\n');
        console.error(error);
      }
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

    this.player = revSdk.embedVideo('#embed', this.id, {
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

    this.player.on('videoLoaded', () => {
      if (!this.startTime) {
        console.log("Start Time Set on Ready, we couldn't get the initial 'play' event");
        this.startTime = new Date();
      }
    })

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

      var currentStartTime: number;
      if (this.startTime && this.startTime.getTime()) {
        currentStartTime = this.startTime.getTime();
      } else {
        currentStartTime = new Date(new Date().getTime() - 30 * 60000).getTime();
      }

      const watchDuration = moment.duration(
        new Date().getTime() - currentStartTime
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

      this.xApiService.statements(payload).subscribe();
  }});
  }
}
