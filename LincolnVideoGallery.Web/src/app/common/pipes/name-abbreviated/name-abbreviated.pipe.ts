import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'util';
import { capitalize } from 'lodash';

@Pipe({
  name: 'nameAbbreviated'
})
export class NameAbbreviatedPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (isNull(value) || isNull(value.split(' ')[0]) || isNull(value.split(' ')[1])) {
      return value;
    }
    const firstName = value.split(' ')[0];
    const lastName = value.split(' ')[1];

    return `${capitalize(firstName[0])}. ${capitalize(lastName)}`;
  }
}
