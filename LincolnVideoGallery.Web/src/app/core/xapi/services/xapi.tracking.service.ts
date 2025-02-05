import { Injectable, Output, EventEmitter } from '@angular/core';
import { isNullOrEmpty } from '../../../common/utilities/object-utilities';

@Injectable({
  providedIn: 'root',
})
export class XapiTrackingService {
  @Output() XapiParameterChangeEvent: EventEmitter<any> = new EventEmitter();

  constructor() {}

  get StarsId(): string {
    return sessionStorage.getItem('starsId');
  }

  set StarsId(value: string) {
    if (!isNullOrEmpty(value)) {
      sessionStorage.setItem('starsId', value);
      this.XapiParameterChangeEvent.emit({ starsId: value });
    }
  }

  get CourseId(): string {
    return sessionStorage.getItem('courseId');
  }

  set CourseId(value: string) {
    if (!isNullOrEmpty(value) || value === 'null') {
      sessionStorage.setItem('courseId', value);
      this.XapiParameterChangeEvent.emit({ courseId: value });
    }
  }

  get TempStarsId(): string {
    return sessionStorage.getItem('temp.starsId');
  }

  set TempStarsId(value: string) {
    if (isNullOrEmpty(value) || value === 'null') {
      sessionStorage.removeItem('temp.starsId');
      return;
    } else {
      sessionStorage.setItem('temp.starsId', value);
    }

    this.XapiParameterChangeEvent.emit({ 'temp.starsId': value });
  }

  get TempCourseId(): string {
    return sessionStorage.getItem('temp.courseId');
  }

  set TempCourseId(value: string) {
    if (isNullOrEmpty(value)) {
      sessionStorage.removeItem('temp.courseId');
      return;
    } else {
      sessionStorage.setItem('temp.courseId', value);
    }

    this.XapiParameterChangeEvent.emit({ 'temp.courseId': value });
  }
}
