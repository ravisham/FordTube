import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class SideNavService {
  private open = false;

  private subject = new Subject<boolean>();

  constructor() {}

  resetMenu() {
    this.open = false;
  }

  setToggleMenu(): void {
    this.open = !this.open;
    this.subject.next(this.open);
  }

  getToggleMenu(): Observable<any> {
    return this.subject.asObservable();
  }

  get isMenuOpen() {
    return this.open;
  }
}
