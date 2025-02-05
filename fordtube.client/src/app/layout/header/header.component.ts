import { DisclaimerService } from '../../domain/services/disclaimer.service';
import { XapiTrackingService } from '../../core/xapi/services/xapi.tracking.service';
import { Component, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { SideNavService } from '../side-nav/services/side-nav.service';
import { HeaderSearchService } from '../header-search/services/header-search.service';
import { NgbModal, NgbModalRef, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { StarsService } from '../../domain/services/stars.service';
import { Subscription, of } from 'rxjs';
import { UserRoleEnum } from '../../domain/enums/userroletype.enum';
import { UserTypeEnum } from '../../domain/enums/usertype.enum';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core/user/user.service';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements AfterViewInit, AfterContentInit {
  private _errorMessage: string;
  private _shouldShowBrowserAlert = true;
  public shouldDisplayStarsAlert = false;
  public hasCheckedDoNotDisplay = false;
  public modal: NgbModalRef;
  public starsIdField = '';
  public shouldShowCourseWatchToCompletionMessage = false;

  @ViewChild('disclaimerModalContent', { static: false })
  private disclaimerModalContent: any;

  constructor(
    private sideNavService: SideNavService,
    private headerSearchService: HeaderSearchService,
    private currentRoute: ActivatedRoute,
    private modalService: NgbModal,
    private starsService: StarsService,
    private xapiTrackingService: XapiTrackingService,
    private disclaimerService: DisclaimerService,
    private userService: UserService
  ) { }

  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(message: string) {
    this._errorMessage = message;
  }

  get welcomeMessage() {
    const firstName = this.userService.getFirstName();
    const lastName = this.userService.getLastName();
    return `Welcome ${firstName} ${lastName}`;
  }

  get isDealer() {
    const userRole = this.userService.getUserRoleId();
    return (
      userRole === UserRoleEnum.DEALER ||
      userRole === UserRoleEnum.DEALER_ADMIN
    );
  }

  get isEmployee(): boolean {
    const userType = this.userService.getUserTypeId();
    return (
      userType === UserTypeEnum.Nonovvm ||
      userType === UserTypeEnum.Employee
    );
  }

  public get shouldShowBrowserAlert() {
    return this._shouldShowBrowserAlert;
  }

  public set shouldShowBrowserAlert(value) {
    this._shouldShowBrowserAlert = value;
  }

  get IsOpen() {
    return this.sideNavService.isMenuOpen;
  }

  starsId = () => {
    return (
      this.xapiTrackingService.TempStarsId || this.xapiTrackingService.StarsId
    );
  }

  openModal(content: any) {
    this.errorMessage = null;
    this.modal = this.modalService.open(content);
  }

  closeBrowserAlertHandler(alert: NgbAlert) {
    this.shouldShowBrowserAlert = false;
  }

  closeCourseVideoCompletionMessageHandler(alert: NgbAlert) {
    this.shouldShowCourseWatchToCompletionMessage = false;
  }

  closeHandler(alert: NgbAlert) {
    this.shouldDisplayStarsAlert = false;
    this.errorMessage = null;
    localStorage.setItem('viewedStarsAlert', 'true');
  }

  toggleSearch() {
    this.headerSearchService.setToggleSearch();
  }

  toggle($event: Event) {
    $event.preventDefault();
    this.sideNavService.setToggleMenu();
  }

  saveStarsChanges(
    event: MouseEvent,
    starsIdField: string,
    modal: NgbModalRef,
    alert: NgbAlert
  ) {
    const originalStarsId = this.xapiTrackingService.StarsId;
    this.starsService
      .post(this.userService.getUserName() || '', starsIdField.toString())
      .subscribe(
        (response: string) => {
          this.xapiTrackingService.StarsId =
            starsIdField.toString() || response;
          this.xapiTrackingService.TempStarsId = null;
          this.errorMessage = null;

          if (alert) {
            this.closeHandler(alert);
          }

          if (modal) {
            modal.close();
          }
        },

        (error) => {
          this.errorMessage = error.error;
          this.xapiTrackingService.StarsId = originalStarsId;
        }
      );
  }

  saveDisclaimerAcknowledgement(event: MouseEvent, modal: NgbModalRef) {
    if (this.hasCheckedDoNotDisplay) {
      this.updateDisclaimerCheck();
    } else {
      localStorage.setItem('viewedDisclaimerModal', 'true');
    }
    modal.close();
  }

  ngAfterViewInit(): void {
    this.initializeStarsUpdateCheck();
    this.initializeDisclaimerCheck();
  }

  ngAfterContentInit(): void {
    this.initializeBrowserCompatibilityCheck();
    this.initializeCourseWatchToCompletionMessageCheck();
  }

  private initializeCourseWatchToCompletionMessageCheck(): void {
    if (
      this.xapiTrackingService.TempStarsId ||
      this.xapiTrackingService.TempCourseId ||
      this.currentRoute.snapshot.queryParamMap.get('coursecode') ||
      this.currentRoute.snapshot.queryParamMap.get('starsid')
    ) {
      this.shouldShowCourseWatchToCompletionMessage = true;
    }
  }

  private initializeStarsUpdateCheck(): void {
    if (this.currentRoute.snapshot.queryParamMap.get('coursecode')) {
      this.xapiTrackingService.TempCourseId = this.currentRoute.snapshot.queryParamMap.get(
        'coursecode'
      );
    }

    if (this.currentRoute.snapshot.queryParamMap.get('starsid')) {
      const starsIdFromQueryString = this.currentRoute.snapshot.queryParamMap.get(
        'starsid'
      );
      this.starsIdField = starsIdFromQueryString;
      this.xapiTrackingService.StarsId = starsIdFromQueryString;

      return;
    }

    this.userService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.starsService.get(user.userName);
        } else {
          return of(null);
        }
      }),
      switchMap(response => {
        if (response !== null) {
          // User has stored a Stars Id
          this.xapiTrackingService.StarsId = response;
          this.starsIdField = response;
          // Ensure the user is not an employee?
          if (!this.isEmployee) {
            // Check if it has been 90 Days since we last prompted the user (happens on the back-end).
            return this.starsService.showUpdateStars(this.userService.getUserName());
          }
        } else if (this.isDealer) {
          this.shouldDisplayStarsAlert = true;
        }
        return of(false);
      })
    ).subscribe((shouldUpdate) => {
      if (Boolean(shouldUpdate)) {
        this.shouldDisplayStarsAlert = true;
      }
    }, (error) => console.log('Error: ', error));
  }

  private initializeDisclaimerCheck(): void {
    this.userService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.disclaimerService.showUpdateDisclaimer(user.userName).pipe(
            catchError(error => {
              console.error(error);
              return of(true); // Show disclaimer modal if there's an error
            })
          );
        } else {
          return of(false);
        }
      })
    ).subscribe((response: boolean) => {
      if (Boolean(response) && localStorage.getItem('viewedDisclaimerModal') !== 'true') {
        this.modalService.open(this.disclaimerModalContent);
      }
    });
  }

  private initializeBrowserCompatibilityCheck(): void {
    const checkIsIeViaBrowserFeatures = document['documentMode'];
    this.shouldShowBrowserAlert =
      checkIsIeViaBrowserFeatures || navigator.userAgent.indexOf('MSIE') > 0;
  }

  private updateDisclaimerCheck(): Subscription {
    return this.userService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.disclaimerService.updateDisclaimerLastSeen(user.userName);
        } else {
          return of(null);
        }
      })
    ).subscribe(() => {
      if (localStorage.getItem('viewedDisclaimerModal') !== 'true') {
        localStorage.setItem('viewedDisclaimerModal', 'true');
      }
    });
  }
}
