import videojs from "video.js";
/**@ignore */
const Plugin = videojs.getPlugin('plugin');
/**@ignore */
const Button = videojs.getComponent('Button');

import * as Utils from '../../utils';

/**
 * A video.js Plugin that adds branding to the player ControlBar.
 */
export class BrandPlugin extends Plugin {
  /**
   * Create an instance of the plugin.
   * 
   * @param {videojs.Player} player A video.js player instance
   * @param {Brand} options An options object describing the branding.
   */
  constructor(player, options) {
    super(player);
    const brandButton = new BrandButton(player, options);
    player.ready(() => {
      player.getChild('controlBar').addChild(brandButton, {}, 12);
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
class BrandButton extends Button {
  constructor(player, options) {
    options.name = 'BrandButton';

    super(player, options);
    const html = `<a href="${options.destination}" class="watermark" target="${options.destinationTarget}" style="background:${options.image}"></a>`;
    this.el().appendChild(Utils.htmlToElement(html));
    this.controlText(options.title);
  }

  buildCSSClass() {
    return 'vjs-brand-control vjs-control vjs-button';
  }
}