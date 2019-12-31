import ApiManager from '../api/manager';
import * as Utils from '../utils';

import SkinService from "../skin/service";
import { Options } from '../types/options.type';
import { Caption } from '../types/caption.type';
import { Brand } from '../types/brand.type';
import { Source } from '../types/source.type';
import { VideoDetails } from '../types/video-details.type';
import { Video } from '../types/video.type';
import { POI } from '../types/poi.type';
import { VideoService } from './service';

/**
 * Amadeus Video Player video service. This service is in charge of gettting all data that are necessary to bootstrap an Amadeus Video Player using a video ID.
 */
export class AVSVideoService implements VideoService{

  /** @ignore */
  private opts:Options;
  /** @ignore */ 
  private videoDetails:VideoDetails;

  /**
   * Create an AVSVideoService based on the given options
   * @param {Options} opts A set of player options
   * @return {AVSVideoService} 
   */
  constructor(opts:Options) {
    this.opts = opts;
  }

  /**
   * @ignore
   * Get the list of captions for the retrieved video
   */
  getCaptions(captions:any):Caption[]{
    let res:Caption[] = [];
    captions.forEach((caption:any) => {
      if (caption.active) {
        const isDefault = (caption:any) => this.opts.hasOwnProperty('defaultCaption') && this.opts.defaultCaption.toLocaleLowerCase() === caption.language.toLocaleLowerCase();
        res.push({
          kind : 'captions',
          label: this.getTrackLabel(caption),
          id : Utils.uuid(),
          src: caption.source+'?t='+Date.now(),
          srclang: caption.language,
          default : isDefault(caption)
          
        });
      }
    });

    return res;
  }

  /**
   * Get all needed data to bootstrap a video from Amadeus backends. 
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
        .then(this._onSessionCreated.bind(this), () => reject(1))
        .then(this._onVideoReceived.bind(this), () => reject(2))
        .then(this._onVimeoDetailsReceived.bind(this), () => reject(3))
        .then(async () => {
          if (this.videoDetails.meta.producer_id) {
            try {
              const brand = await this.getBranding();
              this.videoDetails.brand = brand;
            } catch(e) {
              console.warn(`Not able to retrieve brand for ${this.opts.videoID}`);
            }
          }

          resolve(this.videoDetails);
        });
    }); 
  }

  /**
   * @ignore
   * Get the branding for the current video
   */
  async getBranding():Promise<Brand> {
    try {
      const res = await this.getPoducer();
      const producer = res.response;

      let link = '';
      if (producer && producer.links && producer.links.length) {
        const links = producer.links;
        link = links[0].url;
      }

      return  {
        destination : link,
        destinationTarget : '_blank',
        image : SkinService.getValue('watermark'),
        title : '' 
      }
    } catch(e) {
      const error = `Not able to retrieve producer ${this.videoDetails.meta.producer_id}`;
      console.warn(error);
      throw new Error(error);
    }
  }

  /**
   * @ignore
   * Normalize the list of POI receive from the backend
   * 
   * @param videoObj 
   */
  normalize(videoObj:Video):POI[] {
    let res:POI[] = [];
    if (videoObj.linearized_video_pois  && videoObj.linearized_video_pois.length ) {
      let dictionary = {};
      videoObj.video_pois.forEach(function (vp:any) {
        dictionary[vp.poi_id] = vp;
      });
      res = videoObj.linearized_video_pois.map(function (lvp:any) {
        lvp.time = lvp.start_time;
        if (dictionary.hasOwnProperty(lvp.poi_id)) {
          lvp.poi_name = dictionary[lvp.poi_id].poi_name;
        }
        return lvp;
      });
    }
    return res;
  }

  /**
   * @ignore
   * Get a track label base on language code
   * 
   * @param caption 
   */
  getTrackLabel(caption:any):string {
    for(let i =0; i< Utils.languages.length; i++ ) {
      if (Utils.languages[i].code === caption.language) {
        return Utils.languages[i].name;
      }
    } 
    return 'Unknown';
  }


  /**
   * @ignore
   * Get the best media resolution for the current player size
   * 
   * @param obj Vimeo response object
   * @param dimension the dimension of the player
   */
  getVideoResolution(obj:any, dimension:ClientRect | DOMRect):number{
    let lowerQuality = 0;
    let minQuality = 9999;
    for (let i in obj.files) {
      //File without width indicates an HLS format which always be the best
      //format for the given dimension.
      const width = obj.files[i].width || dimension.width;
      //Store the quality that is directly below the request dimension
      if (width <= dimension.width && width >= lowerQuality) {
        lowerQuality = width;
      }
      //Store the lowest quality available
      if (width <= minQuality) {
        minQuality = obj.files[i].width;
      }
    }
    if (lowerQuality == 0) {
      return minQuality;
    }
    return lowerQuality;
  }

  /**
   * @ignore
   * Extract the media information from the Vimeo response object.
   * 
   * @param obj A vimeo response
   * @return A list of media sources
   */
  getVideoURLs(obj:any):Source[] {
    const videoURLs = Object.keys(obj.files)
      .map(k => obj.files[k])
      .map(file => {
        const link = file.link_secure;
        if (!file.width){
          return {
            src: link,
            type: 'application/x-mpegURL',
            label: 'Auto',
            res: Infinity 
          };
        } else {
          const isHD = file.width > 960;
          return {
            src: link,
            type: 'video/mp4',
            label: `${file.height}p <small>${(isHD ? 'HD' : 'SD')}</small>`,
            res: file.width
          };
        }
      }).sort((a, b) => {
        const diff = a.res - b.res;
        return diff > 0 ? 1 : diff < 0 ? -1 : 0;
      });

    return videoURLs;
  }


  /**@ignore */
  _onSessionCreated(res:any):Promise<any> {
    const obj = res.response;
    const authorizedLocation = Utils.getAuthorizedStore();
    if (obj.env) {
      Utils.setKey(authorizedLocation, 'tc-env', obj.env, 7);
    }
    Utils.setKey(authorizedLocation, Utils.getTravelCastKeyName(authorizedLocation), obj.token, 7);
    if(!this.opts.hasOwnProperty('external') || !this.opts.external) {
      return ApiManager.getVideo(this.opts.videoID);
    } else {
      return ApiManager.getVideoBy({externalid : this.opts.videoID});
    }
  }


  /** @ignore */
  _onVideoReceived(res:any):Promise<any> {
    let videoObj = (res.response instanceof Array ? res.response[0] : res.response) as Video;
    //Ensure negative end_times are treated as Infinity
    videoObj.video_pois.forEach(p => p.end_time = !p.hasOwnProperty('end_time') || p.end_time < 0 ? Infinity : p.end_time);
    const captions = videoObj.captions ? videoObj.captions : [];
    this.videoDetails = {
      meta : videoObj,
      pois : this.normalize(videoObj),
      captions : this.getCaptions(captions),
      selectedResolution : -Infinity,
      sources : []
    };
    if(!this.opts.hasOwnProperty('external') || !this.opts.external) {
      const fields = 'files,pictures';
      return ApiManager.getVimeoSource(this.opts.videoID, fields);
    } else {
      this.videoDetails.sources = [{src:videoObj.source}];
      return Promise.resolve();
    }
  }


  /**
   * @ignore
   * Get the producer for the video
   */
  getPoducer():Promise<any> {
    if (this.videoDetails.meta.producer_id) {
      return ApiManager.getProducer(this.videoDetails.meta.producer_id);
    } else {
      return new Promise(function (resolve, reject) {
        resolve({response : 'null'});
      });
    } 
  }

  /**@ignore */
  _onVimeoDetailsReceived(res:any):Promise<any> {
    if(!this.opts.hasOwnProperty('external') || !this.opts.external) {
      const obj = res.response;
      /* parse data for url */
      this.videoDetails.sources = this.getVideoURLs(obj);
      this.videoDetails.selectedResolution = this.getVideoResolution(obj, this.opts.dimensions);
    }
    return Promise.resolve();
  }
}