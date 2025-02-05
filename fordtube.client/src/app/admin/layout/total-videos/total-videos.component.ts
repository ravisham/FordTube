import { Component, OnInit } from '@angular/core';
import { ActivationStart, Router } from '@angular/router';
import { VideoService } from 'src/app/domain/services/video.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-total-videos',
  templateUrl: './total-videos.component.html',
  styleUrls: ['./total-videos.component.scss']
})
export class TotalVideosComponent implements OnInit {
  pageTitle: any;
  totalCount: 0;

  constructor(
    private router: Router,
    private videosService: VideoService
  ) {
    const routerEvents = this.router.events;

    routerEvents
      .pipe(
        filter(
          (activationEvent: any) => activationEvent instanceof ActivationStart
        )
      )
      .subscribe(() => {
        this.videosService.videosCount().subscribe(result => {
          if (this.totalCount === 0 && result !== null) {
            this.totalCount = result;
          }
        });
      });
  }

  ngOnInit() {
    this.videosService.videosCount().subscribe(
      result => (this.totalCount = result)
    );
  }
}
