import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: any, removeMilliseconds: boolean = true): any {
    if (!value) {
      return;
    }

    if (value.indexOf(':') === -1) {
      return value;
    }

    if (removeMilliseconds) {
      const n = value.indexOf('.');
      value = value.substring(0, n !== -1 ? n : value.length);
    }

    const durationParts = value.split(':');

    const hours = durationParts[0];
    const minutes = durationParts[1] === '00' ? '0' : durationParts[1];
    const seconds = durationParts[2];

    return hours === '00' ? minutes + ':' + seconds : hours + ':' + minutes + ':' + seconds;
  }
}
