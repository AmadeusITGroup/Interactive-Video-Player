import { VideoDetails } from "../types/video-details.type";

/**
 * A VideoService interface. 
 */
export interface VideoService {
  /**
   * Get all needed data to boostrap an Amadeus Video Player. 
   * @return {Promise<VideoDetails>}
   */
  getData():Promise<VideoDetails>;
}