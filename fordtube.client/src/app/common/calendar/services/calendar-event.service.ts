import { Injectable } from '@angular/core';
import { CalendarEvent } from '../interfaces/calendar-event.interface';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventService {
  constructor(private datePipe: DatePipe) { }

  MS_IN_MINUTES = 60 * 1000;

  private calendarGenerators = {
    google: (event: CalendarEvent) => {
      const startTime = this.formatTime(new Date(event.start));
      const endTime = this.calculateEndTime(event);

      const href = [
          'https://www.google.com/calendar/render',
          '?action=TEMPLATE',
          '&text=' + encodeURIComponent(event.title || ''),
          '&dates=' + (startTime || ''),
          '/' + (endTime || ''),
          '&details=' + encodeURIComponent(event.address + '\r\n' + event.description),
          '&location=' + encodeURIComponent(event.address),
        '&sprop=website:' + encodeURIComponent(event.address),
        '&sprop=name:' + encodeURIComponent(event.title || document.title)
        ].join('');

      return href;
    },

    yahoo: (event: CalendarEvent) => {
      const eventDuration = event.end
        ? (new Date(event.end).getTime() - new Date(event.start).getTime()) / this.MS_IN_MINUTES
        : event.duration;

      // Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm
      const yahooHourDuration =
        eventDuration < 600
          ? '0' + Math.floor(eventDuration / 60)
          : Math.floor(eventDuration / 60) + '';

      const yahooMinuteDuration =
        eventDuration % 60 < 10
          ? '0' + (eventDuration % 60)
          : (eventDuration % 60) + '';

      const yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

      // Remove timezone from event time
      const st =
        this.formatTime(
          new Date(
            new Date(event.start).getTime() -
            new Date(event.start).getTimezoneOffset() * this.MS_IN_MINUTES
          )
        ).slice(0, -1) || '';

      const href = encodeURI(
        [
          'http://calendar.yahoo.com/?v=60&view=d&type=21',
          '&title=' + encodeURIComponent(event.title || ''),
          '&st=' + st,
          '&dur=' + yahooEventDuration,
          '&desc=' + encodeURIComponent(event.address + '\r\n' + event.description),
          '&url=' + encodeURIComponent(event.address),
          '&in_loc=' + encodeURIComponent(event.address)
        ].join('')
      );

      return href;
    },
  };

  private formatTime = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }

  private calculateEndTime = (event: CalendarEvent) => {
    return event.end
      ? this.formatTime(new Date(event.end))
      : this.formatTime(
        new Date(new Date(event.start).getTime() + event.duration * this.MS_IN_MINUTES)
      );
  }

  public generateCalendars = (
    event: CalendarEvent
  ): { google: string; yahoo: string } => {
    return {
      google: this.calendarGenerators.google(event),
      yahoo: this.calendarGenerators.yahoo(event),
    };
  }
}
