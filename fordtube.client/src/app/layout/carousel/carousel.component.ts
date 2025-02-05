import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SlideModel } from '../../domain/interfaces/slide.interface';
import { SafeHtmlPipe } from '../../common/pipes/safe-html/safe-html.pipe';
import { SafeHtml } from '@angular/platform-browser';
import { CarouselSingletonService } from './services/carousel-singleton.service';
import { isArray } from 'lodash';
import { UserService } from '../../core/user/user.service';
import { switchMap} from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: [CarouselSingletonService]
})
export class CarouselComponent implements OnInit, OnDestroy {
  private _slides: SlideModel[] = [];

  public slideImagePath = environment.apiImagePath;

  public get slides(): SlideModel[] {
    return this._slides;
  }

  public set slides(slidesParam: SlideModel[]) {
    this._slides = slidesParam;
  }

  @HostListener('document:resetSlides')
  private handleResetSlides() {
    this.userService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.carouselService.getSlides();
        } else {
          return of([]);
        }
      })
    ).subscribe(response => {
      this.carouselService.slides = response;
      this.slides = response;
    });
  }

  constructor(
    private carouselService: CarouselSingletonService,
    private safeHtmlPipe: SafeHtmlPipe,
    private userService: UserService
  ) {
    this.userService.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.carouselService.getSlides();
        } else {
          return of([]);
        }
      })
    ).subscribe(response => {
      this.carouselService.slides = response;
      this.slides = response;
    });
  }

  public getTextHtml(slide: SlideModel): SafeHtml {
    return this.safeHtmlPipe.transform(slide.text);
  }

  public showControls() {
    return isArray(this.slides) ? this.slides.length > 1 : false;
  }

  public handleLinkClick(slide: SlideModel) {
    if (slide.link) {
      window.location.href = slide.link;
    }
  }

  ngOnInit() { }

  ngOnDestroy() {
    document.removeEventListener('resetSlides', this.carouselService.resetSlides);
  }
}
