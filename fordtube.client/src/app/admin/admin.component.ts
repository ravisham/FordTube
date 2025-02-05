import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ActivationStart } from '@angular/router';
import { environment } from '../../environments/environment';
import { filter } from 'rxjs/operators';
import { VideoService } from '../domain/services/video.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  pageTitle = 'Admin Tools';
  environment = environment;
  totalCount = 0;

  constructor(private router: Router, private route: ActivatedRoute, private videosService: VideoService) {
    const routerEvents = this.router.events;

    routerEvents.pipe(filter(activationEvent => activationEvent instanceof ActivationStart)).subscribe((event: any) => {
      this.pageTitle =
        event.hasOwnProperty('snapshot') && event.snapshot.hasOwnProperty('data') && event.snapshot.data.hasOwnProperty('title')
          ? event.snapshot.data['title']
          : 'Admin Tools';
    });
  }

  ngOnInit() {
    this.videosService.videosCount().subscribe(result => (this.totalCount = result), error => console.log('Error: ', error));
  }
}
