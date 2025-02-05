/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CalendarEventService } from './calendar-event.service';

describe('Service: CalendarEventService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalendarEventService]
    });
  });

  it('should ...', inject([CalendarEventService], (service: CalendarEventService) => {
    expect(service).toBeTruthy();
  }));
});
