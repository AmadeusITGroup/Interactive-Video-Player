import ApiManager from './api/manager';

import { default as makeRequest, makeJSONp } from './utils/network';
import ConfigurationService from './configuration/service';
import Environememnt from './enums/environment';

/**
 * A service in charge of getting user related information such as location, currency, closest airport etc...
 */
export class UserDataService {
  constructor() {
    this.data = {
      initialized : false,
      airport: '...',
      airportCode: '-',
      countryCode : null,
      currencyCode: 'EUR',
      currencySymbol : '€',
      city: '-',
      latitude: null,
      longitude: null,
      geolocationon: false
    };
    this.registeredCallbacks = [];
    this._initialized = false;
  }

  /**
   * Initilaze the service 
   */
  intialize () {
    const finallyFn = () => {
      this.data.initialized = true;
      this.registeredCallbacks.forEach(fn => fn(this.data));
      this.registeredCallbacks = [];
    }; 
    this.getGeolocation()
      .then(() => ApiManager.getCurrency(this.data.countryCode))
      .then(res => {
        const geoData = res.response;
        if (geoData.status === 'ok') {
          this.data.currencyCode = geoData.details.currency_code;
          this.data.currencySymbol = geoData.details.symbol;
        } else {
          console.warn(geoData.message);
          this.data.currencyCode = 'EUR';
          this.data.currencySymbol = '€';
        }
        finallyFn();
      }).catch(() => {
        this.data.currencyCode = 'EUR';
        this.data.currencySymbol = '€';
        finallyFn();
      });
  }

  /**
   * Request the location of the user. This function will first start with a call to ipstack services before 
   * fallbacking to navigator.geolocation in case of error
   */
  getGeolocation() {
    return new Promise((resolve, reject) => {
      const p = makeJSONp(`https://api.ipstack.com/check?access_key=${ConfigurationService.getValue(Environememnt.IP_STACK_API_KEY)}&format=1`);
      const getNearestAirport = (lat, lng) => {
        ApiManager.getNearestAirport(lat, lng).then(data => {
          const obj = data.response;
          this.data.city = obj[0].city_name;
          this.data.airport = obj[0].airport_name;
          this.data.airportCode = obj[0].airport;
          resolve(this.data);
        }).catch((err) => {
          reject(err);
        });
      };
      const fallback = () => {
        const success = (position) => {
          this.data.latitude = position.coords.latitude;
          this.data.longitude = position.coords.longitude;
          this.data.countryCode = 'FR'; // Fallback to france to ensure currency will be EUR.
          this.data.geolocation = true;
          getNearestAirport(this.data.latitude, this.data.longitude);
        };
        const error = (error) => {
          reject(error);
        };
        navigator.geolocation.getCurrentPosition(success, error);
        
      };
      p.then(data => {
        if(!data.error) {
          this.data.latitude = data.latitude;
          this.data.longitude = data.longitude;
          this.data.geolocation = true;
          this.data.countryCode = data.country_code;
          getNearestAirport(this.data.latitude, this.data.longitude);
        } else {
          fallback();
        }
      }).catch(() => {
        fallback();
      });
      
    });
  }

  /**
   * Bind a listener to the service's ready state. If service has already been initialized it will trigger the function immediately.
   * @param {Function} fn A callback to excecute once service is ready
   */
  ready(fn) {
    if(this.data.initialized) {
      fn();
    } else {
      this.registeredCallbacks.push(fn);
      //First ready call will be in charge of boostraping the initialization
      //consecutive calls will register their callback to the reasy state
      if(!this._initialized) {
        this.intialize();
        this._initialized = true;
      }
    }
  }
}

export default new UserDataService();
