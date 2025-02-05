import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { EventModel } from '../../../../domain/interfaces/event.interface';
import { EventsService } from '../../../../domain/services/events.service';

@Injectable({
  providedIn: 'root'
})
export class EventsListResolverService implements Resolve<EventModel[]> {
  constructor(private eventsService: EventsService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<EventModel[]> {
    return this.eventsService.list().pipe(response => response);
  }
}
