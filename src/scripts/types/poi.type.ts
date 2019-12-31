import {POIConfiguration} from './poi-configuration.type';

/** An object representing an Amadeus Video Player Point Of Interest a.k.a POI*/
export interface POI {
  /** Required, a Google Place ID. See https://developers.google.com/places/place-id */    
  place_id: string;
  /** A start time where the POI first appears in the video */  
  start_time: number;
  /** An end time where the POI first disappears in the video */ 
  end_time?: number;
  /** A name for the current POI */ 
  poi_name: string;

  /** Optional, tips for the current POI. Default value: '' */ 
  tips_description?: string;
  /** Optional, a configuration object for the POI. Default value: {} */ 
  configuration?: POIConfiguration;
  /** Optional, a list of pictures url for the POI. Default value: [] */ 
  pictures?:string[];

  /** @ignore */    
  poi_id?: string;
  /** @ignore */
  time?: number;
  /** @ignore */
  text?: string;
}
