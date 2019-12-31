
/**@ignore */
const videojs = require('video.js').default;
/**@ignore*/
const hammerjs = require('hammerjs');

import "../tags/webplayer/player.tag";
import ConfigurationService from "./configuration/service";
import { TemplateType } from "./enums";
import BridgeEvent from './enums/bridge';
import Environment from "./enums/environment";
import { Events } from "./events/list";
import EventService from "./events/service";
import { Options } from "./types/options.type";
import { POI } from "./types/poi.type";
import { Source } from "./types/source.type";
import { VideoDetails } from "./types/video-details.type";
import * as Utils from "./utils";
import { AVSVideoService } from "./video/avs";
import { InlineVideoService } from "./video/inline";
import { BrandPlugin } from "./videojs/plugins/brand";
import { IOSFullscreenPlugin } from "./videojs/plugins/fullscreen";
import { MarkersPlugin } from "./videojs/plugins/markers";
import { RepeatPlugin } from "./videojs/plugins/repeat";
import { ResolutionSwitcherPlugin } from "./videojs/plugins/resoluion-switcher";
import { SharePlugin } from "./videojs/plugins/share";


/**@ignore */
declare const riot:any;
/**@ignore */
declare const i18n:any;

export enum PlayerError {
  SessionError = 1,
  VideoError = 2,
  VimeError = 3
};

export class Player {

  /** The hosting HTML element of the player */
  public rootEl:HTMLElement;

  /**@ignore */
  //@ts-ignore
  private hammerManager: hammerjs.HammerManager;

  /**@ignore */
  private listeners:{ [key:string]:any; } = {};
  /**@ignore */
  private registeredCallbacks:{resolve:Function, reject:Function}[] = [];
  /**@ignore */
  private timestamp:number = Date.now();

  /**@ignore */
  private initialized:boolean = false;
  /**@ignore */
  private firstPlay:boolean = false;

  /**@ignore */
  private unsupported:number = 0;

  /**@ignore */
  private editableWarning:string = `
  Advenced edition features are only available for editable player. 
  If you wish to use this feature esnure that editable property is set to true in player's initialization.
  Current action will have no impact
  `;


  /**@ignore */
  private player:any;
  /**@ignore */
  private opts:Options;
  /**@ignore */
  private tag:any;

  /**@ignore */
  private videoDetails:VideoDetails;

  /**@ignore */
  private loadedMetadataFn:Function;

  /**
   * Create a player instance
   *
   * @param domNode
   *        A css selector or a domNode where player will be inserted.
   *        If a css selector is specified the first matching element will be used to instanciate the player
   *
   * @param [opts]
   *        Options object for config/settings. See IPlayerOptions for details
   *
   * @return A player instance
   */
  constructor(domNode: string | HTMLElement, options?: Options){
    this._registerPluginIfNeeded('markers', MarkersPlugin);
    
    this._registerPluginIfNeeded('repeat', RepeatPlugin);
    this._registerPluginIfNeeded('iosFullscreen', IOSFullscreenPlugin);
    this._registerPluginIfNeeded('resolutionSwitcher', ResolutionSwitcherPlugin);
    this._registerPluginIfNeeded('share', SharePlugin);

    
    this.rootEl = typeof domNode === 'string' ? document.querySelector(domNode) : domNode;

    if(typeof options === 'undefined') {
      options = this._extractOptsFromNode();
    }

    if(typeof options !== 'undefined') {
      if(options.hasOwnProperty('videoID') || 
         options.hasOwnProperty('source') || 
         (options.hasOwnProperty('sources') && options.sources.length > 0)) {
        if(options.hasOwnProperty('poster')) {
          options.thumbnailUrl = options.poster;
        }  
        let api:Options = Object.assign({
          player : this,
          dimensions : this.rootEl.getBoundingClientRect()
        }, options);

        if(options.hasOwnProperty('amadeusBackend') && options.amadeusBackend.length ){
          ConfigurationService.setValue(Environment.MAIN_SERVER, options.amadeusBackend);
        }

        if(options.hasOwnProperty('skin') && options.skin === 'xmas' && !options.hasOwnProperty('brand')){
          api.brand = {
            image : "url(https://storage.googleapis.com/travelcast/images/santa.svg) no-repeat center",
            destination : "https://santaclausvillage.info/",
            destinationTarget : "_blank",
            title : "Xmas village"
          }
        }

        this.opts = api;

        if(this.opts.debug) {
          console.debug('Initializing player with options', this.opts);
        }
        this.tag = riot.mount(domNode, 'avs-player', api)[0];    
        this._initialize();
      } else {
        console.error('Video source missing. Unable to initialize', options);
      }
    } else {
      console.error('Player options missing. Unable to initialize');
    }
  }

  /**@ignore */
  _registerPluginIfNeeded(name:string, plugin:Function) {
    const index = Object.keys(videojs.getPlugins()).indexOf(name);
    if(index == -1 ) {
      videojs.registerPlugin(name, plugin);
    }
  }

  /**
   * Extract an Amadeus Video Player Options object from a HTML video tag.
   * Video tag should be present as child of the root element.
   * 
   * @ignore
   */
  _extractOptsFromNode():Options {
    let opts:Options = null;
    const video = this.rootEl.querySelector('video');
    if(video) {
      let booleanFn =  (v:string) => v === "" || v === "true";
      let resFn =  (v:string) => v.toLowerCase() === "infinity" ? Infinity : isNaN(parseInt(v, 10)) ? 0 : parseInt(v, 10);

      opts = this._extendOptsFromNode({}, video, 'poster');
      opts = this._extendOptsFromNode(opts, video, 'autoplay', booleanFn);
      opts = this._extendOptsFromNode(opts, video, 'data-debug', booleanFn);
      
      opts = this._extendOptsFromNode(opts, video, 'data-videoID');
      opts = this._extendOptsFromNode(opts, video, 'data-external');
      opts = this._extendOptsFromNode(opts, video, 'data-skin');
      opts = this._extendOptsFromNode(opts, video, 'data-amadeusBackend'); 

      opts = this._extendOptsFromNode(opts, video, 'data-defaultCaption'); 

      let sources:Source[] = [];
      video.querySelectorAll('source').forEach(s => {
        let srcObj = this._extendOptsFromNode({}, s, 'src');
        srcObj = this._extendOptsFromNode(srcObj, s, 'type');
        srcObj = this._extendOptsFromNode(srcObj, s, 'data-label');
        srcObj = this._extendOptsFromNode(srcObj, s, 'data-res', resFn);

        sources.push(srcObj);
      });
      if(sources.length) {
        opts.sources = sources;
      }
    } else {
      console.warn('No <video> tag present has child of rootEl.');
    }
    return opts;
  }

  /**
   * Extract a data attribute from a HTML element and extend a source object with the value.
   * 
   * @param src The src object to extend with the property read from node
   * @param el The element on which attribute should be read
   * @param attrName The attribute name to read
   * @param modifier A modifier function for the value read from node
   * 
   * @ignore
   */
  _extendOptsFromNode (src:any, el:HTMLElement, attrName:string, modifier?:Function) {
    let obj = {};
    const key = attrName.replace('data-', '');
    if (el.hasAttribute(attrName)) {
      obj[key] = modifier ? modifier(el.getAttribute(attrName)) : el.getAttribute(attrName);
    } 
    return Object.assign(obj, src);
  }
  
  /** @ignore */
  _initialize () {
    if (this.opts.callbacks && this.opts.callbacks.ready) {
      this.ready()
        .then(this.opts.callbacks.ready)
        .catch(this.opts.callbacks.ready);
    }
    let service = null;
    if(this.opts.hasOwnProperty('videoID')) {
      if(this.opts.debug) {
        console.debug('Retrieving data from amadeus backend for video', this.opts.videoID);
      }
      service = new AVSVideoService(this.opts);
    } else {
      if(this.opts.debug) {
        console.debug('Retrieving data from configuration object');
      }
      service = new InlineVideoService(this.opts);
    }
    i18n.setLanguage(this.opts.locale || 'en_US');
    service.getData().then((videoDetails) => {
      this.videoDetails = videoDetails;
      this._initializeVideoJSPlayer();
    }, (c) => {
      this.unsupported = c;
      this._onReady(c);
    });
  }

  /** @ignore */
  _initializeVideoJSPlayer() {
    if(this.opts.debug) {
      console.debug('Initializing videojs player');
    }
    const options:any = {
      hls: {
        withCredentials: true
      },
      plugins: {
        resolutionSwitcher: {
          default: 'high',
          dynamicLabel: false
        },
        iosFullscreen : {
          active : false,
          opts : this.opts
        },
        share : {
          callback : this.openShare.bind(this)
        }
      },
      controlBar: {
        volumeMenuButton: {
          inline: true
        }
      }
    };

    if(this.opts.hasOwnProperty('repeatable') && this.opts.repeatable) { 
      options.plugins.repeat = {
        active : false
      };
    }

    if(this.opts.hasOwnProperty('brand') || 
       this.videoDetails.hasOwnProperty('brand')) {
      if(this.opts.debug) {
        console.debug('Branding detected. Registering brand plugin with parameters', this.videoDetails.brand);
      }
      this._registerPluginIfNeeded('brand', BrandPlugin);
      if(this.opts.hasOwnProperty('brand')) {
        options.plugins.brand = this.opts.brand;
      }
      //Video details branding has pripority over opts if specified.
      if(this.videoDetails.hasOwnProperty('brand')) {
        options.plugins.brand = this.videoDetails.brand;
      }
    }

    const isEditable = this.opts.hasOwnProperty('editable') && this.opts.editable;
    if(!isEditable && this.opts.hasOwnProperty('hotkeys') && this.opts.hotkeys) {
      if(this.opts.debug) {
        console.debug('Hotkeys detected. Registering default keys');
      }
      options.userActions = {hotkeys : this.opts.hotkeys};
    } else {
      options.userActions = {hotkeys : false};
    }
    

    this.player = videojs(this.rootEl.querySelector('video'), options, () => {
      Object.keys(this.opts.callbacks).forEach(k => this.player.on(k, this.opts.callbacks[k]));
      this.firstPlay = true;
      
      // tslint:disable-next-line
      this.player.iosFullscreen(); 
    });

    this._initializeMarkers();

    if(this.opts.debug) {
      console.debug('Multiple sources detected. Registering resolution switcher plugin with parameters', this.videoDetails.sources);
    }
    this.videoDetails.sources.forEach((s:Source, i:number) => {
      if(!s.hasOwnProperty('label')) {
        s.label = `Source ${i+1}`;
      }
    });
    this.player.updateSrc(this.videoDetails.sources);
    this.player.currentResolution(this.videoDetails.selectedResolution);
   

    if (this.videoDetails.hasOwnProperty('captions') && this.videoDetails.captions.length > 0) {
      if(this.opts.debug) {
        console.debug('Captions detected', this.videoDetails.captions);
      }
      this._initializeCaptions();
    }

    this._addListeners();

    this.player.ready(this._onReady.bind(this));
    this.ready().then(this._toggleComponentVisibility.bind(this));
    this.ready().then(this._addDoubleTapListner.bind(this));

    //Videojs marker plugin initialize when loadedmetadata is fired
    //adding makrers after this event ensure they will always be visible
    this.loadedMetadataFn =  this._onLoadedMetadata.bind(this)
    this.player.on('loadedmetadata',this.loadedMetadataFn);
  }

  /**
   * Destroys the video player and does any necessary cleanup
   */
  dispose() {
    if(this.tag) {this.tag.unmount();}
    if(this.hammerManager) {this.hammerManager.off('doubletap');}
    this._removeListeners();
    if(this.player) {
      this.player.off('loadedmetadata', this.loadedMetadataFn);
      this.player.markers().dispose();
      this.player.dispose();
    }
  }

  /** @ignore */
  _initializeCaptions(){
    const captions =  this.videoDetails.captions;
    captions.forEach((c:any) => {
      this.player.addRemoteTextTrack(c);
    });
  }

  /** @ignore */
  _initializeMarkers(){
    const onMarkerClick = (marker:any) => {      
      let optsEvent:any = {
        'dimension5': marker.poi_name,
      };
      if (marker.details) {
        const address = marker.details.address || '';
        const parts = address.split(',');
        const country = parts.length ? parts[parts.length - 1] : '';
        optsEvent.dimension6 = country;
        optsEvent.dimension7 = marker.details.city_name;
      }

      EventService.send(Events.CTRLBRPOI_CLICKED, optsEvent);
    };

    let opts = {
      onMarkerReached : this.opts.callbacks.markerreached ||  function () {},
      markerTip : {
        display: true,
        text: function (marker:any) {
          return marker.poi_name || i18n.localise('template.label.notspecified');
        }
      },
      onMarkerClick : onMarkerClick,
    }

    if(this.opts.debug) {
      console.debug('POIS detected.  Registering videojs markers plugin with parameters', opts);
    }
    this.player.markers(opts);
  }


  /**@ignore */
  _onLoadedMetadata () {
    this.player.markers().add(this.filterPOIs());
  }

  /** @ignore */
  filterPOIs () {
    const pois = this.videoDetails.pois || [];
    return pois.filter((poi:POI) => {
      if(this.opts.hasOwnProperty('editable') && this.opts.editable) { 
        return ( poi.place_id &&  poi.place_id.length ) || ( poi.poi_id &&  poi.poi_id.length);
      } else {
        let cfg =  null;
        if(this.videoDetails.meta.configurations && this.videoDetails.meta.configurations[poi.poi_id]) {
          cfg = this.videoDetails.meta.configurations[poi.poi_id];
        }
       
        return (poi.place_id && poi.place_id.length) || (cfg && cfg.template_type === TemplateType.Tour && cfg.places.length > 0);
      }
    }); 
  }

  /** @ignore */  
  _addListeners() {
    if(!this.opts.hasOwnProperty('editable') || !this.opts.editable) { 
      this.player.on('fullscreenchange', this._toggleComponentVisibility.bind(this));
    }

    Object.keys(BridgeEvent).forEach(k => {
      const event = BridgeEvent[k];
      let fn = (e:any) => console.warn(`Event handler undefined for event ${e.type}`);
      if(typeof this[`_${event}`] === 'function') {
        if(this.opts.debug) {
          console.debug(`Listener for foreign event ${event} detected. Adding listener`);
        }
        fn = this[`_${event}`].bind(this);
      }
      this.listeners[event] = fn;
      window.addEventListener(event, fn);
    });

    if(!this.opts.hasOwnProperty('editable') || !this.opts.editable) { 
      this.listeners.resize = Utils.debounce(this._toggleComponentVisibility.bind(this), 250, true);
      window.addEventListener('resize', this.listeners.resize);
    }
  }

  /** @ignore */
  _removeListeners() {
    Object.keys(this.listeners).forEach(k => {
      if(this.opts.debug) {
        console.debug(`Listener for foreign event ${k} detected. Removing listener`);
      }
      window.removeEventListener(k, this.listeners[k]);
    });
  }

  /**
   * Return a promise that will resolve once the player is ready.
   * If the ready event has already happened it will resolve the promise immediately.
   *
   * @return {Promise<number?>} A promise that will ve resolved or rejected, with error code, depending on the player initialisation sattus. 
   */
  ready() {
    if(this.initialized) {
      return Promise.resolve(this.unsupported);
    } else {
      return new Promise((resolve, reject) => { this.registeredCallbacks.push({resolve:resolve, reject:reject})});
    }
  }

  /** @ignore */
  _onReady(errorCode:number) {
    const isEditable = this.opts.hasOwnProperty('editable') && this.opts.editable;
    this.initialized = true;
    this.registeredCallbacks.forEach(p => { typeof errorCode !== 'undefined' ? p.reject(errorCode) : p.resolve(this)});
    this.registeredCallbacks = [];
  }

  /**
   * Check if the player has been initilized.
   * A player has been initialized when it is ready to play
   *
   * @return - true if initialized
   *         - false if not
   */
  hasBeenInitialized():boolean {
    return this.initialized;
  }

  /**
   * Check if the player has been initilized with error.
   *
   * @return the error code assoiciated with the error
   */
  hasError():number {
    return this.unsupported;
  }

  /**
   * Get the underlying video.js player.
   *
   * This is useful if you want access method provided by video.js player
   * but not directly exposed by Amadeus video player
   *
   *
   * @return	A player instance or null if there is no player instance.
   */
  getPlayer ():videojs.Player { return this.player as videojs.Player;}

  /** @ignore*/
  getTimeStamp () {
    return this.timestamp;
  }

  /**
   * Get or set the current time (in seconds)
   *
   * @param [seconds]
   *        The time to seek to in seconds
   * 
   * @param [shouldOpenPanel]
   *        Should the overlay panel be opened after seeking
   *
   * @return - the current time in seconds when getting
   */
  currentTime(seconds?: number, shouldOpenPanel?: boolean): number | void {
    if (typeof seconds !== 'undefined' && typeof(seconds) === 'number') {
      const video = this.rootEl.querySelector('video');
      if (shouldOpenPanel) {
        const fn = () => {
          this.openPanel();
          video.removeEventListener('seeked', fn);
        };
        video.addEventListener('seeked', fn);
      }
      this.closePanel();
      const fn = () => { 
        const duration = this.duration();
        const seekTime = seconds <= 0 ? 0 : seconds >= duration ? duration : seconds;
        this.player.currentTime(seekTime);
      };
      //Ensure the poster is removed and panel is visible
      if(!this.tag.played ) {
        this.tag.played = true;
        this._updateTag();
        //Ensure that riot has updated all tags before scrubbing
        window.setTimeout(fn, 1000)
      } else {
        fn();
      }
    } else {
      return this.player.currentTime();
    }

  }

  /**
   * Get the current POI
   */
  currentPOI () {return this.tag.currentMarker(); }

  /**
   * Get the duration of the video
   */
  duration() {return this.player? this.player.duration() : 0;}

  /**
   * Pause the video playback
   */
  pause() {this.player.pause(); }

  /**
   * Attempt to begin playback at the first opportunity.
   */
  play() {
    if(this.player) {
      this.player.ready(() => {
        this.closePanel();
        this.closeShare();
        this.player.play();
      });
    }
  }

  /**
   * Toggle volume on and off
   * @param muted 
   */
  setMuted(muted:boolean) {
    this.player.muted(muted);
  }

  /**
   * Check if the player is in fullscreen mode.
   *
   * @return - true if fullscreen is on
   *         - false if fullscreen is off
   */
  isFullscreen() {
    if(!this.player) {
      return false;
    }
    
    if(Utils.isiOSDevice()) {
      return this.player.iosFullscreen().isFullscreen();
    } else {
      return this.player.isFullscreen();
    }
  }

  /**
   * Request the player to go fullscreen.
   *
   * Note > In some browsers, full screen is not supported natively, so it enters
   * "full window mode", where the video fills the browser window
   * e.g position fixed 0,0,100%,100% and highest possible z-index.
   *
   * @fires fullscreenchange
   */
  requestFullscreen() {
    this.play();
    if(Utils.isiOSDevice()) {
      this.player.iosFullscreen().requestFullscreen();
    } else {
      this.player.requestFullscreen();
    }
  }

  /**
   * Return the video to its normal size after having been in full screen mode
   *
   * @fires fullscreenchange
   */
  exitFullscreen() {
    if(Utils.isiOSDevice()) {
      this.player.iosFullscreen().exitFullscreen();
    } else {
      this.player.exitFullscreen();
    }
  }

  /**
   * Dynamically add new POI to the list of known POIs
   *
   * @param poi
   *        An object describbing the POI to be added see POI
   * 
   * @param [seekTo]
   *        Optional Should the video be seeked to the newly added POI
   * 
   * @param [shouldOpenPanel]
   *        Optional Should the POI panel be opened when seeked to the video. SeekTo needs to be set to true for this parameter to take effect.
   */
  addPOI(poi: POI, seekTo:boolean, shouldOpenPanel:boolean){
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      poi.start_time = poi.start_time === 0 ? 1 : poi.start_time;
      poi.time = poi.start_time;
      poi.text = poi.poi_name;
      
      this.player.markers().add([poi]);
      this.videoDetails.pois.push(poi);

      if(seekTo) {
        this.currentTime(poi.start_time, shouldOpenPanel);
      }
    } else {
      console.warn(this.editableWarning);
    }
  }

  /**
   * Get the list of registered markers.
   */
  getMarkers() {
    return this.player.markers().getMarkers();
  }

  /**
   * Remove the POI at the given index.
   * Note > the index is 0-based (e.g. first POI has index 0).
   *
   * @param index
   *        Index of the POI to remove
   */
  removePOI(index:number) {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      this.removePOIs([index]);
    } else {
      console.warn(this.editableWarning);
    }
  }

  /**
   * Remove the POIs in the given array of indices.
   * Note > the index is 0-based (e.g. first POI has index 0).
   *
   * @param idxArr
   *        An array of 0 based position where to remove POIs
   */
  removePOIs(idxArr:number[]) {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      this.closePanel()
      const current = this.currentPOI();
      this.player.markers().remove(idxArr);
      idxArr.forEach((idx) => {
        let removed = this.videoDetails.pois[idx];
        if(current && removed && current.poi_id === removed.poi_id) {
          this.tag.onMarkerReached(null);
        }
      });
    } else {
      console.warn(this.editableWarning);
    }
  }

  /**
   * Reflect POIs' time changes in the UI.
   *
   * Note > POI's time can be changed dynamically (from the original POI object passed in).
   *        Once POI times have been changed, updateTime should be called to immediately reflect the changes in the UI.
   */
  updatePOIsTimes() {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      this.player.markers().updateTime(true);
    } else {
      console.warn(this.editableWarning);
    }
  }
  
  /**
   * Update the POI identified by the parameter id. ID is matched against poi_id and place_id if any.
   *
   * @param id
   *        The id of the POI for which an update is required
   * 
   * @param key
   *        The property key that needs to be updated
   * 
   * @param value
   *        The new value to assign to POI's property
   */
  updatePOI(id:string, key:string, value:any) {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      let matching = this._find(id);
      if(matching.length > 0) {
        matching.forEach((m) => {
          m[key] = value;
          if(key === 'start_time') {
            m.time = value;
          }
          if(key === 'start_time' || key === 'time') {
            this.updatePOIsTimes();
          }
        });
        this._updateTag();
      }
    } else {
      console.warn(this.editableWarning);
    }
  }
  
  /**
   * Update current POI configuration.
   *
   * @param key
   *        The property key that needs to be updated
   * 
   * @param value
   *        The new value to assign to configuration's property
   */
  updateCurrentPOIConfiguration(key:string, value:any) {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      const current = this.currentPOI();
      if(current) {
        this.updatePOIConfiguration(current.poi_id, key, value);
      }
    } else {
      console.warn(this.editableWarning);
    }
  }

  /**
   * Update the POI configuration for POI identified by the parameter id. ID is matched against poi_id and place_id if any.
   *
   * @param id
   *        The id of the POI for which a configuration update is required
   * 
   * @param key
   *        The property key that needs to be updated
   * 
   * @param value
   *        The new value to assign to POI's property
   */
  updatePOIConfiguration(id:string, key:string, value:any) {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      let matching = this._find(id);
      if(matching.length > 0) {
        matching.forEach((m) => {
          const defCfg = Utils.getDefaultConfiguration();        
          let configurations = this.videoDetails.meta.configurations || {};
          configurations[m.poi_id] = configurations[m.poi_id] || defCfg;
          configurations[m.poi_id][key] = value;
          //Ensure blured overlay is shown/hidden on inline value change
          if(key  === 'inline' && value) {
            this.tag.hide('', false, false);
          } else {
            this.tag.show('', true, true);
          }
          this._updateTag();
        });
      }
    } else {
      console.warn(this.editableWarning);
    }
  }

  /**
   * Returns whether or not the user is "scrubbing". Scrubbing is
   * when the user has clicked the progress bar handle and is
   * dragging it along the progress bar.
   *
   * @return The value of scrubbing when getting
   */
  scrubbing() {
    return this.player.scrubbing();
  }

  /**
   * Add the given callbacks to the video.js Player internal instance.
   * @param callbacks an array of callbacks to add 
   */
  setCallbacks(callbacks:{ [key:string]: (...args: any[]) => void; }) {
    this.opts.callbacks = callbacks;
  }
  
  /**
   * Open the current interactive panel
   */
  openPanel() {this.tag.openPanel();}

  /**
   * Close the current interactive panel
   */
  closePanel() {this.tag.closePanel();}


  /**
   * Open the share panel
   */
  openShare() {this.tag.openShare();}

  /**
   * Close the share panel
   */
  closeShare() {this.tag.closeShare();}

  /**
   * Add an event listener to the player
   *
   * @param eventType
   *        Type of event to bind to.
   *
   * @param eventHandler
   *        Event listener.
   */
  on(eventType: string, eventHandler: Function) { if(this.player) {this.player.on(eventType, eventHandler); }}
  
  /**
   * Trigger a listener only once for an event
   *
   * @param eventType
   *        Type of event to bind to.
   *
   * @param eventHandler
   *        Event listener.
   */
  one(eventType: string, eventHandler: Function) { if(this.player) {this.player.one(eventType, eventHandler);}}
  
  /**
   * Removes event listeners from an element
   *
   * @param eventType
   *        Type of event to bind to.
   *
   * @param eventHandler
   *        Event listener.
   */
  off(eventType: string, eventHandler: Function) { if(this.player) {this.player.off(eventType, eventHandler);}}

  /**
   * Update the pcitures for a POI 
   * 
   * @param id
   *        The id of the POI for which  pictures should be updated
   * 
   * @param pictures 
   *        An array of picture's URLs
   */
  updatePictures (id:string, pictures:string[]) {
    if(this.opts.hasOwnProperty('editable') && this.opts.editable) {
      let matching = this._find(id);
      if(matching.length > 0) {
        this.videoDetails.meta.pictures = this.videoDetails.meta.pictures || {};
        matching.forEach((m:any) => {
          this.videoDetails.meta.pictures[m.poi_id] = pictures;
        });
        this.timestamp = Date.now();
        this._updateTag();
      }
    } else {
      console.warn(this.editableWarning);
    }
  }

  /** @ignore */
  _toggleComponentVisibility() {
    if(this.player) {
      try {
        const dim = this.rootEl.getBoundingClientRect();
        const timeControls = ['CurrentTimeDisplay', 'TimeDivider', 'DurationDisplay'];
        let settingControls = ['ShareButton', 'RepeatButton', 'BrandButton', 'ResolutionMenuButton'];
        if (this.videoDetails.hasOwnProperty('captions') && this.videoDetails.captions.length > 0) {
          settingControls.push('SubsCapsButton');
        }
        const fullscreenControls = [Utils.isiOSDevice() ? 'IOSFullscreenButton' : 'FullscreenToggle'];

        let allControls = timeControls.concat(settingControls).concat(fullscreenControls);
        let controls = this.opts.hasOwnProperty('controls') ? this.opts.controls : allControls;
        let hidden = allControls.filter(c => controls.indexOf(c) === -1).concat([!Utils.isiOSDevice() ? 'IOSFullscreenButton' : 'FullscreenToggle']);

        if(dim.width > 480) {
          this._showControls(controls);
        } else {
          this._hideControls(timeControls);
          if(dim.width < 340) {
            this._hideControls(settingControls);
          } else {
            this._showControls(settingControls);
          }
        }
        this._hideControls(hidden);
      } catch(e) {
        console.warn('Unable to toggle component visibility. Is the player still attached to the DOM?')
      }
    }
  }

  /** @ignore */
  _showControls(arr:string[]) {
    const controlBar = this.player.getChild('ControlBar');
    arr.map(c => controlBar.getChild(c))
       .forEach(c => {if(c){ c.show();}});
  }

  /** @ignore */
  _hideControls(arr:string[]) {
    const controlBar = this.player.getChild('ControlBar');
    arr.map(c => controlBar.getChild(c))
       .forEach(c => {if(c){ c.hide();}});
  }

  /** @ignore */
  _updateTag() {
    if(this.opts.debug) {
      console.debug('Refreshing internal riot tag');
    }
    this.tag.update();
  }

  /** @ignore */
  _onCurrentTimeChanged(e:CustomEvent) {
    if(this.opts.debug) {
      console.debug('onCurrentTimeChanged event recieved with parameters', e);
    }
    const detail = e.detail;
    const shouldOpenPanel = detail.shouldOpenPanel || false;
    this.currentTime(detail.seconds, shouldOpenPanel);
  }

  /** @ignore */
  _onVideoPOIAdded(e:CustomEvent) {
    if(this.opts.debug) {
      console.debug('onVideoPOIAdded event recieved with parameters', e);
    }
    let poi = e.detail.value;
    this.addPOI(poi, true, true);
  }

  /** @ignore */
  _onVideoPOIRemoved(e:CustomEvent) {
    if(this.opts.debug) {
      console.debug('onVideoPOIRemoved event recieved with parameters', e);
    }
    const removeIndex = e.detail.index;
    this.removePOI(removeIndex);
  }

  /** @ignore */
  _onVideoPOIChanged(e:CustomEvent) {
    if(this.opts.debug) {
      console.debug('onVideoPOIChanged event recieved with parameters', e);
    }
    const detail = e.detail;
    this.updatePOI(detail.id, detail.key, detail.newValue);
  }

  /** @ignore */
  _onVideoPOICfgChanged(e:CustomEvent) {
    if(this.opts.debug) {
      console.debug('onVideoPOICfgChanged event recieved with parameters', e);
    }
    const detail = e.detail;
    this.updateCurrentPOIConfiguration(detail.key, detail.newValue);
  }

  /** @ignore */
  _onVideoChanged(e:CustomEvent) {
    if(this.opts.debug) {
      console.debug('onVideoChanged event recieved with parameters', e);
    }
    const detail = e.detail;
    if(detail.key === 'pictures') {
      const keys = Object.keys(detail.newValue);
      keys.forEach((k) => {
        this.updatePictures(k, detail.newValue[k]);
      });
    }
  }

  /** @ignore */
  _find(id:string):any[] {
    let matching = this.videoDetails.pois.filter((p:any) => p.poi_id === id || p.place_id === id || p.id === id);
    if(this.opts.debug) {
      console.debug(`Looking for POI with id ${id}.`, matching);
    }
    return matching;
  }
  
  /** @ignore */
  _addDoubleTapListner() {
    if(hammerjs.Hammer) {
      try {
        const doubleTap = new hammerjs.Hammer.Tap({event: 'doubletap', taps: 2 });
        this.hammerManager = new hammerjs.Hammer.Manager(this.rootEl.querySelector('video'));
        this.hammerManager.add([doubleTap]);
        this.hammerManager.on('doubletap', () => {
          this.currentTime(this.player.currentTime() + 15);
        });
      } catch(e) {
        console.warn('Unable to attach tap listener. Is the player still attached to the DOM?');
      }
    }   
  }
}