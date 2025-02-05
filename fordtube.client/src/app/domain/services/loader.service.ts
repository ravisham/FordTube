import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public _loaderVisibility = new BehaviorSubject(false);
  loaderVisibility = this._loaderVisibility.asObservable();
  public loading$ = new BehaviorSubject(false);
  constructor() { }

  show() {
    this._loaderVisibility.next(true);
  }

  hide() {
    this._loaderVisibility.next(false);
  }
}
