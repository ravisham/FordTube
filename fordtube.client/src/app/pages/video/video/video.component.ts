import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from '../../../domain/services/video.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  constructor(private router: Router, private currentRoute: ActivatedRoute, private videoService: VideoService) {}

  ngOnInit() {
    const id = this.currentRoute.snapshot.queryParamMap.get('video_key');
    if (id) {
      this.videoService.getId(id).subscribe(
        result => {
          if (result) {
            this.router.navigate(['/watch'], { queryParams: { v: result } });
          } else {
            this.router.navigate(['/']);
          }
        },
        error => console.log(`Error: ${error}`)
      );
    } else {
      this.router.navigate(['/']);
    }
  }
}
