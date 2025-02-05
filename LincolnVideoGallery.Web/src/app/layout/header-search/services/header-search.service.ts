import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class HeaderSearchService {
  constructor() {}

  private open = false;

  private subject = new Subject<boolean>();

  resetSearch() {
    this.open = false;
  }

  setToggleSearch(): void {
    this.open = !this.open;
    this.subject.next(this.open);
  }

  getToggleSearch(): Observable<any> {
    return this.subject.asObservable();
  }

  get isSearchOpen() {
    return this.open;
  }
}
