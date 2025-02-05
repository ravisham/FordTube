import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameNormalize'
})
export class NameNormalizePipe implements PipeTransform {
  transform(value: any): any {
    const withWslSplit = this.splitByWslNonWord(this.replaceNonWord(value, ' '));

    if (this.splitByWslNonWord(value).length <= 1 || value === 'Official Video') {
      return value;
    }

    if (withWslSplit.length >= 2) {
      return this.toProperCase(withWslSplit[0] + ' ' + withWslSplit[1]);
    }

    return value;
  }

  /**
   *
   *
   * @private
   * @param {string} str
   * @param {string} [replaceWith='']
   * @returns {string}
   * @memberof NameNormalizePipe
   */
  private replaceNonWord(str: string, replaceWith: string = ''): string {
    return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, replaceWith);
  }

  /**
   *
   *
   * @private
   * @param {string} str
   * @returns {string}
   * @memberof NameNormalizePipe
   */
  private toProperCase(str: string): string {
    return this.lowerCase(str).replace(/^\w|\s\w/g, this.upperCase);
  }

  /**
   *
   *
   * @private
   * @param {*} str
   * @returns {string}
   * @memberof NameNormalizePipe
   */
  private lowerCase(str: string): string {
    return str.toLowerCase();
  }

  /**
   *
   *
   * @private
   * @param {string} str
   * @returns {string[]}
   * @memberof NameNormalizePipe
   */
  private splitByWslNonWord(str: string): string[] {
    return str.split(/[\s,~]+/g);
  }

  /**
   *
   *
   * @private
   * @param {*} str
   * @returns {string}
   * @memberof NameNormalizePipe
   */
  private upperCase(str: string): string {
    return str.toUpperCase();
  }
}
