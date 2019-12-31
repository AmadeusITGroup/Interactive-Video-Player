import videojs from "video.js";
/**@ignore */
const Plugin = videojs.getPlugin('plugin');
/**@ignore */
const Button = videojs.getComponent('Button');

import * as Utils from '../../utils';

/**
 * A video.js Plugin that adds the ability to enter "fake" fullscreen on iOS.
 * On iOS requesting for "real" fullscreen will automatically switch to the built-in video player, that lacks all interactivity.
 * For obvious reasons this is not what we want hence this plugin.
 * 
 * Entering "fake" fullscreen mostly means that the following CSS rules will be applied to the player's dom element :
 * 
 * .fullscreen {
 *   position:static; 
 *   top:0; 
 *   right:0; 
 *   bottom:0; 
 *   left:0; 
 *   z-index:2147483647;
 * } 
 */
export class IOSFullscreenPlugin extends Plugin {
  /**
   * Create an instance of the plugin.
   * 
   * @param {videojs.Player} player A video.js player instance
   * @param {any} options A set of options
   */
  constructor(player, options) {
    super(player);

    this.playerEl = player.el().closest('*[data-is="avs-player"]');

    this.hammerManager = new Hammer.Manager(this.playerEl);
    this.swipe = new Hammer.Swipe();
    this.hammerManager.add([this.swipe]);

    this.anchorEl = this.playerEl.parentNode;
    this.meta_ = null;

    const _this = this;
    Object.defineProperty(player, 'iosFullscreen_', {
      get() { return _this.iosFullscreen_; },
      set(newValue) { 
        _this.iosFullscreen_ = newValue;
        _this.player.trigger('fullscreenchange');
      },
      enumerable: true,
      configurable: true
    });
    this.iosFullscreenButton = new IOSFullscreenButton(player, options);
    const skin = options.opts.skin || 'avs'
    this.theme = `theme-${skin}`;
    player.ready(() => {
      if(Utils.isMobile() && Utils.isiOSDevice()) {
        player.getChild('controlBar').addChild(this.iosFullscreenButton);
        player.iosFullscreen_ = options.active;
      } else {
        player.iosFullscreen_ = false;
      }
    });
    this.on(player, ['ended'], this.onVideoEnded);
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = newName; 
  }

  isFullscreen() {
    return this.player.iosFullscreen_;
  }

  requestFullscreen() {
    this.iosFullscreenButton.update();
    document.body.classList.add('avs-fullscreen');
    document.body.classList.add(this.theme);
    document.body.appendChild(this.playerEl);
    this.player.iosFullscreen_ = true;
    this.hammerManager.on('swipedown', () => this.exitFullscreen());
    this._addViewportMetaTag();

  }

  exitFullscreen() {
    this.iosFullscreenButton.update();
    document.body.classList.remove('avs-fullscreen');
    document.body.classList.remove(this.theme);
    this.anchorEl.appendChild(this.playerEl);
    this.player.iosFullscreen_ = false;
    this.hammerManager.off("pinch");
    this._removeViewportMetaTag();

  }

  toggleFullscreen() {
    this.player.iosFullscreen_ = !this.player.iosFullscreen_;
    if(this.player.iosFullscreen_) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }
  }


  onVideoEnded() {
    this.exitFullscreen();
  }

  _addViewportMetaTag() {
    try {
      this.meta_ = document.createElement('meta');
      this.meta_.name = 'viewport';
      this.meta_.setAttribute('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      document.querySelector('head').appendChild(this.meta_);
    } catch (e) {
      console.warn('Unable to add viewport meta tag');
    }
  }

  _removeViewportMetaTag() {
    try {
      if(this.meta_){
        document.querySelector('head').removeChild(this.meta_);
      }
    } catch(e) {}
  }
}

/**@ignore */
class IOSFullscreenButton extends Button {
  constructor(player, options) {
    options.name = 'IOSFullscreenButton';
    super(player, options); 
    this.on(player, ['iosFullscreen_'], this.update);
    this.controlText('Fullscreen off');
  }

  buildCSSClass() {
    return 'vjs-fullscreen-control vjs-control vjs-ios-control vjs-button';
  }

  handleClick () {
    this.player_.iosFullscreen().toggleFullscreen();
  }

  update () {
    this.updateIcon();
    this.updateText();
  } 

  updateIcon() {
    if (this.player_.iosFullscreen_) {
      this.el().classList.add('on');
    } else {
      this.el().classList.remove('on');
    }
  }

  updateText(event) {
    this.controlText(this.player_.iosFullscreen_ ? 'Fullscreen on' : 'Fullscreen off');
  }
}