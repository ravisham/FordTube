import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input
} from '@angular/core';
import { VideoService } from '../../../domain/services/video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoPlaybackUrlResponseItemModel } from '../../../domain/interfaces/videoplaybackurlresponseitem.interface';
import { VideoDetailsModel } from '../../../domain/interfaces/videodetails.interface';
import { CommentItemModel } from '../../../domain/interfaces/commentitem.interface';
import { environment } from '../../../../environments/environment';
import { filter } from 'lodash';
import { getCookie } from '../../../common/utilities/cookie-utilities';
import { UserRoleEnum } from '../../../domain/enums/userroletype.enum';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReportModel } from '../../../domain/interfaces/report.interface';
import { ClipboardService } from 'ngx-clipboard';
import { Subject } from 'rxjs/internal/Subject';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import { XapiService } from '../../../domain/services/xapi.service';
import { removeEmptyProperties } from '../../../common/utilities/object-utilities';
import { getUrlParameter } from '../../../common/utilities/url-utilities';
import {
  getFirstName,
  getLastName,
} from '../../../common/utilities/username-utilities';
import { VerbId } from 'src/app/core/xapi/enums/verb-id.enum';
import { Statement, Grouping } from '../../../core/xapi/models/xapi.interface';
import { DefinitionType } from '../../../core/xapi/enums/definition-type.enum';
import { outsideZone } from '../../../core/rxjs/rxjs-operators';
import { CategoryPathModel } from '../../../domain/interfaces/categorypath.interface';
import { XapiTrackingService } from '../../../core/xapi/services/xapi.tracking.service';
import { SafeHtmlPipe } from 'src/app/common/pipes/safe-html/safe-html.pipe';
import { SafeHtml } from '@angular/platform-browser';
import { SafeEmbedPipe } from '../../../common/pipes/safe-embed/safe-embed.pipe';
import { UserModel } from '../../../domain/interfaces/user.interface';
import { UsersService } from '../../../domain/services/users.service';
import { TemplateRef, ViewChild } from '@angular/core';
import revSdk, { IVbrickVideoEmbed, PlayerStatus, VbrickSDKConfig, VbrickVideoEmbedConfig } from '@vbrick/rev-sdk';
import { Title } from "@angular/platform-browser";
import { UserTypeEnum } from 'src/app/domain/enums/usertype.enum';


@Component({
  selector: 'app-watch',
  templateUrl: './watch.component.html',
  styleUrls: ['./watch.component.scss'],
})
export class WatchComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  ratingByUser: number;

  private _startAt = 0;
  private _startAtDisplay = '0:00';
  private _copySuccess = new Subject<string>();
  reviewError: string;
  categories: string;
  commentText = '';
  comments: CommentItemModel[] = [];
  copySuccessMessage: string;
  player: IVbrickVideoEmbed
  duration = 0;
  currentRate = 0.0;
  featuredCategories: string;
  id: string;
  isAdmin = false;
  startTime: Date;
  receiver: any;
  reportComment: string;
  shareUrl =
    window.location.href.indexOf('&') < 0
      ? window.location.href
      : window.location.href.substr(0, window.location.href.indexOf('&'));
  currentHostName = window.location.host;
  startAtEnabled = false;
  video: VideoPlaybackUrlResponseItemModel;
  videoUrl = '';
  videoBaseUrl = environment.videoUrl;
  videoDetails: VideoDetailsModel;
  currentTime: any = 0;
  allowedUsersForEdit: string[];
  showAdminItemsBasedOnRevAccessEntities = false;
  reviewSubmitLoading: boolean = false;
  flagVideoSubmitLoading: boolean = false; 
  hasResumedFromPreDefinedTime = false;
  shouldStartFromPreDefinedTime = false;

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

  @ViewChild('creditModal', { static: false }) creditModal: TemplateRef<any>;

  constructor(
    private router: Router,
    private videoService: VideoService,
    private currentRoute: ActivatedRoute,
    private modalService: NgbModal,
    private clipboardService: ClipboardService,
    private xapiService: XapiService,
    private titleService: Title,
    private xapiTrackingService: XapiTrackingService,
    private safeHtmlPipe: SafeHtmlPipe,
    private safeEmbedPipe: SafeEmbedPipe,
    private usersService: UsersService,
    private zone: NgZone
  ) { }

  get showAdminItems(): boolean {
    const userRole = parseInt(getCookie('userRoleId'), 10);
    return (
      userRole === UserRoleEnum.SUPER_ADMIN ||
      userRole === UserRoleEnum.DEALER_ADMIN
    );
  }

  get startAt() {
    return Math.floor(this._startAt);
  }

  set startAt(startAt: number) {
    if (!startAt || isNaN(startAt)) {
      return;
    }
    this._startAt = startAt;
    this._startAtDisplay = this.secondsToFormattedTime(startAt);
  }

  get startAtDisplay() {
    return this._startAtDisplay;
  }

  set startAtDisplay(startAtDisplay: string) {
    if (
      !startAtDisplay ||
      (startAtDisplay.indexOf(':') !== -1 &&
        startAtDisplay.split(':').length < 2)
    ) {
      return;
    }
    this._startAtDisplay = startAtDisplay;
    this._startAt = this.formattedTimeToSeconds(startAtDisplay);
  }

  public getHtmlDescription(details: VideoDetailsModel): SafeHtml {
    if (details.htmlDescription) {
      return this.safeHtmlPipe.transform(details.htmlDescription);
    } else {
      return details.description;
    }
  }

  public open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
      .result.then((result) => {
        console.log(result);
        if (result === 'save') {
          this.flagVideoSubmitLoading = true;
          const model: ReportModel = {
            userName: getCookie('userid'),
            name: '',
            videoId: this.id,
            comment: this.reportComment,
            reviewed: false,
          };
          this.videoService.addReport(this.id, model).subscribe(
            () => {
              this.videoDetails.flagged = true;
            },
            (error) => console.log('Error: ', error),
            () => {
              this.flagVideoSubmitLoading = false;
            }
          );
        }
      });
  }

  public openReviewModal(content: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
    this.commentText = null;
    this.currentRate = this.ratingByUser;
    this.reviewError = null;
  }


  public openCreditModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  public submitReviewForm(event: MouseEvent, modal: NgbModalRef) {

    event.preventDefault();

    if (this.checkReviewError()) {
      this.reviewSubmitLoading = true;
      this.videoService
        .addReview(this.id, {
          comment: this.commentText,
          userName: getCookie('userid'),
          rating: this.currentRate,
        })
        .subscribe(
          (response) => {
            this.comments = response.comments.filter(
              (element: CommentItemModel) => {
                element.relativeDate = moment(element.date).fromNow();
                return element.isRemoved == null || element.isRemoved === false;
              }
            );
            this.videoDetails.rating = response.averageRating;
            this.videoDetails.totalRatings = response.totalRatings;
            this.ratingByUser = this.currentRate;

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
                id: VerbId.REVIEWED,
                display: {
                  'en-US': 'Reviewed Video',
                },
              },
              context: {
                contextActivities: {
                  grouping: [
                    {
                      id: window.location.href,
                      definition: {
                        name: {
                          'en-US': this.commentText,
                        },
                        type: DefinitionType.COMMENT,
                      },
                      objectType: 'Activity',
                    },
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
                  (environment.franchise === 0
                    ? 'fordtube'
                    : 'lincolnvideogallery') +
                  '/videos/' +
                  this.videoDetails.id,
                objectType: 'Activity',
                definition: {
                  name: {
                    'en-US': this.videoDetails.title,
                  },
                  type: DefinitionType.REVIEW,
                  description: {
                    'en-US': this.videoDetails.description,
                  },
                  moreInfo:
                    window.location.origin +
                    window.location.pathname +
                    '?v=' +
                    getUrlParameter('v'),
                },
              },
            };

            payload = removeEmptyProperties(payload);

            this.xapiService.statements(payload).subscribe();
          },
          (error) => {
            this.reviewError = error;
            console.log(error);
          },
          () => {

            modal.close();
            this.reviewSubmitLoading = false;
          }
        );
    }
  }

  public openShare(content: any) {
    localStorage.removeItem(this.id);
    if (this.player.currentTime === null || typeof this.player.currentTime === 'undefined') {
      this.startAt = 0;
    } else {
      this.startAt = parseInt(this.player.currentTime.toString());
    }

    this.modalService.open(content, { size: 'lg', centered: true }).result.then(
      () => { },
      () => {
        this.startAtEnabled = false;
        this.copySuccessMessage = null;
      }
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
        id: VerbId.SHARE,
        display: {
          'en-US': 'Shared Video',
        },
      },
      context: {
        contextActivities: {
          grouping: [
            {
              id: this.startAtEnabled
                ? this.shareUrl + '&t=' + this.startAt
                : this.shareUrl,
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
            '?v=' +
            getUrlParameter('v'),
        },
      },
    };

    payload = removeEmptyProperties(payload);

    this.xapiService.statements(payload).subscribe();
  }

  public archive() {
    if (this.videoDetails.archived) {
      this.videoService.unarchive(this.id).subscribe(
        () => {
          this.videoDetails.archived = false;
        },
        (error) => console.log('Error: ', error)
      );
    } else {
      this.videoService.archive(this.id).subscribe(
        () => {
          this.videoDetails.archived = true;
        },
        (error) => console.log('Error: ', error)
      );
    }
    return false;
  }

  public getAttachmentUrl(id: string | number) {
    return environment.maApiUrl + 'api/video/attached-file/' + id;
  }

  downloadSupplementalFile(videoid, fileid, filename) {
    return environment.maApiUrl + 'api/video/' + videoid + '/downloadfile/' + fileid + '?filename=' + filename;
  }
  public getVideoUrl() {
    return environment.maApiUrl + `api/video/download/${this.id}`;
  }

  public copyShareLinkToClipboard() {
    this._copySuccess.subscribe(
      (message) => (this.copySuccessMessage = message)
    );
    this._copySuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.copySuccessMessage = null));

    const str = this.startAtEnabled
      ? this.shareUrl + '&t=' + this.startAt
      : this.shareUrl;

    this.clipboardService.copyFromContent(str);

    this._copySuccess.next('Link copied to clipboard');
  }

  private checkReviewError(): boolean {
    if (this.currentRate === 0) {
      this.reviewError = 'Rating is required.';
      return false;
    }

    return true;
  }

  private secondsToFormattedTime(seconds: number) {
    if (!seconds) {
      return null;
    }
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    const secs = Math.floor(seconds % 3600 % 60)
    let result = '';
    if (hrs > 0) {
      result += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }
    result += '' + mins + ':' + (secs < 10 ? '0' : '');
    result += '' + secs;
    return result;
  }

  private formattedTimeToSeconds(time: string): number {
    if (!time || time.indexOf(':') === -1) {
      time = time || '0:00';
      return Math.floor(parseInt(time, 10));
    }
    const timeParts = time.split(':');
    return Math.floor(
      parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10)
    );
  }


  private secondsToRevPlayerStartTimeFormat(seconds: number): string {
      let MM: string | number;
      let SS: string | number;

      MM = Math.floor((seconds % 3600) / 60)
      SS = (seconds % 60)

      if(MM < 10){
          MM = `0${MM}`
      }
      if(SS < 10){
          SS = `0${SS}`
      }
      return `${MM}m${SS}s`;
  }


  private updateLrsParameters() {
    if (this.currentRoute.snapshot.queryParamMap.has('starsid')) {
      this.xapiTrackingService.TempStarsId = this.currentRoute.snapshot.queryParamMap.get(
        'starsid'
      );
    } 

    if (this.currentRoute.snapshot.queryParamMap.has('coursecode')) {
      this.xapiTrackingService.TempCourseId = this.currentRoute.snapshot.queryParamMap.get(
        'coursecode'
      );
    }
  }

  ngOnInit() {
    this.id = this.currentRoute.snapshot.queryParamMap.get('v');

    if (this.id === null || this.id === '') {
      this.router.navigate(['/']);
    }

    if (this.currentRoute.snapshot.queryParamMap.get('t') || parseFloat(localStorage.getItem(this.id))) {
      this.shouldStartFromPreDefinedTime = true;
    }

    this.videoUrl = this.safeEmbedPipe.transform(this.videoBaseUrl + this.id);


    this.updateLrsParameters();

    // Ensure the user's viewframe contains the video player
    window.scrollTo(null, 0);

    this.currentRoute.data.subscribe(
      (data: { videoPlaybackUrlResponse: { video: any } }) => {
        if (data.videoPlaybackUrlResponse && data.videoPlaybackUrlResponse.video) {
          this.video = data.videoPlaybackUrlResponse.video;
        }
      }
    );

    this.currentRoute.data.subscribe((data: { videoDetailsResponse: any }) => {
      this.videoDetails = data.videoDetailsResponse;
    });

    this.currentRoute.data.subscribe(
      (data: { videoCommentsResponse: { comments: any } }) => {
        if (data.videoCommentsResponse && data.videoCommentsResponse.comments) {
          this.comments = filter(
            data.videoCommentsResponse.comments,
            (comment: CommentItemModel) => {
              comment.relativeDate = moment(comment.date).fromNow();
              return comment.isRemoved == null || comment.isRemoved === false;
            });
        }
      }
    );

    if (this.video) {
      this.categories = this.video.categories.map((c) => c.fullpath).join(', ');
      this.featuredCategories = this.video.featuredCategories.join(', ');
    }

    this.currentRate = 0;
    this.ratingByUser = this.videoDetails.ratingByUser;

    this.allowedUsersForEdit = this.videoDetails.accessControlEntities.filter((item) => item.type === "User").map((item, index) => { return item.id; });

    if (this.allowedUsersForEdit) {

      this.usersService.getByUserName(getCookie('userid'))
        .subscribe((response: UserModel) => {
          if (response) {
            if (this.allowedUsersForEdit.find((item) => item === response.userId)) {
              this.showAdminItemsBasedOnRevAccessEntities = true;
            }
          };
        });
    }
  }

  ngAfterViewInit(): void {

    this.titleService.setTitle(this.videoDetails.title);

    // tslint:disable-next-line: no-string-literal
    window['dataLayer'] = window['dataLayer'].filter(function (obj: { event: string; }) {
      return obj.event !== "vPageview" && obj.event !== 'historyChange';
    }) || [];

    // tslint:disable-next-line: no-string-literal
    window['dataLayer'].push({
      event: 'vPageview',
      pageUrl: window.location,
      pageTitle: this.video.title
    });

    window['dataLayer'].push({
      event: 'historyChange'
    });

    const token = {};

    var playerOptions: VbrickVideoEmbedConfig = {
      baseUrl: environment.vbrickUrl,
      log: true,
      popupAuth:true,
      ...token
    }

    if(this.currentRoute.snapshot.queryParamMap.get('t') !== null || parseFloat(localStorage.getItem(this.id)) > 0) {
      var timeToSkipTo = parseInt(this.currentRoute.snapshot.queryParamMap.get('t') || localStorage.getItem(this.id));
      var configTimeToStartAt = this.secondsToRevPlayerStartTimeFormat(timeToSkipTo);
      playerOptions.startAt = configTimeToStartAt;
    }

    this.player = revSdk.embedVideo('#embed', this.id, playerOptions);    

    if (this.currentRoute.snapshot.queryParamMap.get('t')) {

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
          id: VerbId.START,
          display: {
            'en-US': 'Started Video',
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
          id: window.location.href,
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
              '?v=' +
              getUrlParameter('v'),
          },
        },
      };

      payload = removeEmptyProperties(payload);

      this.xapiService.statements(payload).subscribe();
    };


    this.player.on('playerStatusChanged', (e) => {

      if (e.status === PlayerStatus.Ended) {

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
                '?v=' +
                getUrlParameter('v'),
            },
          },
          result: {
            duration: `P0Y0M0DT${watchDuration.hours()}H${watchDuration.minutes()}M${watchDuration.seconds()}S`,
          },
        };

        payload = removeEmptyProperties(payload);

        this.xapiService.statements(payload).subscribe(response => {
          console.log('Credit info sent ', this.starsId, this.courseId, response);

          if (this.starsId !== null && this.courseId !== null) {
            this.openCreditModal(this.creditModal);
          }
        },
          error => {           
            console.log('Credit Error: ', error);
          });       

        localStorage.removeItem(this.id);

      }

      if (e.status === PlayerStatus.Playing) {
        if (!this.startTime) {
          this.startTime = new Date();
        }

        if (!this.hasResumedFromPreDefinedTime && this.shouldStartFromPreDefinedTime && this.currentRoute.snapshot.queryParamMap.get('t')) {
          this.player.seek(parseInt(this.currentRoute.snapshot.queryParamMap.get('t')));
          this.hasResumedFromPreDefinedTime = true;
        }
      }

      if (e.status === PlayerStatus.Paused) {
        var primaryZoneScope = this;
        this.zone.run(() => {
          primaryZoneScope.currentTime = this.player.currentTime;
          localStorage.setItem(primaryZoneScope.id, this.player.currentTime.toString());
        });
      };
    });


    this.player.on('videoLoaded', (e) => {

      if (!this.startTime) {
        this.startTime = new Date();
      }

      if (this.player && this.player.duration) {
        this.duration = this.player.duration;
      }

      this.zone.run(() => {
        if (this.currentRoute.snapshot.queryParamMap.get('t') == null) {
          if (parseFloat(localStorage.getItem(this.id))) {
            this.player.seek(parseFloat(localStorage.getItem(this.id)));
            this.hasResumedFromPreDefinedTime = true;
          }
        } else {
          this.player.seek(parseInt(this.currentRoute.snapshot.queryParamMap.get('t')));
          this.hasResumedFromPreDefinedTime = true;
        }
      });
    });
  }

  ngOnDestroy(): void {

    this.player.destroy();

    this.titleService.setTitle("Ford Tube");

    this._copySuccess.unsubscribe();
  }
}
