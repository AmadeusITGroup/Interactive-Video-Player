/** A video.js caption plugin caption */
export interface Caption {
  /** @ignore An internal id for this caption */
  id : string;
  /** Required, The type of the caption */
  kind : string;
  /** Required, The display label for this caption */
  label: string;
  /** Required, address of the caption resource. */
  src: string;
  /** Required, language of the caption resource. */
  srclang: string;
  /** Optional, is the caption the default one for the video */
  default?: boolean;
}