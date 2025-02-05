import { Injectable } from '@angular/core';
import { CarouselService } from '../../../domain/services/carousel.service';
import { SlideModel } from '../../../domain/interfaces/slide.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarouselSingletonService {
  private _slides: SlideModel[];

  constructor(private _carouselService: CarouselService) {}

  public get slides(): SlideModel[] {
    return this._slides || [];
  }

  public set slides(slidesParameter: SlideModel[]) {
    this._slides = slidesParameter;
  }

  public resetSlides() {
    this.getSlides().subscribe(response => {
      this.slides = response;
    });
  }

  public getSlides() {
    return this._carouselService.getActive(environment.franchise);
  }
}
