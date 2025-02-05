import { Directive, HostListener } from '@angular/core';
import { HeaderSearchService } from '../services/header-search.service';

@Directive({
  selector: '[appHeaderSearchClose]'
})
export class HeaderSearchCloseDirective {
  @HostListener('click', ['$event'])
  onClick($event) {
    if (this._headerSearchService.isSearchOpen) {
      this._headerSearchService.setToggleSearch();
    }
  }
  constructor(private _headerSearchService: HeaderSearchService) {}
}
