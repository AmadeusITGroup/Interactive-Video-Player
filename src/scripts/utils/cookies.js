import ConfigurationService from '../configuration/service';

/**
 * Get a cookie by its name
 * @param {string | null} cname The cookie name to retrieve
 */
export function getCookie(cname) {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0)==' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length,c.length);
      }
  }
  return null;
}

/**
 * Set a cookie
 * @param {string} cname The cookie to set
 * @param {string} cvalue The value to associate to this cookie
 * @param {number} exdays Expiry date express in days 
 */
export function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  const expires = 'expires='+ d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

/**
 * Erase a cookie
 * @param {string} name The cookie name to erase
 */
export function eraseCookie(name) {
    setCookie(name,'',-1);
}

/**
 * A helper function that's check if cookies are authorized by the browser.
 * This function will try to set a cookie and excpect to read the same value back.
 */
export function isCookieAuthorized(){
  setCookie('tc-ck', 'true', 1);
  const val = getCookie('tc-ck');
  return val === 'true';
}

