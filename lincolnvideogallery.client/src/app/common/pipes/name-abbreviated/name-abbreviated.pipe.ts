import { Pipe, PipeTransform } from '@angular/core';
import { isNull } from 'util';
import { capitalize } from 'lodash';

@Pipe({
  name: 'nameAbbreviated'
})
export class NameAbbreviatedPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value === null || value.split(' ')[0] === null || value.split(' ')[1] === null) {
      return value;
    }
    const firstName = value.split(' ')[0];
    const lastName = value.split(' ')[1];

    return `${capitalize(firstName[0])}. ${capitalize(lastName)}`;
  }
}
