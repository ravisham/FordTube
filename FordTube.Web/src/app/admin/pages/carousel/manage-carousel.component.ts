import { OnInit, Component } from '@angular/core';
import { CarouselService } from '../../../domain/services/carousel.service';
import { environment } from '../../../../environments/environment';
import { SlideMap } from '../../../domain/mapping/slide.map';
import { SlideModel } from '../../../domain/interfaces/slide.interface';
import { map } from 'lodash';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { SlideDtoModel } from '../../../domain/interfaces/slidedto.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-carousel',
  templateUrl: './manage-carousel.component.html',
  styleUrls: ['./manage-carousel.component.scss']
})
export class ManageCarouselComponent implements OnInit { 

  get slides(): SlideMap[] {
    return this._slides;
  }

  set slides(slides: SlideMap[]) {
    this._slides = slides;
  }

  constructor(private carouselService: CarouselService) { }

  private _slides: SlideMap[] = [];

  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '25rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultFontName: 'Ford Antenna - Regular',
    defaultFontSize: '4',
	toolbarPosition: 'top',
    fonts: [
      // optional
      {
        class: 'antenna-black',
        name: 'Antenna-Black'
      },
      {
        class: 'antenna-regular',
        name: 'Antenna-Regular'
      },
      {
        class: 'antenna-extra-light',
        name: 'Antenna-ExtraLight'
      },
      {
        class: 'antenna-extra-cond',
        name: 'AntennaExtraCond-Regular'
      },
      {
        class: 'antenna-cond',
        name: 'AntennaCond-Regular'
      },
      {
        class: 'antenna-extra-light-cond',
        name: 'AntennaCond-ExtraLight'
      }
    ],
    customClasses: [
      {
        class: 'text-shadow',
        name: 'Text Shadow'
      }
    ]
  };

  /**
   *
   * @summary Determines whether or not more slides can be added to the collection.
   * @returns
   * @memberof ManageCarouselComponent
   */
  public disableSlideAddition() {
    return this.slides.length >= 20;
  }

  /**
   *
   * @summary Add Slide to the UI collection.
   * @memberof ManageCarouselComponent
   */
  public addSlideToUI(ngbTabSet: NgbTabset) {
    if (this.disableSlideAddition()) {
      return;
    }

    const newSlide = new SlideMap();
    newSlide.backgroundImage = null;
    newSlide.isNew = true;
    newSlide.activeDate = null;
    newSlide.activeTime = null;
    newSlide.inactiveDate = null;
    newSlide.inactiveTime = null;
    newSlide.backgroundColor = null;
    newSlide.franchise = environment.franchise;
    newSlide.link = null;
    newSlide.text = null;
    newSlide.textPosition = 0;

    this.slides.push(newSlide);
  }

  public changeSlideImage(slide: SlideMap) {
    const slideToUpdate = this.slides.find(s => s.id === slide.id);
    slideToUpdate.backgroundImageUrl = null;
    slideToUpdate.isNew = false;
    slideToUpdate.isModifying = true;
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }

  /**
   *
   * @summary Save a Single Slide to the Database
   * @param {SlideMap} slide
   * @memberof ManageCarouselComponent
   */
  public saveSlide(slide: SlideMap) {   

    const activeDate = slide.toDto().activeDate;
    if (activeDate !== null) {
      slide.activeDate = moment(activeDate, "YYYY-MM-DD").toDate();
    }

    const inactiveDate = slide.toDto().inactiveDate;
    if (inactiveDate !== null) {
      slide.inactiveDate = moment(inactiveDate, "YYYY-MM-DD").toDate();
    }

    this.carouselService.post(slide.toDto()).subscribe(response => {
      this.slides = this.slidesFromEntity(response);
      window.scrollTo({ behavior: 'smooth', top: 0 });
      this.clearActiveSlidesCacheForUser();
    });
  }

  /**
   *
   * @summary Delete Slide from the Database
   * @param {number} slideId
   * @memberof ManageCarouselComponent
   */
  public deleteSlide(slideId: number) {
    this.carouselService.delete(slideId).subscribe(response => {
      this.slides = this.slidesFromEntity(response);
      window.scrollTo({ behavior: 'smooth', top: 0 });
      this.clearActiveSlidesCacheForUser();
    });
  }

  /**
   *
   * @summary Refresh the slides from the server, removing any unsaved changes.
   * @memberof ManageCarouselComponent
   */
  public refreshSlides() {
    this.carouselService.getAll(environment.franchise).subscribe(response => {
      this.slides = this.slidesFromEntity(response);
      window.scrollTo({ behavior: 'smooth', top: 0 });
    });
  }

  /**
   *
   * @summary Update Slide on the Database
   * @param {number} slideId
   * @memberof ManageCarouselComponent
   */
  public updateSlide(slideId: number) {
    const slideToUpdate = this.slideToDto(slideId);

    const activeDate = slideToUpdate.activeDate;
    if (activeDate !== null) {
      slideToUpdate.activeDate = moment(activeDate, "YYYY-MM-DD").toDate();
    }

    const inactiveDate = slideToUpdate.inactiveDate;
    if (inactiveDate !== null) {
      slideToUpdate.inactiveDate = moment(inactiveDate, "YYYY-MM-DD").toDate();
    }

    this.carouselService.put(slideId, slideToUpdate).subscribe(response => {
      this.slides = this.slidesFromEntity(response);
      window.scrollTo({ behavior: 'smooth', top: 0 });
      this.clearActiveSlidesCacheForUser();
    });
  }

  /**
   *
   * @summary Build Image URL
   * @param {SlideModel} slide
   * @returns {string}
   * @memberof ManageCarouselComponent
   */
  public getBackgroundImageUrl(slide: SlideModel): string {
    return environment.apiImagePath + slide.backgroundImageUrl;
  }

  /**
   *
   * @summary Handle File Input, Get and Convert the image to base64
   * @param {*} event
   * @param {SlideMap} slide
   * @memberof ManageCarouselComponent
   */
  public onFileChange(event: any, slide: SlideMap) {
    const file = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = (progressEvent: ProgressEvent) => {
      slide.backgroundImage = fileReader.result
        .toString()
        .split(',')
        .pop();
    };

    fileReader.readAsDataURL(file);
  }

  ngOnInit() {
    // Get All Slides and render the page with results.
    this.carouselService.getAll(environment.franchise).subscribe(response => {
      this.slides = this.slidesFromEntity(response);
    });
  }



  /**
   *
   * @summary Clear the session storage for the 'slides' so the admin will see the latest slides after updating.
   * @private
   * @memberof ManageCarouselComponent
   */
  private clearActiveSlidesCacheForUser(): void {
    if (sessionStorage.getItem('slides')) {
      sessionStorage.removeItem('slides');
    }
    document.dispatchEvent(new Event('resetSlides'));
  }

  /**
   *
   * @summary SlideModel[] => SlideMap[]
   * @private
   * @param {SlideModel[]} conversion
   * @returns {SlideMap[]}
   * @memberof ManageCarouselComponent
   */
  private slidesFromEntity(conversion: SlideModel[]): SlideMap[] {
    const originalSlides = map(conversion, slide => {
      const slideMap = new SlideMap();
      slideMap.fromEntity(slide);
      return slideMap;
    });
    return originalSlides;
  }

  /**
   *
   * @summary SlideMap => SlideDto
   * @private
   * @returns {SlideDtoModel}
   * @memberof ManageCarouselComponent
   */
  private slideToDto(slideId: number): SlideDtoModel {
    const slideToUpdate = this.slides.find(s => s.id === slideId);
    const returnDto = slideToUpdate.toDto();
    return returnDto;
  }
}
