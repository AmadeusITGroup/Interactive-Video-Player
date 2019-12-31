import { eraseCookie, getCookie, isCookieAuthorized, setCookie } from './cookies';
import { addClass, getElementBounding, htmlToElement, removeClass, style } from './dom';
import { debounce, dispatchEvent } from './events';
import { injectJSONLd } from './jsonld';
import languages from './languages';
import mapIcons from './map-icons';
import { getDefaultPOIConfiguration } from './marker';
import { getOrientation, isAndroidDevice, isiOSDevice, isMobile } from './mobile';
import { default as makeRequest, makeJSONp } from './network';
import { getAuthorizedStore, getToken, getTravelCastKeyName } from './security';
import { getKey, getLocalStorageValue, getSessionStorageValue, isLocalStorageAuthorized, isSessionStorageAuthorized, setKey, setLocalStorageValue, setSessionStorageValue } from './storage';
import uuid from './uuid';



export { mapIcons, makeRequest, makeJSONp, uuid, getCookie, setCookie, eraseCookie, getLocalStorageValue, setLocalStorageValue, setSessionStorageValue, getSessionStorageValue, isMobile, isiOSDevice, isAndroidDevice, isLocalStorageAuthorized, isCookieAuthorized, isSessionStorageAuthorized, getTravelCastKeyName, getAuthorizedStore, languages, htmlToElement, getKey, setKey, style, getElementBounding, addClass, removeClass, getToken, dispatchEvent, debounce, getOrientation, getDefaultPOIConfiguration as getDefaultConfiguration, injectJSONLd };

