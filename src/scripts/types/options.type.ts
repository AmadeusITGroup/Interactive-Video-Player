import { Brand } from './brand.type';
import { Caption } from './caption.type';
import { POI } from './poi.type';
import { Source } from './source.type';



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
  /** Optional, should the overlay be shown when the player is paused. If set to true video cursor display an explore text. Default value: true */    
  overlayOnPause?:boolean;

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