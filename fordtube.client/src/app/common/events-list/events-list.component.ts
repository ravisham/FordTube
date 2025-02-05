import { Component, OnInit } from '@angular/core';
import { EventModel } from '../../domain/interfaces/event.interface';
import { ActivatedRoute } from '@angular/router';
import { CalendarEventService } from '../calendar/services/calendar-event.service';
import { StripHtmlPipe } from '../pipes/strip-html/strip-html.pipe';
import { CalendarEventModel } from '../../domain/interfaces/calendarevent.interface';
import { environment } from '../../../environments/environment';
import { EventsService } from '../../domain/services/events.service';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss'],
})
export class EventsListComponent implements OnInit {

  events: EventModel[];
  fileUrl;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly eventsService: EventsService,
    private readonly calendarEventService: CalendarEventService,
    private readonly stripHtmlPipe: StripHtmlPipe
  ) { }

  getCalendarEvents = (
    eventItem: EventModel
  ): { google: string; yahoo: string } => {
    return this.calendarEventService.generateCalendars({
      duration: 0,
      description: this.stripHtmlPipe.transform(eventItem.description),
      end: new Date(eventItem.endDate),
      start: new Date(eventItem.startDate),
      address: eventItem.eventUrl,
      title: this.stripHtmlPipe.transform(eventItem.title),
    });
  };

  buildCalendarUrl(event: EventModel) {
    const calendarEvent: CalendarEventModel = {
      calendarName: '',
      version: '2.0',
      alarmDuration: '15',
      alarmRepeat: '2',
      alarmTrigger: '30',
      url: event.eventUrl,
      startDateTime: new Date(event.startDate),
      endDateTime: new Date(event.endDate),
      description: event.description,
      location: event.eventUrl,
      title: event.title,
    };

    const serialize = (obj: { [key: string]: any }) => {
      const str = [];
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          str.push(
            (encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop])) as any
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
    this.route.data.subscribe((data) => {
      this.events = data.events.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate)
      }));
    });
  }

  getEventData(event: EventModel) {
    const calendarEvent: CalendarEventModel = {
      calendarName: '',
      version: '2.0',
      alarmDuration: '15',
      alarmRepeat: '2',
      alarmTrigger: '30',
      url: event.eventUrl,
      startDateTime: new Date(event.startDate),
      endDateTime: new Date(event.endDate),
      description: event.description,
      location: event.eventUrl,
      title: event.title,
    };

    this.eventsService.download(calendarEvent).subscribe(data => {
      const filename = 'Event.ics';
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob([data], { type: ' text/calendar' }));
      downloadLink.setAttribute('download', filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    });
  }
}
