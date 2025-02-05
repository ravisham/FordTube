import { Directive, HostListener } from '@angular/core';
import { SideNavService } from '../services/side-nav.service';

@Directive({
  selector: '[appSideNavClose]'
})
export class SideNavCloseDirective {
  @HostListener('click', ['$event'])
  onClick($event) {
    if (this._sideNavService.isMenuOpen) {
      this._sideNavService.setToggleMenu();
    }
  }
  constructor(private _sideNavService: SideNavService) {}
}
