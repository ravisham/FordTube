

import { Observable } from 'rxjs/internal/Observable';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { LocalUser } from '../interfaces/localuser.interface';

@Injectable()
export class CookieValueService {

  //execChange: Subject<any> = new Subject<any>();

  //constructor() { }

  ///**
  // * Use to change user name
  // * @data type: string
  // */
  //userNameChange(data: string) {
  //  this.execChange.next(data);
  //}

  private profileObs$: BehaviorSubject<string> = new BehaviorSubject(null);

  getProfileObs(): Observable<string> {
    return this.profileObs$.asObservable();
  }

  setProfileObs(profile: string) {
    this.profileObs$.next(profile);
  }

}
