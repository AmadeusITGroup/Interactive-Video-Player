/** */
export interface RequestOptions {
  /** The url to request*/
  url: string;
  /** The HHTP method to use */
  method: string;
  /** A map of key/value that will be added as query parameters  */
  params?: { [key:string]:string; };
  /** An object to send along the request */
  body?: any;
  /** A map of key/value that will be added as headers  */
  headers?:{ [key:string]:string; };
  /** A handlewr to call if request fails */
  onerror?: Function;
  /** Should the response be parsed as a JSON object */
  json?:boolean;
};