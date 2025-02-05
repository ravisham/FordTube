import { NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

/// <summary>
///   Takes a reference to NgZone and calls runOutsideAngular, giving it the observable we want to run outside Angular zone.
//    We also return the original subscription, so we can unsubscribe from it.
/// </summary>
export function outsideZone<T>(zone: NgZone) {

  return (source: Observable<T>) => {

    return new Observable(observer => {

      let subscription: Subscription;

      zone.runOutsideAngular(() => {
        subscription = source.subscribe(observer);
      });

      return subscription;
    });

  };

}
