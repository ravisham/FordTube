import { Directive, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLoadMoreTemplate], app-load-more-template',
  exportAs: 'loadMoreInstance'
})
export class LoadMoreDirective implements OnInit, OnDestroy {
  @Input()
  id: string;
  @Output()
  loadMoreEvent: EventEmitter<string> = new EventEmitter();

  constructor() {}

  ngOnDestroy(): void {}

  ngOnInit(): void {}

  @Output()
  loadMore() {
    this.loadMoreEvent.emit(this.id);
  }
}
