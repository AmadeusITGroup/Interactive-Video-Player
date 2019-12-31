import videojs from "video.js";
/**@ignore */
const Plugin = videojs.getPlugin('plugin');
/**@ignore */
const Button = videojs.getComponent('Button');

/**
 * A video.js Plugin that adds the ability to repeat a video.
 */
export class SharePlugin extends Plugin {

  /**
   * Create an instance of the plugin.
   * 
   * @param {videojs.Player} player A video.js player instance
   * @param {any} options An options object describing if the repeat mode is active {active : true} or not.
   */
  constructor(player, options) {
    
    super(player);

    const shareButton = new ShareButton(player, options);
    player.ready(() => {
      player.getChild('controlBar').addChild(shareButton, {}, 12);
    });
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = newName; 
  }
}

/**@ignore */
class ShareButton extends Button {
  constructor(player, options) {
    super(player, options);
    options.name = 'ShareButton';
    this.controlText('Share');
    this.player_ = player;
    let fn = () => console.warn('No callback specified for share click');
    if(options.hasOwnProperty('callback')) {
      fn = options.callback;
    }
    this.callback_ = fn;
  }

  buildCSSClass() {
    return 'vjs-share-control vjs-control vjs-button';
  }

  handleClick () {
    this.callback_();
    this.player_.trigger('share');
  }
}