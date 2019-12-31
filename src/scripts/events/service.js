import ConfigurationService from "../configuration/service";

import {getLocalStorageValue} from '../utils/storage';
import ApiManager from '../api/manager';
import Profile from '../enums/profile';
import Environment from '../enums/environment';


import analytics from 'universal-ga';
import { Event } from "../types/event.type";

/**
 * Service in charge of sending events to Google Analytics and Amadeus backend
 */
export class EventService {
  constructor() {
    this.videoDimensions = {};
    this.poiDimensions = {};
    this.analyticDimensions = {};

    this.additionalTrackingCodes = [];
    this.additionalTrackers_ = {};
    this.enabled_ = true;
    this.initialized_ = false;

    this.gaDimensionRegExp = /dimension\d{1,}/gi;
  }

  /**
   * Initilize the service. By default events will be sent to Amadeus backends and to the Google Analytics tarcking code defined by the environment variable GOOGLE_ANALYTICS_TRACKING_CODE.
   * One may add additional tracking code thanks to the additionalTrackingCodes paramters.
   * @param {*} additionalTrackingCodes Optional an array of Google Analytics API keys
   */
  initialize(additionalTrackingCodes) {
    analytics.initialize(ConfigurationService.getValue(Environment.GOOGLE_ANALYTICS_TRACKING_CODE));

    additionalTrackingCodes = additionalTrackingCodes || [];
    this.additionalTrackingCodes = Array.isArray(additionalTrackingCodes) ? additionalTrackingCodes : [additionalTrackingCodes];
    this.additionalTrackingCodes.forEach((trackingCode) => {
      if(typeof trackingCode === 'string') {
        analytics.create(trackingCode, `tracking-${trackingCode}`);
      } else {
        console.warn('Cannot add tracking code. Is parameter a string:', trackingCode);
      }
    });
    this.additionalTrackers_ = this.additionalTrackingCodes
      .map(trackingCode => { 
        return {trackingCode : trackingCode, tracker : analytics.name(`tracking-${trackingCode}`)};
      })
      .reduce((accumulator, currentValue) => {
        accumulator[currentValue.trackingCode] = currentValue.tracker;
        return accumulator;
      }, {});

    this.initialized_ = true;
  }

  /**
   * Globaly set the video dimensions for all onward events.
   * @param {any} opts The video dimensions to send along the event
   */
  setVideoDimensions(opts){
    if(this.initialized_) {
      const cleaned = this.sanitize(opts);
      this.videoDimensions = cleaned;
      this.updateDimensions();
    } else {
      console.warn('Service should be initialized before using calling this function');
    }
  }
  
  /**
   * Globaly set the POI dimensions for all onward events.
   * @param {any} opts The poi dimensions to send along the event
   */
  setPoiDimensions(opts){
    if(this.initialized_) {
      const cleaned = this.sanitize(opts);
      this.poiDimensions = cleaned;
      this.updateDimensions();
    } else {
      console.warn('Service should be initialized before using calling this function');
    }
  }
  
  /**@ignore */
  sanitize(opts) {
    let res = {};
    Object.keys(opts).reduce((accumulator, key) => {
      if(key.match(this.gaDimensionRegExp) !== null){
        res[key] = opts[key];
      }
      return accumulator;
    }, {});
    return res;
  }

  /**@ignore */
  updateDimensions(){
    if(this.initialized_) {
      this.analyticDimensions = Object.assign({},this.videoDimensions, this.poiDimensions);
      const fn = (tracker) => {
        Object.keys(this.analyticDimensions).forEach(k => tracker.custom(k, this.analyticDimensions[k]));
      };
      this._applyToAllTrackers(fn);
    } else {
      console.warn('Service should be initialized before using calling this function');
    }
  }

  /**
   * Activate or de-activate the tracking of events
   * @param {boolean} enabled 
   */
  enabled(enabled) {
    this.enabled_ = enabled;
  }

  /**
   * Send an event
   * @param {any} event The event to send. Refers to Events list 
   * @param {any} opts Optional a set of metrics/dimensions for the event
   * @param {string} label Optional a label for the curretn event
   */
  send(event, opts = {}, label='') {
    if(this.initialized_ && this.enabled_) {
      const authProfile = getLocalStorageValue('auth_profile') || '0';
      if (authProfile !== Profile.ADMIN) {
        const referrer = (parent !== window) ? document.referrer : document.location.href;
        //FB.AppEvents.logEvent(event.tc);
        const tcEventOpts = Object.assign({}, this.analyticDimensions, opts);
        const videoId = tcEventOpts.dimension4;
        ApiManager.event({
          action: event.tc,
          action_name: event.ga,
          rsrc: videoId,
          event_details: tcEventOpts,
          label: label,
          referrer: referrer
        });
    
        const fn = (tracker) => {
          if (event.ga_type === 'event') {
            opts.eventValue = -1;
            opts.eventLabel = label;
            tracker.event(event.category, event.ga, opts);
          } else {
            tracker.pageview(event.ga, opts);
          }
        };

        this._applyToAllTrackers(fn);
      }
    } else {
      console.warn('Service should be initialized and enabled before using calling this function');
    }
  }

  /**
   * Get the tracker created for the given tracking code or null if not exist.
   * @param {string} trackingCode 
   */
  getTrackerFor(trackingCode) {
    return this.additionalTrackers_[trackingCode] || null;
  }

  /**@ignore */
  _applyToAllTrackers(fn) {
    fn(analytics);
        this.additionalTrackingCodes
          .map(trackingCode => this.getTrackerFor(trackingCode))
          .forEach(tracker => fn(tracker));
  }
}

export default new EventService();