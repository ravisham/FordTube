import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'util';
import { map } from 'lodash';

@Pipe({
  name: 'toArray'
})
export class ToArrayPipe implements PipeTransform {
  transform(value: string, args?: any): any {
    if (isNull(value) || typeof value !== 'string') {
      return value;
    }
    return map(value.split(', '));
  }
}
