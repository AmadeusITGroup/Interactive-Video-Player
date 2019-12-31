import {getCookie, setCookie} from './cookies';
import {Store} from '../enums';
import ConfigurationService from '../configuration/service';


/**
 * Get the value stored in the local storage under the given name
 * @param {string} name
* @return {string} 
 */
export function getLocalStorageValue(name) {
  try {
    return localStorage.getItem(name);
  } catch (e) {
    return null;
  }
}

/**
 * Store value in the local storage under the given name
 * @param {string} name
 * @param {string} value
 */
export function setLocalStorageValue(name, value) {
  try {
    localStorage.setItem(name, value);
  } catch (e) {
    console.error('Unable to store value', e);
  }
}

/**
 * Get the value stored in the session storage under the given name
 * @param {string} name
 * @return {string} 
 */
export function getSessionStorageValue(name) {
  try{
    return sessionStorage.getItem(name);
  } catch(e) {
    return null;
  }
}

/**
 * Store value in the session storage under the given name
 * @param {string} name
 * @param {string} value
 */
export function setSessionStorageValue(name, value) {
  try{
    sessionStorage.setItem(name, value);
  } catch(e) {} 
}
/**
 * Get the value stored in store under the given name
 * @param {number} store The name of the store
 * @param {string} name 
 * @return {string} 
 */
export function getKey(store, name) {
  switch (store) {
    case Store.COOKIE:
      return getCookie(name);
    case Store.LOCAL_STORAGE:
      return getLocalStorageValue(name);
    case Store.SESSION_STORAGE:
      return getSessionStorageValue(name);
    default:
      return null;
  }
}

/**
 * Store value in store under the given name. Adss an expriy date if applicable
 * @param {number} store The name of the store
 * @param {string} name
 * @param {string} value
 * @param {number} expDays
 * 
 */
export function setKey(store, name, value, expDays) {
  if (typeof value !== 'undefined' && value !== null) {
    switch (store) {
      case Store.COOKIE:
        setCookie(name, value, expDays);
        break;
      case Store.LOCAL_STORAGE:
        setLocalStorageValue(name, value);
        break;
      case Store.SESSION_STORAGE:
        setSessionStorageValue(name, value);
        break;
      default:
        break;
    }
  }
}

/**
 * Helper function that check if local storage is authorized by the browser
 * @return {boolean}
 * 
 */
export function isLocalStorageAuthorized(){
  try {
    setLocalStorageValue('tc-ls', true);
    return getLocalStorageValue('tc-ls');
  } catch(e) {
    return false;
  }
}

/**
 * Helper function that check if session storage is authorized by the browser
 * @return {boolean}
 */
export function isSessionStorageAuthorized(){
  setSessionStorageValue('tc-ls', 'true');
  return getSessionStorageValue('tc-ls') === 'true';
}

try {
  localStorage.setItem('localStorage', 1);
  localStorage.removeItem('localStorage');
} catch (e) {
  Storage.prototype._setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function() {};
  console.warn(
    'Your web browser does not support storing settings locally. In Safari, the most common cause of this is using "Private Browsing Mode". Some settings may not save or some features may not work properly for you.'
  );
}