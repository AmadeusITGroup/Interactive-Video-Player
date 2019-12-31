import { POI } from "./poi.type";
import { Brand } from "./brand.type";
import { Caption } from "./caption.type";
import { Video } from "./video.type";
import { Source } from "./source.type";

/** An object representing all data needed to bootstrap a player */
export interface VideoDetails {
 /** The video object itself */
 meta:Video;
 /** An array of POI  */
 pois?:POI[];
 /** An array of caption  */
 captions?:Caption[];
 /** A brand description for the video  */
 brand?:Brand;
 /** An array of source  */
 sources:Source[]
 /** The best suited resolution for the player */
 selectedResolution:number
}