import ConfigurationService from "../configuration/service";
import user from "../user";
import makeRequest from "../utils/network";

import { getLocalStorageValue, getKey } from "../utils/storage";
import { Profile, Network, Environment } from "../enums";
import { getToken } from "../utils/security";

import {Events} from "../events/list";
import EventService from "../events/service";

export const ApiManagerCache = {
  Places : 'places',
  POIs : 'pois'
};

/**
 * A wrapper to Amadeus Video Solutions API. 
 * Swagger documentation of the API can be found at :
 * https://www.amadeus-video-solutions.com/api/swagger/index.html
 */
export class ApiManager {
  constructor() {
    this.authProfile = getLocalStorageValue("auth_profile") || "0";
    this.prefix = this.authProfile === Profile.ADMIN ? "admin" : "restricted";

    this.registeredPromises = {};
    this.places = {};
    this.pois = {};
  }

  /**@ignore */
  get base() {
    return `${this.server}/api/${this.prefix}`;
  }

  /**@ignore */
  get server() {
    let value = ConfigurationService.getValue(Environment.MAIN_SERVER);
    if(typeof value === 'undefined' || value === null || value === 'null' ) {
      value = '';
    }
    return value;
  }

  /**
   * Registers a new session.
   * @return {Promise<any>}
   */
  createSession() {
    const options = {
      method: Network.POST,
      url: `${this.server}/api/session`,
      params: {},
      body: {
        api_key: ConfigurationService.getValue(Environment.API_KEY)
      },
      headers: {
        "Content-Type": "application/json"
      },
      json : true
    };
    return makeRequest(options);
  }

  /**
   * Convert a value from a currency to another
   * @param {string} from 
   * @param {string} to 
   * @param {number} value 
   * @return {Promise<any>}
   */
  convertCurrency(from, to, value) {
    from = from || "EUR";
    let options = {
      url: `${
        this.server
      }/api/currency/convert/${from.toUpperCase()}/${to.toUpperCase()}/${value}`,
      method: Network.GET,
      json : true
    };
    return makeRequest(options);
  }

  /**
   * Retrieve the most relevant airport from GPS coordinates 
   * @param {Coordinates} opts 
   * @return {Promise<any>}
   */
  getAirportDetailsByLocation(opts) {
    return new Promise((resolve, reject) => {
      let options = {
        url:  `${this.server}/api/airport/${opts.lat}/${opts.lng}`,
        method: Network.GET,
        json: true
      };
      return makeRequest(options).then(res => {
        resolve(res.response);
      })
      .catch(() => {
        reject(arguments);
      });
    });
  }
  
  /**
   * Get the details of a currency given its code
   * @param {string} code 
   * @return {Promise<any>}
   */
  getCurrency(code) {
    const options = {
      method: Network.GET,
      url: `${this.server}/api/currency/for/${code}`,
      params: {},
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      json : true
    };

    return makeRequest(options);
  }

  /**
   * Returns the lowest flight fare for the given origin destination for the given month.
   * You may want to configure a different search engine through the params object such as follow.
   * {
   *   engine : The search engine to use, skyscanner or tamc
   *   airlines : A set of airline code
   * }
   * @param {string} origin 
   * @param {string} destination 
   * @param {string} month 
   * @param {any} params 
   * @return {Promise<any>}
   */
  getFares(origin, destination, month, params) {
    return new Promise((resolve, reject) => {
      let options = {
        method : Network.GET,
        url : `${this.server}/api/fares/${origin}/${destination}/${month}`,
        json : true
      };

      params = params || {};
      params.currency = user.data.currencyCode;
      options.params = params;

      let p = null;
      if (month) {
        p = makeRequest(options);
      } else {
        options.url = `${this.server}/api/fares/${origin}/${destination}`;
        p = makeRequest(options);
      }
      p.then(res => {
        const data = res.response;
        if (data.fares) {
          const sorted = data.fares.sort((a, b) => (a.amount > b.amount ? 1 : -1));
          const formtd = sorted.map(function(a) {
            return {
              depdate: a.depdate,
              retdate: a.retdate,
              amount: a.amount,
              deeplink: a.deep_link
            };
          });
          resolve(formtd);
        } else {
          reject('Unable to retrive fares');
        }
      })
      .catch(() => reject('Unable to retrive fares'));
    });
  }

  /**
   * Get geographic data, throught budgetyourtrip API, given a Google Place ID.
   * @param {string} id A google place id
   * @return {Promise<any>}
   */
  getGeodataFromID(id) {
    let options = {
      url: `${this.server}/api/geodata/${id}`,
      method: Network.GET,
      json: true
    };
    return makeRequest(options);
  }

  /**
   * Get the lowest price of a room for the given property for the stay 
   * @param {string} hotelID An Amadeus property code
   * @param {string} cidate Check-in date, format YYYY-MM-DD
   * @param {string} codate Check-out date, format YYYY-MM-DD
   * @return {Promise<any>}
   */
  getHotelsByID(hotelID, cidate, codate) {
    let options = {
      url: `${this.server}/api/hotels/${hotelID}/${cidate}/${codate}`,
      method: Network.GET,
      currency: user.data.currencyCode,
      json:true
    };
    return makeRequest(options);
  }

  /**
   * Get the most relevant aiport for GPS coordinates
   * @param {number | string} lat Latitue
   * @param {number | string} lng Longitude
   * @return {Promise<any>}
   */
  getNearestAirport(lat, lng) {
    const options = {
      method: Network.GET,
      url: `${this.server}/api/airport/${lat}/${lng}`,
      headers: {
        "Content-Type": "application/json"
      },
      json:true
    };
    return makeRequest(options);
  }

  /**
   * Perform a Google Place ID lookup. See https://developers.google.com/places/place-id
   * @param {string} id A Google Place Id 
   * @return {Promise<any>}
   */
  getPlace(id) {
    if(this.registeredPromises.hasOwnProperty[id] && this.registeredPromises[id] !== null) {
      return this.registeredPromises[id];
    } else {
      let p = new Promise((resolve, reject) => {
        if (this.places.hasOwnProperty(id)) {
          resolve(this.places[id]);
          this.registeredPromises[id] = null;
        } else if(!id || !id.length){
          reject( 'Unable to retrieve place');
        } else {
          const options = {
            method: Network.GET,
            url: `${this.base}/place/${id}`,
            params: {},
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              authorization: `Bearer ${getToken()}`
            },
            json : true
          };
          makeRequest(options)
            .then(res => {
              const data = res.response;
              if (data.status.toUpperCase() === "OK") {
                this.places[id] = data.result;
                resolve(this.places[id]);
                this.registeredPromises[id] = null;

              } else {
                reject(data);
                this.registeredPromises[id] = null;

              }
            })
            .catch(() => {
              reject(arguments);
              this.registeredPromises[id] = null;
            });
        }
      });
      this.registeredPromises[id] = p;
      return p;
    }
  }

  /**
   * Search for a Point Of Interest in Amadeus backend.
   * @param {string} id A POI Id 
   * @return {Promise<any>}
   */
  getPOI(id) {
    if(this.registeredPromises.hasOwnProperty[id] && this.registeredPromises[id] !== null) {
      return this.registeredPromises[id];
    } else {
      let p = new Promise((resolve, reject) => {
        if (this.pois.hasOwnProperty(id)) {
          resolve(this.pois[id]);
          this.registeredPromises[id] = null;
        } else {
          const options = {
            method: Network.GET,
            url: `${this.base}/limitedpois`,
            params: {},
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              authorization: `Bearer ${getToken()}`
            },
            json : true
          };
          options.params._id = id;

          makeRequest(options)
            .then(res => {
              const data = res.response; 
              this.pois[id] = data.filter(poi => poi.id === id)[0];
              resolve(this.pois[id]);
              this.registeredPromises[id] = null;
            })
            .catch(() => {
              reject(arguments);
              this.registeredPromises[id] = null;
            });
        }
      });
      this.registeredPromises[id] = p;
      return p;
    }

  }

  /**
   * Get the producer details
   * @param {string} producerID An Amadeus Video Solutions user id
   * @return {Promise<any>}
   */
  getProducer(producerID) {
    const options = {
      method: Network.GET,
      url: `${this.server}/api/user/${producerID}`,
      params: {},
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization: `Bearer ${getToken()}`
      },
      json : true
    };

    return makeRequest(options);
  }

  /**
   * Get the SASS skin variable i.e a map of key/CSS value for all skin properties
   * @param {string} skin the name of the skin 
   * @return {Promise<any>}
   */
  getSkin(skin) {
    const options = {
      method: "GET",
      url: `https://storage.googleapis.com/travelcast/styles/_${skin}.scss?t=${Date.now()}`,
      params: {},
      headers: {
        "Content-Type": "application/json"
      }
    };

    return makeRequest(options);
  }

  /**
   * Get an Amadeus Video Solutions video
   * @param {string} id 
   * @return {Promise<any>}
   */
  getVideo(id) {
    const options = {
      method: Network.GET,
      url: `${this.base}/video/${id}`,
      headers: {
        authorization: `Bearer ${getToken()}`
      },
      json : true
    };
    return makeRequest(options);
  }

  /**
   * Get the first Amadeus Video Solutions video that matches given paramters 
   * @param {any} params 
   * @return {Promise<any>}
   */
  getVideoBy(params) {
    return new Promise((resolve, reject) => {
      const options = {
        method: Network.GET,
        url: `${this.base}/video/all`,
        params: params,
        headers: {
          authorization: `Bearer ${getToken()}`
        },
        json : true
      };
      makeRequest(options).then(res => {
        if(res.response.length) {
          resolve({response : res.response[0]});
        } else {
          reject('Unable to retrieve video by id');
        }
      }, () => reject('Unable to retrieve video by id'));
    });
  }

  /**
   * Get a Vimeo video. See https://developer.vimeo.com/api/reference/videos#GET/videos/{video_id}
   * @param {string} videoID A vimeo video ID
   * @param {string} fields A set of video property to retrieve, separated by coma
   * @return {Promise<any>}
   */
  getVimeoSource(videoID, fields) {
    fields = fields || "";
    const options = {
      method: Network.GET, 
      url: `${this.server}/api/vimeo/${videoID}?fields=${fields}`,
      headers: {
        authorization: `Bearer ${getToken()}`
      },
      json : true
    };

    return makeRequest(options);
  }

  /**
   * Send an event to the amadeus backend. 
   * @param {Event} event 
   * @return {Promise<any>}
   */
  event(event) {
    const options = {
      url: `${this.base}/event`,
      method: Network.POST,
      body: event,
      headers: {
        authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      onerror: () => EventService.send(Events.VIMEO_ERROR)
    };

    return makeRequest(options);
  }

  /**@ignore */
  clear(cache) {
    this[cache] = {};
  }
}

export default new ApiManager();
