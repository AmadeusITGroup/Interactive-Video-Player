import {isCookieAuthorized} from './cookies';
import {getKey, isLocalStorageAuthorized, isSessionStorageAuthorized} from './storage';
import {Store} from '../enums';
 
/**
 * Get the authorization key name base on environement
 * @param {number} store The name of the store to use
 */
export function getTravelCastKeyName(store){
  let env = getKey(store, 'tc-env');
  if(env) {
    env = `-${env}`; // it will be named tc-cookie-<environement>
  } else
    env = ''; // it will be named tc-cookie
  return `tc-cookie${env}`;
}

/**
 * Get the store that is authorized by the browser (among cookies, local storage, session storage)
 * @return {number} A number representing the store see enums/store.js
 */
export function getAuthorizedStore(){
  let store = Store.NONE;
  if (isCookieAuthorized()){
    store = Store.COOKIE;
  } else if (isLocalStorageAuthorized()){
    store = Store.LOCAL_STORAGE;
  } else if( isSessionStorageAuthorized()){
    store = Store.SESSION_STORAGE;
  } else {
    store = Store.NONE;
  }
  return store;
}

/**
 * Get the authorization token
 */
export function getToken() {
  return getKey(getAuthorizedStore(), getTravelCastKeyName(getAuthorizedStore()));
}