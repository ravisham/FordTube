// cookie-utilities.ts

/**
 * @param cname    Cookie name
 * @returns {string} The cookie value.
 */
export function getCookie(cname: string): string {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**
 * @param name    Cookie name
 * @param value   Cookie value
 * @param expiresDate  Expiration date of the cookie.
 */
export function setCookie(name: string, value: string, expiresDate?: Date): void {
  let expires = '';
  if (expiresDate) {
    const date = new Date(expiresDate);
    expires = 'expires=' + date.toUTCString();
  }
  document.cookie = `${name}=${value}; ${expires}; SameSite=Lax;`;
}

/**
 * @param name    Cookie name
 */
export function removeCookie(name: string): void {
  setCookie(name, '', new Date('Thu, 01 Jan 1970 00:00:01 GMT'));
}

export function removeAllCookies(): void {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    removeCookie(cookies[i].split('=')[0]);
  }
}
