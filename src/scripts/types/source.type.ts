
/** An object representing a media source*/
export interface Source {
  /** Required, address of the media resource. */ 
  src: string;
  /** The MIME-type of the resource, optionally with a codecs parameter. See RFC 4281 for information about how to specify codecs. */ 
  type?: string;

  /** A label to use in the resoultion switcher menu*/ 
  label?: string;

  /** @ignore A number represneting the resolution of the source. Infinity for HLS */ 
  res?:number
}