/**
 * A service that handles the bridge between webpack defined property and the application
 */
export class ConfigurationService {
  constructor() {
    this.cfg =  {
      MAIN_SERVER : process.env.MAIN_SERVER,
      VIMEO_API_KEY : process.env.VIMEO_API_KEY,
      DEFAULT_VIDEO_ID : process.env.DEFAULT_VIDEO_ID,
      API_KEY : process.env.API_KEY,
      GOOGLE_MAP_API_KEY : process.env.GOOGLE_MAP_API_KEY,
      GOOGLE_ANALYTICS_TRACKING_CODE : process.env.GOOGLE_ANALYTICS_TRACKING_CODE,
      IP_STACK_API_KEY : process.env.IP_STACK_API_KEY
    }; 
  }

  /**
   * Set a value for the given key
   * @param {string} key 
   * @param {any} value 
   */
  setValue(key, value) {
    if(typeof value !== 'string') {
      console.warn('Configuration service only allows setting of string values.');
    } else {
      this.cfg[key] = value;
    }
  }

  /**
   * Returns the configuration value for a given key
   * @param {string} key 
   * @return {string|null} The value for the given key
   */
  getValue(key) {
    return this.cfg.hasOwnProperty(key) ? this.cfg[key] : null;
  }
}

export default new ConfigurationService();