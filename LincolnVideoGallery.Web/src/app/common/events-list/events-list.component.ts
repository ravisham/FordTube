import { Component, OnInit } from '@angular/core';
import { EventModel } from '../../domain/interfaces/event.interface';
import { ActivatedRoute } from '@angular/router';
import { CalendarEventService } from '../calendar/services/calendar-event.service';
import { StripHtmlPipe } from '../pipes/strip-html/strip-html.pipe';
import { CalendarEventModel } from '../../domain/interfaces/calendarevent.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss'],
})
export class EventsListComponent implements OnInit {
  events: EventModel[];

  private docUrl: string;

  constructor(
    private route: ActivatedRoute,
    private calendarEventService: CalendarEventService,
    private stripHtmlPipe: StripHtmlPipe
  ) {
    this.docUrl = window.location.href || document.URL;
  }

  public getCalendarEvents = (
    eventItem: EventModel
  ): { google: string; yahoo: string } => {
    return this.calendarEventService.generateCalendars({
      duration: null,
      description: this.stripHtmlPipe.transform(eventItem.description),
      end: new Date(eventItem.endDate),
      start: new Date(eventItem.startDate),
      address: this.docUrl,
      title: this.stripHtmlPipe.transform(eventItem.title),
    });
  }

  public buildCalendarUrl(event: EventModel) {
    const calendarEvent: CalendarEventModel = {
      calendarName: null,
      version: '2.0',
      alarmDuration: '15',
      alarmRepeat: '2',
      alarmTrigger: '30',
      url: this.docUrl,
      startDateTime: event.startDate,
      endDateTime: event.endDate,
      description: event.description,
      location: this.docUrl,
      title: event.title,
    };

    const serialize = (obj: Object) => {
      const str = [];
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          str.push(
            encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop])
          );
        }
      }
      return str.join('&');
    };

    return `${environment.maApiUrl}api/events/download?${serialize(
      calendarEvent
    )}`;
  }

  ngOnInit() {
    this.route.data.subscribe((data: { events: EventModel[] }) => {
      this.events = data.events;
    });
  }
}
