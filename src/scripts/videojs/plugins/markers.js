import videojs from "video.js";
import * as Utils from '../../utils';
import { getDefaultMarkerPluginConfiguration } from "../../utils/marker";
/**@ignore */
const Plugin = videojs.getPlugin('plugin');

const NULL_INDEX = -1;

/**
 * A video.js Plugin that adds the ability display cue points in the progressbar.
 * Based on https://github.com/spchuang/videojs-markers
 */
export class MarkersPlugin extends Plugin {
  
  /**
   * Create an instance of the plugin.
   * 
   * @param {videojs.Player} player A video.js player instance
   * @param {any} options A set of options see http://www.sampingchuang.com/videojs-markers
   */
  constructor(player, options) {
    super(player);
    this.setting = videojs.mergeOptions(getDefaultMarkerPluginConfiguration(), options);
    this.markersMap = {};
    this.markersList  = [];
    this.currentMarkerIndex = NULL_INDEX;
    this.markerTip = null;
    this.breakOverlay = null;
    this.overlayIndex = NULL_INDEX;

    this.player.on("loadedmetadata", () => this.initialize());
  }

  get name() {
    return this._name;
  }

  set name(newName) {
    this._name = newName; 
  }

  sortMarkersList() {
    // sort the list by time in asc order
    this.markersList.sort((a, b) => {
      return this.setting.markerTip.time(a) - this.setting.markerTip.time(b);
    });
  }

  addMarkers(newMarkers) {
    newMarkers.forEach((marker) => {
      marker.key = Utils.uuid();

      this.player.el().querySelector('.vjs-progress-holder')
        .appendChild(this.createMarkerDiv(marker));

      // store marker in an internal hash map
      this.markersMap[marker.key] = marker;
      this.markersList.push(marker);
    })

    this.sortMarkersList();
  }

  getPosition(marker) {
    return (this.setting.markerTip.time(marker) / this.player.duration()) * 100;
  }

  setMarkderDivStyle(marker, markerDiv) {
    markerDiv.className = `vjs-marker ${marker.class || ""}`;

    Object.keys(this.setting.markerStyle).forEach(key => {
      markerDiv.style[key] = this.setting.markerStyle[key];
    });

    // hide out-of-bound markers
    const ratio = marker.time / this.player.duration();
    if (ratio < 0 || ratio > 1) {
      markerDiv.style.display = 'none';
    }

    // set position
    markerDiv.style.left = this.getPosition(marker) + '%';
    if (marker.duration) {
      markerDiv.style.width = (marker.duration / this.player.duration()) * 100 + '%';
      markerDiv.style.marginLeft = '0px';
    } else {
      const markerDivBounding = Utils.getElementBounding(markerDiv);
      markerDiv.style.marginLeft = markerDivBounding.width / 2 + 'px';
    }    
  }

  createMarkerDiv(marker) { 

    var markerDiv = videojs.dom.createEl('div', {}, {
      'data-marker-key': marker.key,
      'data-marker-time': this.setting.markerTip.time(marker)
    });

    this.setMarkderDivStyle(marker, markerDiv);

    // bind click event to seek to marker time
    markerDiv.addEventListener('click', (e) => {
      var preventDefault = false;
      if (typeof this.setting.onMarkerClick === "function") {
        // if return false, prevent default behavior
        preventDefault = this.setting.onMarkerClick(marker) === false;
      }

      if (!preventDefault) {
        var key = markerDiv.getAttribute('data-marker-key');
        this.player.currentTime(this.setting.markerTip.time(this.markersMap[key]));
      }
    });

    if (this.setting.markerTip.display) {
      this.registerMarkerTipHandler(markerDiv);
    }

    return markerDiv;
  }

  updateMarkers(force) {
    // update UI for markers whose time changed
    this.markersList.forEach((marker) => {
      var markerDiv = this.player.el().querySelector(`.vjs-marker[data-marker-key='${marker.key}']`);
      var markerTime = this.setting.markerTip.time(marker);
      var markerAttr = markerDiv.getAttribute('data-marker-time');

      if (force || parseInt(markerAttr, 10) !== markerTime) {
        this.setMarkderDivStyle(marker, markerDiv);
        markerDiv.setAttribute('data-marker-time', `${markerTime}`);
      }
    });
    this.sortMarkersList();
  }

  removeMarkers(indexArray) {
    // reset overlay
    if (!!this.breakOverlay){
      this.overlayIndex = NULL_INDEX;
      this.breakOverlay.style.visibility = "hidden";
    }
    this.currentMarkerIndex = NULL_INDEX;

    let deleteIndexList = [];
    indexArray.forEach((index) => {
      let marker = this.markersList[index];
      if (marker) {
        // delete from memory
        delete this.markersMap[marker.key];
        deleteIndexList.push(index);

        // delete from dom
        let el = this.player.el().querySelector(`.vjs-marker[data-marker-key='${marker.key}']`);
        el && el.parentNode.removeChild(el);
      }
    });

    // clean up markers array
    deleteIndexList.reverse();
    deleteIndexList.forEach((deleteIndex) => {
      this.markersList.splice(deleteIndex, 1);
    });

    // sort again
    this.sortMarkersList();
  }

  // attach hover event handler
  registerMarkerTipHandler(markerDiv) {
    markerDiv.addEventListener('mouseover', () => {
      var marker = this.markersMap[markerDiv.getAttribute('data-marker-key')];
      if (!!this.markerTip) {
        const tipInner = this.markerTip.querySelector('.vjs-tip-inner');
        tipInner.innerText = this.setting.markerTip.text(marker);
        // margin-left needs to minus the padding length to align correctly with the marker
        this.markerTip.style.left = `${this.getPosition(marker)}%`;
        var markerTipBounding = Utils.getElementBounding(this.markerTip);
        var markerDivBounding = Utils.getElementBounding(markerDiv);
        var playerBounding = Utils.getElementBounding(this.player.el());

        var anchor = markerDivBounding.x + markerDivBounding.width / 2;
        var halfTip = markerTipBounding.width / 2;
        var quarterMarker = markerDivBounding.width / 4;
        var marginLeft = 0;
        this.markerTip.className = 'vjs-tip aligned-right';
        if (anchor - halfTip > playerBounding.x) {
          this.markerTip.className = 'vjs-tip';
          marginLeft = -(markerTipBounding.width / 2) + quarterMarker;
        }
        if (anchor + halfTip > playerBounding.x + playerBounding.width) {
          this.markerTip.className = 'vjs-tip aligned-left';
          marginLeft = -markerTipBounding.width + markerDivBounding.width / 2
        }
      
        this.markerTip.style.marginLeft = marginLeft + 'px';
        this.markerTip.style.visibility = 'visible';
      }
    });

    markerDiv.addEventListener('mouseout',() => {
      if (!!this.markerTip) {
        this.markerTip.style.visibility = "hidden";
      }
    });
  }

  initializeMarkerTip() {
    this.markerTip = videojs.dom.createEl('div', {
      className: 'vjs-tip',
      innerHTML: "<div class='vjs-tip-arrow'></div><div class='vjs-tip-inner'></div>",
    });
    this.player.el().querySelector('.vjs-progress-holder').appendChild(this.markerTip);
  }

  // show or hide break overlays
  updateBreakOverlay() {
    if (!this.setting.breakOverlay.display || this.currentMarkerIndex < 0) {
      return;
    }

    var currentTime = this.player.currentTime();
    var marker = this.markersList[this.currentMarkerIndex];
    var markerTime = this.setting.markerTip.time(marker);

    if (
      currentTime >= markerTime &&
      currentTime <= (markerTime + this.setting.breakOverlay.displayTime)
    ) {
      if (this.overlayIndex !== this.currentMarkerIndex) {
        this.overlayIndex = this.currentMarkerIndex;
        if (this.breakOverlay) {

          this.breakOverlay.querySelector('.vjs-break-overlay-text').innerHTML = this.setting.breakOverlay.text(marker);
        }
      }

      if (this.breakOverlay) {
        this.breakOverlay.style.visibility = "visible";
      }
    } else {
      this.overlayIndex = NULL_INDEX;
      if (this.breakOverlay) {
        this.breakOverlay.style.visibility = "hidden";
      }
    }
  }

  // problem when the next marker is within the overlay display time from the previous marker
  initializeOverlay() {
    this.breakOverlay = videojs.dom.createEl('div', {
      className: 'vjs-break-overlay',
      innerHTML: "<div class='vjs-break-overlay-text'></div>"
    });
    Object.keys(this.setting.breakOverlay.style).forEach(key => {
      if (this.breakOverlay) {
        this.breakOverlay.style[key] = this.setting.breakOverlay.style[key];
      }
    });
    this.player.el().appendChild(this.breakOverlay);
    this.overlayIndex = NULL_INDEX;
  }

  onTimeUpdate() {
    this.onUpdateMarker();
    this.updateBreakOverlay();
    this.setting.onTimeUpdateAfterMarkerUpdate && this.setting.onTimeUpdateAfterMarkerUpdate();
  }

  onUpdateMarker() {
    /*
      check marker reached in between markers
      the logic here is that it triggers a new marker reached event only if the player
      enters a new marker range (e.g. from marker 1 to marker 2). Thus, if player is on marker 1 and user clicked on marker 1 again, no new reached event is triggered)
    */
    if (!this.markersList.length) {
      return;
    }

    var getNextMarkerTime = (index) => {
      if (index < this.markersList.length - 1) {
        return this.setting.markerTip.time(this.markersList[index + 1]);
      }
      // next marker time of last marker would be end of video time
      return this.player.duration();
    }
    var currentTime = this.player.currentTime();
    var newMarkerIndex = NULL_INDEX;
    var nextMarkerTime;
    if (this.currentMarkerIndex !== NULL_INDEX) {
      // check if staying at same marker
      nextMarkerTime = getNextMarkerTime(this.currentMarkerIndex);
      if(
        currentTime >= this.setting.markerTip.time(this.markersList[this.currentMarkerIndex]) &&
        currentTime < nextMarkerTime
      ) {
        return;
      }

      // check for ending (at the end current time equals player duration)
      if (
        this.currentMarkerIndex === this.markersList.length - 1 &&
        currentTime === this.player.duration()
      ) {
        return;
      }
    }

    // check first marker, no marker is selected
    if (currentTime < this.setting.markerTip.time(this.markersList[0])) {
      newMarkerIndex = NULL_INDEX;
    } else {
      // look for new index
      for (var i = 0; i < this.markersList.length; i++) {
        nextMarkerTime = getNextMarkerTime(i);
        if (
          currentTime >= this.setting.markerTip.time(this.markersList[i]) &&
          currentTime < nextMarkerTime
        ) {
          newMarkerIndex = i;
          break;
        }
      }
    }

    // set new marker index
    if (newMarkerIndex !== this.currentMarkerIndex) {
      // trigger event if index is not null
      if (newMarkerIndex !== NULL_INDEX && this.setting.onMarkerReached) {
        this.setting.onMarkerReached(this.markersList[newMarkerIndex], newMarkerIndex);
      }
      this.currentMarkerIndex = newMarkerIndex;
    }
  }

  // setup the whole thing
  initialize() {
    if (this.setting.markerTip.display) {
      this.initializeMarkerTip();
    }

    // remove existing markers if already initialized
    this.removeAll();
    this.addMarkers(this.setting.markers);

    if (this.setting.breakOverlay.display) {
      this.initializeOverlay();
    }
    this.onTimeUpdate();
    this.player.on("timeupdate", () => this.onTimeUpdate());
    this.player.off("loadedmetadata");
  }

  getMarkers () { return this.markersList; }
  next() {
    // go to the next marker from current timestamp
    const currentTime = this.player.currentTime();
    for (var i = 0; i < this.markersList.length; i++) {
      var markerTime = this.setting.markerTip.time(this.markersList[i]);
      if (markerTime > currentTime) {
        this.player.currentTime(markerTime);
        break;
      }
    }
  }
  
  prev() {
    // go to previous marker
    const currentTime = this.player.currentTime();
    for (var i = this.markersList.length - 1; i >= 0 ; i--) {
      var markerTime = this.setting.markerTip.time(this.markersList[i]);
      // add a threshold
      if (markerTime + 0.5 < currentTime) {
        this.player.currentTime(markerTime);
        return;
      }
    }
  }
  add(newMarkers) { this.addMarkers(newMarkers)}
  remove(indexArray) { this.removeMarkers(indexArray)}
  removeAll() {
    var indexArray = [];
    for (var i = 0; i < this.markersList.length; i++) {
      indexArray.push(i);
    }
    this.removeMarkers(indexArray);
  }
      
  updateTime(force) { this.updateMarkers(force)}
  reset(newMarkers) {
    // remove all the existing markers and add new ones
    this.removeAll();
    this.addMarkers(newMarkers);
  }

  dispose () {
    // unregister the plugins and clean up even handlers
    this.removeAll();
    if(this.breakOverlay) {
      this.breakOverlay.remove();
    }
    if(this.markerTip) {
      this.markerTip.remove();
    }
    this.player.off("timeupdate", this.updateBreakOverlay);
    delete this.player.markers;
  }
}