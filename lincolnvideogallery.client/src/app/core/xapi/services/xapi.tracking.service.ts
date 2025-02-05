import { Injectable, Output, EventEmitter } from '@angular/core';
import { isNullOrEmpty } from '../../../common/utilities/object-utilities';

@Injectable({
  providedIn: 'root',
})
export class XapiTrackingService {
  @Output() XapiParameterChangeEvent = new EventEmitter();

  constructor() {}

  get StarsId(): string {
    return localStorage.getItem('starsId');
  }

  set StarsId(value: string) {
    if (!isNullOrEmpty(value)) {
      localStorage.setItem('starsId', value);
      this.XapiParameterChangeEvent.emit({ starsId: value });
    }
  }

  get CourseId(): string {
    return localStorage.getItem('courseId');
  }

  set CourseId(value: string) {
    if (!isNullOrEmpty(value) || value === 'null') {
      localStorage.setItem('courseId', value);
      this.XapiParameterChangeEvent.emit({ courseId: value });
    }
  }

  get TempStarsId(): string {
    return localStorage.getItem('temp.starsId');
  }

  set TempStarsId(value: string) {
    if (isNullOrEmpty(value) || value === 'null') {
      localStorage.removeItem('temp.starsId');
      return;
    } else {
      localStorage.setItem('temp.starsId', value);
    }

    this.XapiParameterChangeEvent.emit({ 'temp.starsId': value });
  }

  get TempCourseId(): string {
    return localStorage.getItem('temp.courseId');
  }

  set TempCourseId(value: string) {
    if (isNullOrEmpty(value)) {
      localStorage.removeItem('temp.courseId');
      return;
    } else {
      localStorage.setItem('temp.courseId', value);
    }

    this.XapiParameterChangeEvent.emit({ 'temp.courseId': value });
  }
}
