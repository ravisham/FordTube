import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class SQLNgbDateAdapter<D> {
  fromModel(value: D): NgbDateStruct {
    if (!value) {
      return;
    }

    const dateParts = value
      .toString()
      .trim()
      .split('-');

    const year = parseInt(dateParts[0], 10);
    const day = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10);

    return {
      day,
      year,
      month
    };
  }

  toModel(date: NgbDateStruct) {
    return date && date.year && date.month && date.day ? date.year + '-' + date.month + '-' + date.day : null;
  }
}
