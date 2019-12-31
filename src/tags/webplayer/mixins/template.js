import * as Utils from "../../../scripts/utils";

import {Events} from "../../../scripts/events/list";
import ConfigurationService from "../../../scripts/configuration/service";
import Environment from '../../../scripts/enums/environment';

import TemplateType from "../../../scripts/enums/template"; 
import EventService from "../../../scripts/events/service"; 

import ApiManager from '../../../scripts/api/manager';
import Types from '../../../scripts/enums/template';

export class TemplateMixin  {
  constructor() {
    this.MAX_NB_PHOTOS = 5;
    this.tplDim = null;
    this._listeners = {};
    this._fullscrenListener = null;
  }

  addResizeListener() {
    this._listeners.resize = Utils.debounce(this.onResize.bind(this), 250);
    window.addEventListener('resize', this._listeners.resize);
  }

  addFullscreenChangeListener() {
    if(!this._fullscrenListener && typeof this.opts.player !== 'undefined') {
      this._fullscrenListener = () => {
        window.setTimeout(this.onResize.bind(this), 0);
      }
      this.opts.player.on('fullscreenchange',this._fullscrenListener);
    }
  }

  removeLsiteners () {
    Object.keys(this._listeners).forEach(k => {
      window.removeEventListener(k, this._listeners[k]);
    });
    if(this._fullscrenListener) {
      this.opts.player.off('fullscreenchange', this._fullscrenListener);
    }
  }

  onResize() {
    let el = this.getOverlay();
    if(el) {
      el.style = '';
      this.tplDim = el.getBoundingClientRect();
      if(this.opts.player) {
        const playerEl = this.opts.player.hasOwnProperty('rootEl') ? this.opts.player.rootEl : this.opts.player;
        let bodyDim = playerEl.getBoundingClientRect();
        if(this.opts.player && this.opts.player.isFullscreen()) {
          bodyDim = document.body.getBoundingClientRect();
        }
        const padding = this.getPadding();
        let scale = Math.min(
          (bodyDim.width - 2*padding) / this.tplDim.width,    
          (bodyDim.height - 2*padding) / this.tplDim.height
        ); 
        
        scale = scale > 1.15? 1.15: scale;
        let transform = `translate(-50%, -50%) scale3d(${scale},${scale}, 1)`;
        if(this.opts.cfg && this.opts.cfg.inline) {
          transform = `translateY(-50%) scale3d(${scale},${scale}, 1)`;
        }
        Utils.style(el, {transform : transform});
      }
    }
  }

  getPadding() {
    const els = document.querySelectorAll('meta[content~="viewport-fit=cover"]');
    const extra = Utils.isiOSDevice() ? els.length ? 25 : 10 : 0;
    const padding = this.opts.cfg && this.opts.cfg.inline ? 60 : 20 + extra;
    return padding;
  }

  getPhotoReferences(pictures, poi, cfg) {
    return new Promise((resolve, reject) => {
      const poiID = poi ? poi.poi_id : null;
      const hasPhoto = pictures && pictures.hasOwnProperty(poiID);
      const useGoogle = (!cfg && !hasPhoto) || (cfg && cfg.google_place_photos);
      if (!useGoogle) {
        let photos = hasPhoto ? pictures[poiID] : [];
        if(this.opts && this.opts.editable) {
          photos = photos.map(photo => `${photo}?t=${this.opts.player.getTimeStamp()}`);
        }
        resolve(photos.length > this.MAX_NB_PHOTOS ? photos.slice(0, this.MAX_NB_PHOTOS) : photos);
      } else {
        ApiManager.getPlace(poi.place_id).then(details => {
          if (details && details.photos && details.photos.length > 0) {
            let server = ConfigurationService.getValue(Environment.MAIN_SERVER);
            if(typeof server === 'undefined' || server === null || server === 'null' ) {
              server = '';
            }
            const photos = details.photos.map(photo => `${server}/api/place/picture/${photo.photo_reference}`);
            resolve(photos.length > this.MAX_NB_PHOTOS ? photos.slice(0, this.MAX_NB_PHOTOS) : photos);
          }
        })
        .catch(() => {
          reject([]);
        });
      }
    });
  }

  getType (marker, cfg) {
    let type = TemplateType.Default;
    if (cfg && cfg.hasOwnProperty('template_type')) {
      type = cfg.template_type;
    } else if (marker && marker.hasOwnProperty('details')) {
      type = marker.details.types.indexOf('lodging') > -1 ? TemplateType.Hotel : TemplateType.Default;
    }
    return type;
  }

  getCTALabel (marker, cfg) {
    let label = this.getCTADefaultLabel(marker, cfg);
    if (cfg && cfg.cta_label) {
      label = cfg.cta_label;
    }
    return label;
  }

  getCTADefaultLabel (marker, cfg) {
    const type = this.getType(marker, cfg);
    let txt = i18n.localise('template.button.booknow');
    if (type === TemplateType.Destination) {
      txt = i18n.localise('template.button.getthere');
    } else if (type === TemplateType.Hotel) {
      txt = i18n.localise('template.button.checkavailability');
    } else if (type === TemplateType.Tour) {
      txt = i18n.localise('template.button.contactus');
    }
    return txt;
  }


  getCTALink (marker, cfg) {
    marker = marker || this.opts.marker;
    cfg = cfg || this.opts.cfg;

    const type = this.getType(marker, cfg);
    let link = 'javascript:void(0)';
    if (cfg && cfg.cta_url) {
      link = cfg.cta_url;
    } else if (type!== Types.Default && marker && marker.deeplinks) {
      const key = type === TemplateType.Hotel ? 'hotel' : 'flight';
      link = marker.deeplinks[key];
    }
    return link;
  }

  hasCtaLink(marker, cfg) {
    const type = this.getType(marker, cfg);
    return type === TemplateType.Destination || !this.hasTips(marker) || this.getCTALink(marker, cfg) !== 'javascript:void(0)';
  }

  onCtaLink() {
    EventService.send(Events.DEEPLINK_CLICKED);
    return true;
  }

  hasTips(marker) {
    return marker !== null && marker.hasOwnProperty('tips_description');
  }
}

riot.mixin('template', new TemplateMixin());
