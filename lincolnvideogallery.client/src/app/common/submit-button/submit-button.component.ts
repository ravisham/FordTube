import { Component, OnInit, ChangeDetectionStrategy, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitButtonComponent implements OnInit {

  private _loadingIconClass: string = '';

  private _iconClass: string = '';

  @Input()
  cssClass: string = '';

  @Input()
  isLoading: boolean = false;

  @Input()
  text: string = '';

  @Input()
  iconClass: string = '';

  @Input()
  loadingIconClass: string = '';

  constructor() { }

  ngOnInit() {
  }

}
