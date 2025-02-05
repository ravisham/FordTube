import { Pipe, PipeTransform } from '@angular/core';
import { isNull, isArray } from 'util';

@Pipe({
  name: 'fromArray'
})
export class FromArrayPipe implements PipeTransform {
  transform(value: Array<string>, args?: any): any {
    if (isNull(value) || !isArray(value)) {
      return value;
    }
    return value.join(', ');
  }
}
