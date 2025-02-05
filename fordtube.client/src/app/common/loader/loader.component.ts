import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../domain/services/loader.service';

@Component({
  selector: 'fordloader',
  templateUrl: './loader.component.html',
})
export class LoaderComponent implements OnInit {
  public loading$;
  show: boolean;
  constructor(private loaderService: LoaderService) {
    this.loading$ = this.loaderService.loading$;
    //this.loading$ = true;
  }

  ngOnInit() {
  }

}
