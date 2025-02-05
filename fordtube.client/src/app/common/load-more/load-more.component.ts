import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-load-more',
  templateUrl: './load-more.component.html',
  styleUrls: ['./load-more.component.scss']
})
export class LoadMoreComponent {
  @Input()
  id: string;
  @Output()
  loadMoreEvent = new EventEmitter<string>();
}
