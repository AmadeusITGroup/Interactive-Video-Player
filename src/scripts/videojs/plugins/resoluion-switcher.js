import videojs from "video.js";
/**@ignore */
const Plugin = videojs.getPlugin('plugin');
/**@ignore */
const MenuItem = videojs.getComponent('MenuItem');
/**@ignore */
const MenuButton = videojs.getComponent("MenuButton");

/**@ignore */
var defaults = {},
  currentResolution = {}, // stores current resolution
  menuItemsHolder = {}; // stores menuItems

/**@ignore */
function setSourcesSanitized(player, sources, label, customSourcePicker) {
currentResolution = {
    label: label,
    sources: sources
  };
  if (typeof customSourcePicker === "function") {
    return customSourcePicker(player, sources, label);
  }
  /* DECEiFER: Modified for video.js 6.x */
  player.src(
    sources.map((src) =>{
      return { src: src.src, type: src.type, res: src.res };
    })
  );
  return player;
}

/**@ignore */
class ResolutionMenuItem extends MenuItem {
  constructor(player, options, onClickListener, label) {
    super(player, options);
    this.onClickListener = onClickListener;
    this.label = label;
    this.src = options.src;

    this.on("click", this.onClick);
    this.on("touchstart", this.onClick);

    if (options.initialySelected) {
      this.showAsLabel();
      this.selected(true);

      this.addClass("vjs-selected");
    }
  }

  showAsLabel() {
    // Change menu button label to the label of this item if the menu button label is provided
    if (this.label) {
      this.label.innerHTML = this.options_.label;
    }
  }

  onClick(customSourcePicker) {
    this.onClickListener(this);
    // Remember player state
    var currentTime = this.player_.currentTime();
    var isPaused = this.player_.paused();
    this.showAsLabel();

    // add .current class
    this.addClass("vjs-selected");

    // Hide bigPlayButton
    if (!isPaused) {
      this.player_.bigPlayButton.hide();
    }
    if (
      typeof customSourcePicker !== "function" &&
      typeof this.options_.customSourcePicker === "function"
    ) {
      customSourcePicker = this.options_.customSourcePicker;
    }
    // Change player source and wait for loadeddata event, then play video
    // loadedmetadata doesn't work right now for flash.
    // Probably because of https://github.com/videojs/video-js-swf/issues/124
    // If player preload is 'none' and then loadeddata not fired. So, we need timeupdate event for seek handle (timeupdate doesn't work properly with flash)
    var handleSeekEvent = "loadeddata";
    if (
      this.player_.techName_ !== "Flash"
    ) {
      handleSeekEvent = "timeupdate";
    }
    setSourcesSanitized(
      this.player_,
      this.src,
      this.options_.label,
      customSourcePicker
    ).one(handleSeekEvent, () => {
      this.player_.currentTime(currentTime);
      this.player_.handleTechSeeked_();
      if (!isPaused) {
        // Start playing and hide loadingSpinner (flash issue ?)
        /* DECEiFER: Modified for video.js 6.x */
        this.player_.play();
        this.player_.handleTechSeeked_();
      }
      this.player_.trigger("resolutionchange");
    });
  }
}

/**@ignore */
class ResolutionMenuButton extends MenuButton {
  constructor(player, options, settings, label) {
    options.name = 'ResolutionMenuButton';

    super(player, options);
    this.sources = options.sources;
    this.label = label;
    this.label.innerHTML = options.initialySelectedLabel;
    // Sets this.player_, this.options_ and initializes the component
    MenuButton.call(this, player, options, settings);
    this.controlText("Quality");

    if (settings.dynamicLabel) {
      this.el().appendChild(label);
    } else {
      var staticLabel = document.createElement("span");
      /* DECEiFER: Modified for video.js 6.x */
      videojs.dom.addClass(staticLabel, "vjs-resolution-button-staticlabel");
      this.el().appendChild(staticLabel);
    }
  }

  createItems() {
    var menuItems = [];
    var labels = (this.sources && this.sources.label) || {};
    var onClickUnselectOthers = (clickedItem) => {
      menuItems.map((item) => {
        item.selected(item === clickedItem);
        item.removeClass("vjs-selected");
      });
    };

    for (var key in labels) {
      if (labels.hasOwnProperty(key)) {
        menuItems.push(
          new ResolutionMenuItem(
            this.player_,
            {
              label: key,
              src: labels[key],
              initialySelected: key === this.options_.initialySelectedLabel,
              customSourcePicker: this.options_.customSourcePicker
            },
            onClickUnselectOthers,
            this.label
          )
        );
        // Store menu item for API calls
        menuItemsHolder[key] = menuItems[menuItems.length - 1];
      }
    }
    return menuItems;
  }
}

/**
 * A video.js Plugin that adds the ability to select the video quality in video.js player.
 * Based on https://github.com/kmoskwiak/videojs-resolution-switcher
 */
export class ResolutionSwitcherPlugin extends Plugin {

  /**
   * Create an instance of the plugin.
   * 
   * @param {videojs.Player} player A video.js player instance
   * @param {any} options A set of options see https://github.com/kmoskwiak/videojs-resolution-switcher#plugin-options
   */
  constructor(player, options) {
    super(player);
    this.settings = videojs.mergeOptions(defaults, options);
    this.label = document.createElement("span");
    this.groupedSrc = {};
    /* DECEiFER: Modified for video.js 6.x */
    videojs.dom.addClass(this.label, "vjs-resolution-button-label");
    this.extendPlayer();

    player.ready(() => {
      if (player.options_.sources.length > 1) {
        // tech: Html5 and Flash
        // Create resolution switcher for videos form <source> tag inside <video>
        player.updateSrc(player.options_.sources);
      }
    });
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = newName; 
  }

  /** @ignore */
  extendPlayer() {
    /**
     * Updates player sources or returns current source URL
     * @param   {Array}  [src] array of sources [{src: '', type: '', label: '', res: ''}]
     * @returns {Object|String|Array} videojs player object if used as setter or current source URL, object, or array of sources
     */
    this.player.updateSrc = (src) => {
      //Return current src if src is not given
      if (!src) {
        return this.player.src();
      }
      // Dispose old resolution menu button before adding new sources
      if (this.player.controlBar.resolutionSwitcher) {
        this.player.controlBar.resolutionSwitcher.dispose();
        delete this.player.controlBar.resolutionSwitcher;
      }
      //Sort sources
      src = src.sort(this.compareResolutions);
      this.groupedSrc = this.bucketSources(src);
      var choosen = this.chooseSrc(this.groupedSrc, src);
      var menuButton = new ResolutionMenuButton(
        this.player,
        {
          sources: this.groupedSrc,
          initialySelectedLabel: choosen.label,
          initialySelectedRes: choosen.res,
          customSourcePicker: this.settings.customSourcePicker
        },
        this.settings,
        this.label
      );
      /* DECEiFER: Modified for video.js 6.x */
      videojs.dom.addClass(menuButton.el(), "vjs-resolution-button");
      this.player.getChild('controlBar').addChild(menuButton, {}, 12);
      return setSourcesSanitized(this.player, choosen.sources, choosen.label);
    };

    /**
     * Returns current resolution or sets one when label is specified
     * @param {String}   [label]         label name
     * @param {Function} [customSourcePicker] custom function to choose source. Takes 3 arguments: player, sources, label. Must return player object.
     * @returns {Object}   current resolution object {label: '', sources: []} if used as getter or player object if used as setter
     */
    this.player.currentResolution = (label, customSourcePicker) => {
      if (label == null) {
        return currentResolution;
      }
      if (menuItemsHolder[label] != null) {
        menuItemsHolder[label].onClick(customSourcePicker);
      }
      return this.player;
    };

    /**
     * Returns grouped sources by label, resolution and type
     * @returns {Object} grouped sources: { label: { key: [] }, res: { key: [] }, type: { key: [] } }
     */
    this.player.getGroupedSrc = () => {
      return this.groupedSrc;
    };
  }

  /**
   * @ignore
   * Method used for sorting list of sources
   * @param   {Object} a - source object with res property
   * @param   {Object} b - source object with res property
   * @returns {Number} result of comparation
   */
  compareResolutions(a, b) {
    if (!a.res || !b.res) {
      return 0;
    }
    return +b.res - +a.res;
  }

  /**
   * @ignore
   * Group sources by label, resolution and type
   * @param   {Array}  src Array of sources
   * @returns {Object} grouped sources: { label: { key: [] }, res: { key: [] }, type: { key: [] } }
   */
  bucketSources(src) {
    var resolutions = {
      label: {},
      res: {},
      type: {}
    };
    src.map((source) => {
      this.initResolutionKey(resolutions, "label", source);
      this.initResolutionKey(resolutions, "res", source);
      this.initResolutionKey(resolutions, "type", source);

      this.appendSourceToKey(resolutions, "label", source);
      this.appendSourceToKey(resolutions, "res", source);
      this.appendSourceToKey(resolutions, "type", source);
    });
    return resolutions;
  }

  /**@ignore */
  initResolutionKey(resolutions, key, source) {
    if (resolutions[key][source[key]] == null) {
      resolutions[key][source[key]] = [];
    }
  }

  /**@ignore */
  appendSourceToKey(resolutions, key, source) {
    resolutions[key][source[key]].push(source);
  }

  /**
   * @ignore
   * 
   * Choose src if option.default is specified
   * @param   {Object} groupedSrc {res: { key: [] }}
   * @param   {Array}  src Array of sources sorted by resolution used to find high and low res
   * @returns {Object} {res: string, sources: []}
   */
  chooseSrc(groupedSrc, src) {
    var selectedRes = this.settings["default"]; // use array access as default is a reserved keyword
    var selectedLabel = "";
    if (selectedRes === "high") {
      selectedRes = src[0].res;
      selectedLabel = src[0].label;
    } else if (
      selectedRes === "low" ||
      selectedRes == null ||
      !groupedSrc.res[selectedRes]
    ) {
      // Select low-res if default is low or not set
      selectedRes = src[src.length - 1].res;
      selectedLabel = src[src.length - 1].label;
    } else if (groupedSrc.res[selectedRes]) {
      selectedLabel = groupedSrc.res[selectedRes][0].label;
    }

    return {
      res: selectedRes,
      label: selectedLabel,
      sources: groupedSrc.res[selectedRes]
    };
  }
}