import { OnInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventModel } from 'src/app/domain/interfaces/event.interface';

@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.scss'],
})
export class LiveComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  events: EventModel[] = [];

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.events = data['events'];
    });
  }
}
