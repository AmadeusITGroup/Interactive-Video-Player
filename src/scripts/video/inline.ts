import ApiManager from '../api/manager';
import * as Utils from '../utils';

import TemplateType from '../enums/template';
import { Options } from '../types/options.type';
import { POI } from '../types/poi.type';

import { VideoDetails } from '../types/video-details.type';
import { VideoService } from './service';

/**
 * Amadeus Video Player inline video service. This service is in charge of mapping data from an Options object to an object usable by the player.
 */
export class InlineVideoService implements VideoService{
  /**@ignore */
  private opts:Options;
  /**@ignore */
  private videoDetails:VideoDetails;
  
  /**
   * Create an InlineVideoService based on the given options
   * @param {Options} opts A set of player options
   * @return {InlineVideoService}
   */
  constructor(opts:Options) {
    this.opts = opts;
  }


  /**
   * Get all needed data for the video. 
   * @return {Promise<VideoDetails>}
   */
  getData():Promise<VideoDetails> {
    return new Promise((resolve, reject) => {
      let promise, env = Utils.getKey(Utils.getAuthorizedStore(), 'tc-env');
      const token = Utils.getToken();
      if (token === null) {
        promise = ApiManager.createSession();
      } else {
        promise = Promise.resolve({response : {token: token,  env : env}, headers : null});
      }

      promise
        .then((res) => {
          const obj = res.response;
          const authorizedLocation = Utils.getAuthorizedStore();
          if (obj.env) {
            Utils.setKey(authorizedLocation, 'tc-env', obj.env, 7);
          }
          Utils.setKey(authorizedLocation, Utils.getTravelCastKeyName(authorizedLocation), obj.token, 7);
          
          let sources = this.opts.sources || [];
          if(this.opts.hasOwnProperty('source')) {
            sources = [this.opts.source]; 
          }
          const normalized = this.normalize(this.opts.pois || []);
          this.videoDetails = {
            meta : {
              configurations : normalized.configurations,
              pictures : normalized.pictures
            },
            pois : normalized.pois,
            captions : [],
            selectedResolution : Infinity,
            sources : sources
          };
          if(this.opts.hasOwnProperty('brand')) {
            this.videoDetails.brand = this.opts.brand;
          }
          resolve(this.videoDetails);
        }).catch(() => {
          reject(1);
        });
    }); 
  }

  /**
   * Transform a list of POIs received from player initilalization to a normalized list of POI (e.g ensure time, end_time and poi_id) 
   * and compute a list of pictures and configurations
   * @param pois The initial list of POIs 
   */
  normalize(pois:POI[]):{pois:POI[], pictures:{[key: string]: string[]}, configurations:{ [key: string]: any }} {
    let res:{pois:POI[], pictures:{[key: string]: string[]}, configurations:{ [key: string]: any }} = {
      pois : [],
      pictures : {},
      configurations : {}
    };
    pois.forEach(poi => {
      let p:POI = Object.assign({}, poi);
      p.end_time = !p.hasOwnProperty('end_time') || p.end_time < 0 ? Infinity : p.end_time;
      p.time = p.start_time
      p.poi_id = Utils.uuid();
      let cfg = Utils.getDefaultConfiguration();
      cfg.template_type = TemplateType.Mixed;
      if(p.hasOwnProperty('configuration')) {
        cfg = Object.assign(cfg, p.configuration);
      }
      if(p.hasOwnProperty('pictures')) {
        res.pictures[p.poi_id] = p.pictures;
      }
      res.pois.push(p);
      res.configurations[p.poi_id] = cfg;
    });
    return res;
  }
}