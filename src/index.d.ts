import * as videojs from "video.js";

export as namespace AmadeusVideoPlayer;
export = Player;

declare class Player {
  /** The hosting HTML element of the player */
  rootEl: HTMLElement;
  /**@ignore */
  private hammerManager;
  /**@ignore */
  private doubleTap;
  /**@ignore */
  private listeners;
  /**@ignore */
  private registeredCallbacks;
  /**@ignore */
  private timestamp;
  /**@ignore */
  private initialized;
  /**@ignore */
  private firstPlay;
  /**@ignore */
  private unsupported;
  /**@ignore */
  private editableWarning;
  /**@ignore */
  private player;
  /**@ignore */
  private opts;
  /**@ignore */
  private tag;
  /**@ignore */
  private videoDetails;
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
  constructor(domNode: string | HTMLElement, options?: Player.Options);
  /**
   * Extract an Amadeus Video Player Options object from a HTML video tag.
   * Video tag should be present as child of the root element.
   *
   * @ignore
   */
  _extractOptsFromNode(): Player.Options;
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
  _extendOptsFromNode(
    src: any,
    el: HTMLElement,
    attrName: string,
    modifier?: Function
  ): any;
  /** @ignore */
  _initialize(): void;
  /** @ignore */
  _initializeVideoJSPlayer(): void;
  /**
   * Destroys the video player and does any necessary cleanup
   */
  dispose(): void;
  /** @ignore */
  _initializeCaptions(): void;
  /** @ignore */
  _initializeMarkers(opts: any): void;
  /** @ignore */
  _addListeners(): void;
  /** @ignore */
  _removeListeners(): void;
  /**
   * Bind a listener to the player's ready state.
   * Different from event listeners in that if the ready event has already happened
   * it will trigger the function immediately.
   *
   * @return {Promise<number?>} A promise that will ve resolved or rejected, with error code, depending on the player initialisation sattus. 
   */
  ready(): Promise<number|undefined>;

  /** @ignore */
  _onReady(errordCode: number): void;
  /**
   * Check if the player has been initilized.
   * A player has been initialized when it is ready to play
   *
   * @return - true if initialized
   *         - false if not
   */
  hasBeenInitialized(): boolean;
  /**
   * Check if the player has been initilized with error.
   *
   * @return the error code assoiciated with the error
   */
  hasError():number;
  /**
   * Get the underlying video.js player.
   *
   * This is useful if you want access method provided by video.js player
   * but not directly exposed by Amadeus video player
   *
   *
   * @return	A player instance or null if there is no player instance.
   */
  getPlayer(): videojs.Player;
  /** @ignore*/
  getTimeStamp(): number;
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
  currentTime(seconds?: number, shouldOpenPanel?: boolean): number | void;
  /**
   * Get the current POI
   */
  currentPOI(): any;
  /**
   * Pause the video playback
   */
  pause(): void;
  /**
   * Attempt to begin playback at the first opportunity.
   */
  play(): void;
  /**
   * Check if the player is in fullscreen mode.
   *
   * @return - true if fullscreen is on
   *         - false if fullscreen is off
   */
  isFullscreen(): any;
  /**
   * Request the player to go fullscreen.
   *
   * Note > In some browsers, full screen is not supported natively, so it enters
   * "full window mode", where the video fills the browser window
   * e.g position fixed 0,0,100%,100% and highest possible z-index.
   *
   * @fires fullscreenchange
   */
  requestFullscreen(): void;
  /**
   * Return the video to its normal size after having been in full screen mode
   *
   * @fires fullscreenchange
   */
  exitFullscreen(): void;
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
  addPOI(poi: Player.POI, seekTo: boolean, shouldOpenPanel: boolean): void;
  /**
   * Get the list of registered markers.
   */
  getMarkers(): any;
  /**
   * Remove the POI at the given index.
   * Note > the index is 0-based (e.g. first POI has index 0).
   *
   * @param index
   *        Index of the POI to remove
   */
  removePOI(index: number): void;
  /**
   * Remove the POIs in the given array of indices.
   * Note > the index is 0-based (e.g. first POI has index 0).
   *
   * @param idxArr
   *        An array of 0 based position where to remove POIs
   */
  removePOIs(idxArr: number[]): void;
  /**
   * Reflect POIs' time changes in the UI.
   *
   * Note > POI's time can be changed dynamically (from the original POI object passed in).
   *        Once POI times have been changed, updateTime should be called to immediately reflect the changes in the UI.
   */
  updatePOIsTimes(): void;
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
  updatePOI(id: string, key: string, value: any): void;
  /**
   * Update current POI configuration.
   *
   * @param key
   *        The property key that needs to be updated
   *
   * @param value
   *        The new value to assign to configuration's property
   */
  updateCurrentPOIConfiguration(key: string, value: any): void;
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
  updatePOIConfiguration(id: string, key: string, value: any): void;
  /**
   * Returns whether or not the user is "scrubbing". Scrubbing is
   * when the user has clicked the progress bar handle and is
   * dragging it along the progress bar.
   *
   * @return The value of scrubbing when getting
   */
  scrubbing(): any;
  /**
   * Add the given callbacks to the video.js Player internal instance.
   * @param callbacks an array of callbacks to add
   */
  setCallbacks(callbacks: { [key: string]: (...args: any[]) => void }): void;
  /**
   * Open the current interactive panel
   */
  openPanel(): void;
  /**
   * Close the current interactive panel
   */
  closePanel(): void;
  /**
   * Open the share panel
   */
  openShare(): void;
  /**
   * Close the share panel
   */
  closeShare(): void;
  /**
   * Add an event listener to the player
   *
   * @param eventType
   *        Type of event to bind to.
   *
   * @param eventHandler
   *        Event listener.
   */
  on(eventType: string, eventHandler: Function): void;
  /**
   * Trigger a listener only once for an event
   *
   * @param eventType
   *        Type of event to bind to.
   *
   * @param eventHandler
   *        Event listener.
   */
  one(eventType: string, eventHandler: Function): void;
  /**
   * Removes event listeners from an element
   *
   * @param eventType
   *        Type of event to bind to.
   *
   * @param eventHandler
   *        Event listener.
   */
  off(eventType: string, eventHandler: Function): void;
  /**
   * Update the pcitures for a POI
   *
   * @param id
   *        The id of the POI for which  pictures should be updated
   *
   * @param pictures
   *        An array of picture's URLs
   */
  updatePictures(id: string, pictures: string[]): void;
  /**
   * Get the duration of the video
   */
  duration(): number;
  /** @ignore */
  _toggleComponentVisibility(): void;
  /** @ignore */
  _showControls(arr: string[]): void;
  /** @ignore */
  _hideControls(arr: string[]): void;
  /** @ignore */
  _updateTag(): void;
  /** @ignore */
  _onCurrentTimeChanged(e: CustomEvent): void;
  /** @ignore */
  _onVideoPOIAdded(e: CustomEvent): void;
  /** @ignore */
  _onVideoPOIRemoved(e: CustomEvent): void;
  /** @ignore */
  _onVideoPOIChanged(e: CustomEvent): void;
  /** @ignore */
  _onVideoPOICfgChanged(e: CustomEvent): void;
  /** @ignore */
  _onVideoChanged(e: CustomEvent): void;
  /** @ignore */
  _find(id: string): any[];
  /** @ignore */
  _addDoubleTapListner(): void;
}

declare namespace Player {
  /** An object representing all available options for an Amadeus Video Player */
  export interface Options {
    /** Required, the thumbnail image to use while the player is idle. Data attribute: poster */    
    poster: string;

    /** Optional,  An ID representiong an Amadeus Video Soultions video. At least one of videoID, source or sources is required to bootsrap a player. Data attribute: data-videoID */
    videoID?: string;
    /** Optional, Is the video ID coming from an external provider. Default value: false. Data attribute: data-external */    
    external?: boolean; 

    /** Optional, a source object to use as medium for this player. At least one of videoID, source or sources is required to bootsrap a player */    
    source?: Source;
    /** Optional, an array of sources object to use as media for this player. At least one of videoID, source or sources is required to bootsrap a player */    
    sources?: Source[];

    /** Optional, a list of controls to display in  the player bar*/        
    controls?: string[];

    /** Optional, the skin to apply to the player. Default value: avs. Data attribute: data-skin*/
    skin?: string;
    /** Optional, the locale to apply to the player. Default value: en_US. Data attribute: data-locale*/
    locale?: string;

    /** Optional, should the player inject seo related metadata into its hosting page. Default value: true */    
    seo?: boolean;
    /** Optional, should the player auto play. Note this behaviour may be blocked by the browser see https://goo.gl/xX8pDD. Default value: false. Data attribute: autoplay */        
    autoplay?:boolean;
    /** Optional, should the player listen to edit command. Default value: false */        
    editable?: boolean;
    /** Optional, should the repeat button be added to the list of controls. Default value: false */        
    repeatable?: boolean;
    /** Optional, should hotkeys be registewred for this video. Default value: false. You can pass a function that will behave as a key down event handler where you can provide your own custom logic  */        
    hotkeys?: boolean | Function;

    /** Optional, an array of Point Of Interest (a.ka. POI). Default value: [] */        
    pois?: POI[];
    /** Optional, an array of Google Anlaytics keys. Player events will be sent to all keys. Default value: [] */    
    analytics?: string[];
    
    /** Optional, the base url of an Amadeus Backend. Property used for development. Allow to target any of the available AMadeus Video Solutions backend including localhost. Default value: https://www.amadeus-video-solutions.com*/    
    amadeusBackend?: string;
    /** Optional, should the player log function calls and events. Note: You will have to enable verbose levels in your devTools to see the logs. Default value: false */    
    debug?:boolean;

    /**Optional, an object describing the branding to be applied to the video */
    brand?:Brand;

    /**Optional, An array of caption  */
    captions?: Caption[];

    /**Optional, the caption language to display by default for this video. this paramater only works with player initialized through video id.
     *           For inline players please set the default property to true for one of your caption, see captions property  */
    defaultCaption?: string;

    /** @ignore  */    
    thumbnailUrl?: string;
    /** @ignore  */    
    player? : any;
    /** @ignore  */    
    dimensions? : any;
    /** @ignore  */    
    callbacks? : { [key:string]: (...args: any[]) => void; }
  }

  /**
   * An Amadeus Video object
   */
  export interface Video {
    /** The id generated by the backend for the video */
    id?: string;
    /** The title of the video */
    title?: string;
    /** The external source for the video */
    source?: string;
    /** The external source for the video */
    original_source?: string;
    /** A list of tags describing the video */
    tags?: string[];
    /** A list of POI appearing in this video */
    video_pois?: POI[];
    /** A list of POI appearing in this video ordered by start time */
    linearized_video_pois?: POI[];
    /** The duration for this video */
    duration?: number;
    /** The user id of this account owning the video */
    producer_id?: string;
    /** A description for this video */
    description?: string;
    /** The date when the video was shot */
    date?: string;
    /** A link to use for the sahre functionality */
    share_link?: string;
    /** An array of caption for the video */
    captions?: any[];
    /** A map of configuration object where each key is a place_id (cf POI) */
    configurations: {
      [key: string]: any;
    };
    /** A map of pictures where each key is a place_id (cf POI) */
    pictures: {
      [key: string]: any;
    };
  }

  /** An object representing all data needed to bootstrap a player */
  export interface VideoDetails {
    /** The video object itself */
    meta: Video;
    /** An array of POI  */
    pois?: POI[];
    /** An array of caption  */
    captions?: Caption[];
    /** A brand description for the video  */
    brand?: Brand;
    /** An array of source  */
    sources: Source[];
    /** The best suited resolution for the player */
    selectedResolution: number;
  }

  /** An object representing a media source*/
  export interface Source {
    /** Required, address of the media resource. */
    src: string;
    /** The MIME-type of the resource, optionally with a codecs parameter. See RFC 4281 for information about how to specify codecs. */
    type?: string;
    /** A label to use in the resoultion switcher menu*/
    label?: string;
    /** @ignore A number represneting the resolution of the source. Infinity for HLS */
    res?: number;
  }
  /** An object representing an Amadeus Video Player Point Of Interest a.k.a POI*/
  export interface POI {
    /** Required, a Google Place ID. See https://developers.google.com/places/place-id */
    place_id: string;
    /** A start time where the POI first appears in the video */
    start_time: number;
    /** An end time where the POI first disappears in the video */
    end_time: number;
    /** A name for the current POI */
    poi_name: string;
    /** Optional, tips for the current POI. Default value: '' */
    tips_description?: string;
    /** Optional, a configuration object for the POI. Default value: {} */
    configuration?: POIConfiguration;
    /** Optional, a list of pictures url for the POI. Default value: [] */
    pictures?: string[];
    /** @ignore */
    poi_id: string;
    /** @ignore */
    time?: number;
    /** @ignore */
    text?: string;
  }
  /** An object representing an Amadeus Video Player Point Of Interest a.k.a POI configuration*/
  export interface POIConfiguration {
    /** Optional, the template type for the POI. Default value: 5. Possible values:  Default : 0, Destination : 1, Hotel : 2, GoingOut : 3, Tour : 4, Mixed : 5 */
    template_type?: number;
    /** Optional, should the overlay use Google Place photos*/
    google_place_photos?: boolean;
    /** Optional, a Call To Action (a.k.a cta) label for the current POI overlay. Default value: '' */
    cta_label?: string;
    /** Optional, a Call To Action (a.k.a cta) url for the current POI overlay. Default value: '' */
    cta_url?: string;
    /** Optional, a zoom level to apply to Google Maps images. Default value: 12 */
    zoomLevel?: number;
    /** Optional, should the overlay be display on top of the playing video or not. Default value: false */
    inline?: boolean;
  }
  export interface Event {
    /**The action linked to this event */
    action: number;
    /**The name of the event */
    action_name: string;
    /** The video id linked to this event */
    rsrc?: string;
    /** A set of metrics and dimensions to forward to Amadeus*/
    event_details: any;
    /**An additional label  */
    label: string;
    /**The url of the hosting page */
    referrer: string;
  }
  /** A video.js caption plugin caption */
  export interface Caption {
    /** @ignore An internal id for this caption */
    id: string;
    /** Required, The type of the caption */
    kind: string;
    /** Required, The display label for this caption */
    label: string;
    /** Required, address of the caption resource. */
    src: string;
    /** Required, language of the caption resource. */
    srclang: string;
    /** Optional, is the caption the default one for the video */
    default?: boolean;
  }
  /** A brand plugin option */
  export interface Brand {
    /** Required, the url of the brand */
    destination: string;
    /** @ignore */
    destinationTarget: string;
    /** Required, the image url of the brand */
    image: string;
    /** Required, a title for the brand image */
    title: string;
  }
}
