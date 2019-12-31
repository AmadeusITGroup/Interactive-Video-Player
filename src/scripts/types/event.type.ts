/** An object representing an Amadeus Video Solutions event */
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
  
