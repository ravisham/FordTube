import { getCookie } from './cookie-utilities';

/**
 *
 *
 * @returns {boolean}
 */
function isFordEmployeeOrInternal(): boolean {

  const knownEmployeeOrInternalPaCode = ['FNAMR', 'IT', 'MKS', 'RETHQ', 'FAPAC'];

  const currentPaCode = getCookie('pacode');

  const isAdminPaCode = knownEmployeeOrInternalPaCode.includes(currentPaCode);

  return isAdminPaCode;
}

/**
 *
 *
 * @param {string} str
 * @param {string} [replaceWith='']
 * @returns {string}
 * @memberof NameNormalizePipe
 */
function replaceNonWord(str: string, replaceWith: string = ''): string {
  return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, replaceWith);
}

/**
 *
 *
 * @param {string} str
 * @returns {string}
 * @memberof NameNormalizePipe
 */
function toProperCase(str: string): string {
  return lowerCase(str).replace(/^\w|\s\w/g, upperCase);
}

/**
 *
 *
 * @param {*} str
 * @returns {string}
 * @memberof NameNormalizePipe
 */
function lowerCase(str: any): string {
  return str.toLowerCase();
}


/**
 *
 *
 * @param {*} str
 * @returns {string}
 * @memberof NameNormalizePipe
 */
function upperCase(str: any): string {
  return str.toUpperCase();
}


/**
 *
 *
 * @returns {string}
 */
export function getFirstName(): string {
  if (isFordEmployeeOrInternal()) {
    return 'Ford';
  }
  return getCookie('givenName') || null;
}


/**
 *
 *
 * @returns {string}
 */
export function getLastName(): string {
  if (isFordEmployeeOrInternal()) {
    return 'User';
  }
  return getCookie('sn') || null;
}
