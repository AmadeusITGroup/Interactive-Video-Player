import ApiManager from '../api/manager';

/**
 * A service that expose all the skining system SAAS variables to JavaScript.
 */
export class SkinService {

  constructor() {
    this.skin = { variables : {}};
    this.registeredCallbacks = [];
    this.initialized = false;
  }

  /**
   * Set the skin for the invocation onward.
   * @param {string} skin The name of the skin
   */
  initialize(skin) {
    this.skin = { variables : {}};
    ApiManager.getSkin(skin).then(res => {
      const data = res.response;
      if (data) {
        const entries = data.split(/\n/gi);
        entries.map(this.extract).reduce((accumulator, keyValue) => {
          if(keyValue !==  null) {
            accumulator.push(keyValue);
          }
        return accumulator;
        }, []).forEach(keyValue => {
          this.skin.variables[keyValue.key] = keyValue.value;
        });
        const keys = Object.keys(this.skin.variables);
        if(keys.length) {
          this._onReady();
        } else {
          this._onReady(new Error(`${skin} does not expose varibales`));
        }
      } else {
        this._onReady(new Error(`${skin} does not expose varibales`));
      }
    }).catch(() => {
      this._onReady(new Error(`${skin} does not exist`));
    });
  }

  /**
   * Get a skin value for the provide key
   * @param {string | null} key 
   */
  getValue(key) {
    return this.skin.variables[key] || null;
  }

  /**@ignore */
  extract(entry) {
    let res = null;
    const match = entry.match(/^([^:]*):(.*)$/);
    if(match && match.length === 3) {
      res = {
        key : match[1].trim(),
        value : match[2].trim().replace(/,+$/, '')
      };
    }
    return res;
  }

  /**
   * Return a promise that will resolve once the service is ready.
   * If the ready event has already happened it will resolve the promise immediately.
   *
   * @param fn 
   *        Function to be called when player is ready
   */
  ready() {
    if(this.initialized) {
      return Promise.resolve(this.unsupported);
    } else {
      return new Promise((resolve, reject) => { this.registeredCallbacks.push({resolve:resolve, reject:reject})});
    }
  }

  /** @ignore */
  _onReady(error) {
    this.initialized = true;
    this.registeredCallbacks.forEach(p => { 
      typeof error !== 'undefined' ? p.reject(error) : p.resolve();
    });
    this.registeredCallbacks = [];
  }
}

export default new SkinService();