import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { HeaderSearchService } from './services/header-search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-search',
  templateUrl: './header-search.component.html',
  styleUrls: ['./header-search.component.scss'],
  animations: [
    trigger('transform', [
      state(
        'open',
        style({
          transform: 'translate3d(0, 0, 0)',
          visibility: 'visible'
        })
      ),
      state(
        'void',
        style({
          visibility: 'hidden'
        })
      ),
      transition('void <=> open', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ]
})
export class HeaderSearchComponent implements OnInit {
  state = 'void';

  query: string;

  @ViewChild('headerSearchInput', { static: false }) headerSearchInput: ElementRef;

  @HostBinding('@transform')
  get toggleState() {
    this.focusInput();
    return this.state;
  }

  constructor(private headerSearchService: HeaderSearchService, private router: Router, private elemRef: ElementRef) {}

  toggleSearch() {
    this.headerSearchService.setToggleSearch();
  }

  focusInput() {
    if (this.state === 'open') {
      this.headerSearchInput.nativeElement.focus();
    } else {
      this.query = null;
    }
  }

  searchPressed() {
    this.router.navigate(['/search'], { queryParams: { q: this.query } });
    this.state = 'void';
    this.query = null;
  }

  ngOnInit() {
    this.headerSearchService.getToggleSearch().subscribe((open: boolean) => {
      if (open) {
        this.state = 'open';
      }
      if (!open) {
        this.state = 'void';
      }
    });
  }
}
