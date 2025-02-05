import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SlideModel } from '../../domain/interfaces/slide.interface';
import { SafeHtmlPipe } from '../../common/pipes/safe-html/safe-html.pipe';
import { SafeHtml } from '@angular/platform-browser';
import { CarouselSingletonService } from './services/carousel-singleton.service';
import { isArray } from 'lodash';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: [CarouselSingletonService]
})
export class CarouselComponent implements OnInit, OnDestroy {
  private _slides: SlideModel[] = this.carouselService.slides;

  public slideImagePath = environment.apiImagePath;

  public get slides(): SlideModel[] {
    return this._slides;
  }

  public set slides(slidesParam: SlideModel[]) {
    this._slides = slidesParam;
  }

  @HostListener('document:resetSlides')
  private handleResetSlides() {
    this.carouselService.getSlides().subscribe(response => {
      this.carouselService.slides = response;
      this.slides = response;
    });
  }

  constructor(private carouselService: CarouselSingletonService, private safeHtmlPipe: SafeHtmlPipe) {}

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

  ngOnInit() {
    this.carouselService.getSlides().subscribe(response => {
      this.carouselService.slides = response;
      this.slides = response;
    });
  }

  ngOnDestroy() {
    document.removeEventListener('resetSlides', this.carouselService.resetSlides);
  }
}
