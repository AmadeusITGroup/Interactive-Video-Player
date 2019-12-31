import videojs from "video.js";
/**@ignore */
const Plugin = videojs.getPlugin('plugin');
/**@ignore */
const Button = videojs.getComponent('Button');

/**
 * A video.js Plugin that adds the ability to repeat a video.
 */
export class RepeatPlugin extends Plugin {

  /**
   * Create an instance of the plugin.
   * 
   * @param {videojs.Player} player A video.js player instance
   * @param {any} options An options object describing if the repeat mode is active {active : true} or not.
   */
  constructor(player, options) {
    super(player);
    const repeatButton = new RepeatButton(player, options);
    player.ready(() => {
      player.getChild('controlBar').addChild(repeatButton, {}, 12);
      player.repeat = options.active;
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
class RepeatButton extends Button {
  constructor(player, options) {
    options.name = 'RepeatButton';
    super(player, options);
    this.on(player, ['repeat'], this.update);
    this.on(player, ['ended'], this.onVideoEnded);
    this.controlText('Repeat off');
    this.player_ = player;
    const _this = this;
    Object.defineProperty(player, 'repeat', {
      get() { return _this.repeat; },
      set(newValue) { _this.repeat = newValue; },
      enumerable: true,
      configurable: true
    });
  }

  buildCSSClass() {
    return 'vjs-repeat-control vjs-control vjs-button off';
  }

  handleClick () {
    this.player_.repeat = !this.player_.repeat;
    this.player_.trigger('repeat');
  }

  update (event) {
    this.updateIcon();
    this.updateText();
  }

  updateIcon() {
    if (this.player_.repeat) {
      this.el().classList.remove('off');
    } else {
      this.el().classList.add('off');      
    }
  }

  updateText(event) {
    this.controlText(this.player_.repeat ? 'Repeat on' : 'Repeat off');
  }

  onVideoEnded() {
    if (this.player_.repeat) {
      this.player_.play();
    }
  }
}