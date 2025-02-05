import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy',
  pure: true
})
export class SortByPipe implements PipeTransform {
  static isString(value: any) {
    return typeof value === 'string' || value instanceof String;
  }

  static isDate(value: any): boolean {
    return value instanceof Date || Object.prototype.toString.call(value) === '[object Date]' || !isNaN(Date.parse(value));
  }

  static caseInsensitiveSort(a: any, b: any) {
    if (SortByPipe.isString(a) && SortByPipe.isString(b)) {
      if (SortByPipe.isDate(a) && SortByPipe.isDate(b)) {
        return new Date(a) > new Date(b) ? -1 : 1;
      }
      return a.localeCompare(b);
    }
    return SortByPipe.defaultCompare(a, b);
  }

  static defaultCompare(a: any, b: any) {
    if (SortByPipe.isDate(a) && SortByPipe.isDate(b)) {
      return new Date(a) > new Date(b) ? -1 : 1;
    }
    // Check if both are boolean
    if (typeof a === typeof true && typeof b === typeof true) {
      return a > b ? -1 : 1;
    }
    if (a === b) {
      return 0;
    }
    if (a == null) {
      return 1;
    }
    if (b == null) {
      return -1;
    }

    return a > b ? 1 : -1;
  }

  static parseExpression(expression: string): string[] {
    expression = expression.replace(/\[(\w+)\]/g, '.$1');
    expression = expression.replace(/^\./, '');
    return expression.split('.');
  }

  static getValue(object: any, expression: string[]) {
    for (let i = 0, n = expression.length; i < n; ++i) {
      const k = expression[i];
      if (!(k in object)) {
        return;
      }
      object = object[k];
    }

    return object;
  }

  static setValue(object: any, value: any, expression: string[]) {
    let i;
    for (i = 0; i < expression.length - 1; i++) {
      object = object[expression[i]];
    }

    object[expression[i]] = value;
  }

  transform(value: any | any[], expression?: any, reverse?: boolean, isCaseInsensitive: boolean = false, comparator?: Function): any {
    if (!value) {
      return value;
    }

    if (Array.isArray(expression)) {
      return this.multiExpressionTransform(value, expression, reverse, isCaseInsensitive, comparator);
    }

    if (Array.isArray(value)) {
      return this.sortArray(value.slice(), expression, reverse, isCaseInsensitive, comparator);
    }

    if (typeof value === 'object') {
      return this.transformObject(Object.assign({}, value), expression, reverse, isCaseInsensitive, comparator);
    }

    return value;
  }

  private sortArray(value: any[], expression?: any, reverse?: boolean, isCaseInsensitive?: boolean, comparator?: Function): any[] {
    const isDeepLink = expression && expression.indexOf('.') !== -1;

    if (isDeepLink) {
      expression = SortByPipe.parseExpression(expression);
    }

    let compareFn: Function;

    if (comparator && typeof comparator === 'function') {
      compareFn = comparator;
    } else {
      compareFn = isCaseInsensitive ? SortByPipe.caseInsensitiveSort : SortByPipe.defaultCompare;
    }

    const array: any[] = value.sort(
      (a: any, b: any): number => {
        if (!expression) {
          return compareFn(a, b);
        }

        if (!isDeepLink) {
          if (a && b) {
            return compareFn(a[expression], b[expression]);
          }
          return compareFn(a, b);
        }

        return compareFn(SortByPipe.getValue(a, expression), SortByPipe.getValue(b, expression));
      }
    );

    if (reverse) {
      return array.reverse();
    }

    return array;
  }

  private transformObject(value: any | any[], expression?: any, reverse?: boolean, isCaseInsensitive?: boolean, comparator?: Function): any {
    const parsedExpression = SortByPipe.parseExpression(expression);
    let lastPredicate = parsedExpression.pop();
    let oldValue = SortByPipe.getValue(value, parsedExpression);

    if (!Array.isArray(oldValue)) {
      parsedExpression.push(lastPredicate);
      lastPredicate = null;
      oldValue = SortByPipe.getValue(value, parsedExpression);
    }

    if (!oldValue) {
      return value;
    }

    SortByPipe.setValue(value, this.transform(oldValue, lastPredicate, reverse, isCaseInsensitive), parsedExpression);
    return value;
  }

  private multiExpressionTransform(value: any, expressions: any[], reverse: boolean, isCaseInsensitive: boolean = false, comparator?: Function): any {
    return expressions.reverse().reduce((result: any, expression: any) => {
      return this.transform(result, expression, reverse, isCaseInsensitive, comparator);
    }, value);
  }
}
