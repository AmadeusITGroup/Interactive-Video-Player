
/** An object representing an Amadeus Video Player Point Of Interest a.k.a POI configuration*/
export interface POIConfiguration {
  /** Optional, the template type for the POI. Default value: 5. Possible values:  Default : 0, Destination : 1, Hotel : 2, GoingOut : 3, Tour : 4, Mixed : 5 */
  template_type?: number;
  /** Optional, should the overlay use Google Place photos*/
  google_place_photos?:boolean;
  /** Optional, a Call To Action (a.k.a cta) label for the current POI overlay. Default value: '' */ 
  cta_label?:string;
  /** Optional, a Call To Action (a.k.a cta) url for the current POI overlay. Default value: '' */ 
  cta_url?:string;
  /** Optional, a zoom level to apply to Google Maps images. Default value: 12 */ 
  zoomLevel?:  number;
  /** Optional, should the overlay be display on top of the playing video or not. Default value: false */ 
  inline?: boolean;
}
