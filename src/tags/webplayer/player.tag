<avs-player class={"ios": ios, "editable": editable}>
  <div if={!isUnsupported()} id={'player-'+playerId} class="player-container fill-height">
    <avs-header player={player} marker={marker} video={video_id} likes={likes}
                                    if={played && !editable}
                                    user={user}/>
    <div class="fill-height">
      <video id={'video-'+playerId} class="video-js vjs-big-play-centered fill-height" controls preload="auto" poster webkit-playsinline playsinline crossOrigin="anonymous">
        <p class="vjs-no-js">
          <localize>player.error.support</localize>
        </p>
      </video>
      <div id={'overlays-'+playerId} class="overlays-wrapper">
        <canvas width={this.width} height={opts.height} class="overlay-blurred" />
        <avs-template player={player} marker={marker} cfg={getMarkerCfg()} editable={editable} 
                            class={"overlay-template":true, "inline" : isInlineTemplate()}/>
        <avs-share player={player} marker={marker} class="overlay-share" if={!editable}/>

        <avs-requierement  player={player} class={"overlay-requierement":true}/>
        <avs-tutorial class={"overlay-tutorial-wrapper":true, "visible": firstTime && played && !requierement.visible && marker}/>
      </div>
    </div>

    <div class="video-js loader" if={!played}>
      <img src={thumbnailUrl}  onclick={playRequest}/>
      <button class="vjs-big-play-button" type="button" onclick={playRequest}>
        <span class="vjs-icon-placeholder"></span>
      </button>
    </div>
  </div>
  <div if={isUnsupported()} class="player-container player-container-error">
    <div class= "error-message" if={player.unsupported === 1}>
      <localize>player.error.cookies</localize>
    </div>
     <div class= "error-message" if={player.unsupported > 1}>
      <localize>player.error.unsupportedVideo</localize>
    </div>
  </div>

  
  <script type="es6">
    import * as Utils from "../../scripts/utils";
    import EventService from "../../scripts/events/service";
    import {Events} from "../../scripts/events/list";

    import SkinService from "../../scripts/skin/service";

    import ConfigurationService from "../../scripts/configuration/service";
    import Environment from "../../scripts/enums/environment";

    import "../i18n/localize.tag";
    import "./header.tag";
    import "./tutorial.tag";
    import "./requierement.tag";
    import "./share.tag";
    import "./template.tag";

    this.video_id = opts.videoID;
    this.thumbnailUrl = !this.opts.hasOwnProperty('external') || !this.opts.external ? 
      `${ConfigurationService.getValue(Environment.MAIN_SERVER)}/api/video/picture/${this.video_id}?t=${Date.now()}` :
      `${ConfigurationService.getValue(Environment.MAIN_SERVER)}/api/video/picture/external/${this.video_id}?t=${Date.now()}` ;
    if( opts.thumbnailUrl)  {
       this.thumbnailUrl = opts.thumbnailUrl;
    }
    const skin = opts.skin || 'avs';
    SkinService.initialize(opts.skin || 'avs');


    this.editable = opts.hasOwnProperty('editable') ? opts.editable: false;
    this.autoplay = opts.hasOwnProperty('autoplay') ? opts.autoplay: false;
    this.overlayOnPause = opts.hasOwnProperty('overlayOnPause') ? opts.overlayOnPause: true;

    this.ios = Utils.isiOSDevice();
    
    this.playerId = opts.id || Utils.uuid();
    this.firstTime = false;

    this.played = false;
    this.ended = false;
    this.initialized = false;

    this.timer = null;

    this.marker = null;

    this.startPlaytime = 0;
    this.startPanelTime = 0;
    this.firstPlay = true;
    this.hasError = false;

    this.template = {visible:false};
    this.share = {visible:false};
    this.requierement = {visible:false};

    this.videoCompleteRate = 999999999999999999;
    this.isViewed = false;
    this.isCompleted = false;

    this.errors = [];
    
    this.on('mount', () => {
      EventService.initialize(opts.analytics);
      EventService.enabled(!this.editable);

      window.addEventListener('beforeunload', this.onLeavingPage.bind(this));
      
      this.player = opts.player;
      this.player.setCallbacks({
        //Video.js handlers
        play: this.onVideoPlay.bind(this),
        pause: this.onVideoPause.bind(this),
        timeupdate: this.onVideoTimeUpdate.bind(this),
        ended: this.onVideoEnded.bind(this),
        loadedmetadata: this.onLoadedMetadata.bind(this),
        fullscreenchange : this.onFullScreenChange.bind(this),
        //Custom handler
        ready : this.onPlayerInitialized.bind(this),
        //Video.js Marker plugin handler
        markerreached: this.onMarkerReached.bind(this)
      });
    })

    this.onPlayerInitialized = (error) => {
      this.root.parentNode.classList.add(`theme-${skin}`);

      this.errors.push(error);
      if(this.player.unsupported) {
        this.update()
      } else {
        if(this.player.hasBeenInitialized()) {
          this.initialized = true;
          
          const videoEl = this.root.querySelector('div[id^="video-"]');
          const overlaysEl = this.root.querySelector('div[id^="overlays-"]');
          Utils.style('div[id^="video-"] video', {visibility : 'visible'});
          if(videoEl) {
            const video = this.root.querySelector('video');
            if(video) {
              video.addEventListener('touchend', this.onTouchEnd.bind(this));
            }
            videoEl.append(overlaysEl);
          }
         

          this.setVideoDimension();
          this.handleMobile();

          if(this.autoplay && !this.isMobile()) {
            this.player.setMuted(true);
            this.playRequest();
          }
          
          if(this.editable){
            window.parent.postMessage(JSON.stringify({'name':'playerInitialized'}), window.location.href);
          }
        } else {
          this.hasError = true;
        }
        this.update();
      }
    }

    this.handleMobile = () => {
      if(this.isMobile()){
        window.addEventListener('orientationchange', this.onOrientationChange.bind(this));
      }
    }

    this.onLoadedMetadata = () => {
      EventService.send(Events.LOADED, {'metric4': 1});
      this.videoCompleteRate = this.player.player.duration() * 0.9;
    }

    this.onFullScreenChange = () => {
      EventService.send(Events.FULLSCREEN);
      this.hide('template');
      this.checkRequierements();
      this._moveHeader();
    }

    this.onOrientationChange = () => {
      const orientation = Utils.getOrientation();
      this.hide('template');
      this.checkRequierements();
      if(orientation != 0 && this.isMobile() && this.player.isFullscreen() && !this.playing) {
        this.playRequest();
      }
    }

    this.onTouchEnd = () => {
      if(this.playing){
        this.player.player.pause();
      }else{
        this.playRequest();
      }
    }

    this.onLeavingPage = (e) => {
      if(this.playing) {
        this.sendPlaytimeEvent();
      }
    }

    this.onVideoPlay = () => {
      const authorizedLocation = Utils.getAuthorizedStore();
      const firstTimeStr = Utils.getKey(authorizedLocation, 'tc-firsttime');
      //Deactivate tutorial as per requierement
      this.firstTime = firstTimeStr === null && !this.editable ? true : parseInt(firstTimeStr, 10);

      if (this.firstPlay) {
          EventService.send(Events.START, {'metric5': 1});
          this.firstPlay = false;
      }
      this.playing = true;
      this.startPlaytime = Date.now();
      if(!this.played && typeof window.hj !== 'undefined') {
        hj('tagRecording', ['Played']);
      }
      this.played = true;
      this.ended = false;
      this.closePanel();
      if(this.isMobile() && !this.player.isFullscreen()) {
        this.player.requestFullscreen();
      }
      this.checkRequierements();

      this.update();
    }

    this.onVideoPause = () => {
      EventService.send(Events.PAUSE, {'metric14': 1});

      this.playing = false;
      if (this.marker != null && !this.player.scrubbing()) {
        if(!this.isMobile() && !this.share.visible && this.overlayOnPause){
          this.openPanel();
        }
      }
      this.sendPlaytimeEvent();
      this.update();
    }

    this.onVideoEnded = () => {
      this.ended = true;
      if (this.player.isFullscreen()) {
        this.player.exitFullscreen();
      }
      this.sendPlaytimeEvent(); 
      EventService.send(Events.ENDED);
    }

    this.onVideoTimeUpdate = () => {
      const currentTime = this.player.currentTime();
      if(currentTime >= this.videoCompleteRate && !this.isCompleted){
        EventService.send(Events.VIDEO_COMPLETED,{'metric7': 1});
        this.isCompleted = true;
      }
      //Ensure marker is removed when it lifespan ends
      if(this.marker && this.marker.end_time < currentTime) {
        this.setMarker(null);
      }
    }

    this.onMarkerReached = (marker) => {
      this.setMarker(marker);
      if (this.firstTime) {
        window.setTimeout(this.hideTutorial.bind(this), 10000)
      }
    }

    this.getMarkerCfg = () => {
      let cfg = Utils.getDefaultConfiguration(); 
      if(this.player && this.marker && this.player.videoDetails &&
         this.player.videoDetails.meta.configurations &&
         this.player.videoDetails.meta.configurations[this.marker.poi_id]) {
        cfg = this.player.videoDetails.meta.configurations[this.marker.poi_id];
      }      
      return cfg;
    }

    this.setMarker = (marker) => {
      this.hide('template');
      if(marker) {
        if(!this.marker || (marker.key !== this.marker.key)) {
          
          Utils.removeClass(this.root.querySelectorAll('div[data-marker-key]'), 'active');
          this.marker = marker;
          if(this.played && this.isInlineTemplate()) {
            this.show('template', false, false);
          }
          const name = this.marker.poi_name || '';
          Utils.addClass(this.root.querySelector(`div[data-marker-key="${marker.key}"`), 'active');
          
          this.setPoiDimension();
        }
      } else {
        Utils.removeClass(this.root.querySelectorAll('div[data-marker-key]'), 'active');
        this.marker = null;
      }
      this.updateCursor();
      Utils.dispatchEvent('markerReached', this.marker);
      this.update();
    }

    this.isInlineTemplate = () => {
      const markerCfg = this.getMarkerCfg();
      return markerCfg && markerCfg.hasOwnProperty('inline') && markerCfg.inline;
    }

    this.updateCursor = () => {
      const videoEl = this.root.querySelector('video');
      let cursor = 'pointer';
      const locale = opts.locale || 'en_US';
      if (this.marker !== null && !this.isInlineTemplate() && this.overlayOnPause) {
        cursor = SkinService.getValue('player-explore-cursor');
        if(cursor) {
          cursor = cursor.replace(/%locale%/gi, locale);
          cursor = cursor.replace(/%time%/gi, `?t=${Date.now()}`);
          cursor = `${cursor}, auto`;
        }
      }
      Utils.style(videoEl, {cursor : cursor});
    }


    this.slideDown = (what) => {
      Utils.style(what, {marginTop:0, visibility: 'visible'});
    }

    this.slideUp = (what) => {
      const el = document.querySelector(what);
      Utils.style(what, {marginTop:`-${el.offsetHeight}px`, visibility: 'visible'});
    }

    this.show = (containerName, shouldPause, blur) => {
      shouldPause = typeof shouldPause === 'undefined' ? false : shouldPause;
      blur = typeof blur === 'undefined' ? true : blur;
      if (!this.hasOwnProperty(containerName)) {
        this[containerName]= {visible : true};
      } else {
        this[containerName].visible = true;
      }
      if (shouldPause) {
        this.player.pause();
      }

      const style = {marginTop:0, opacity:1, visibility: 'visible', top: 0};
      if (blur) {
        Utils.style(`#player-${this.playerId} .overlay-blurred`, style);
      }
      
      Utils.style(`#player-${this.playerId} .overlay-${containerName}`, style);
      window.setTimeout(this.generateThumbnail.bind(this), 0);
    }

    this.hide = (containerName, shouldResumePlay, blur) => {
      shouldResumePlay = typeof shouldResumePlay === 'undefined' ? false : shouldResumePlay;
      blur = typeof blur === 'undefined' ? false : blur;

      if (!this.hasOwnProperty(containerName)) {
        this[containerName]= {visible : false};
      } else {
        this[containerName].visible = false;
      }
      const style = {marginTop:0, opacity:0, visibility: 'hidden', top: '-100%'};
      Utils.style(`#player-${this.playerId} .overlay-${containerName}`, style);

      if (!blur) {
        Utils.style(`#player-${this.playerId} .overlay-blurred`, style);
      }
      if (shouldResumePlay) {
        this.playRequest();
      }
    }

    this.hideTutorial = () => {
      this.firstTime = false;
      const authLocation = Utils.getAuthorizedStore();
      Utils.setKey(authLocation, 'tc-firsttime', 0, 365);
      this.update();
    }

    this.generateThumbnail = () => {
      try {
        const videoEl = this.root.querySelector('video');
        let source;
        const canvas = this.root.querySelector('.overlay-blurred');
        canvas.width = videoEl.offsetWidth;
        canvas.height = videoEl.offsetHeight;
        const context = canvas.getContext('2d');
        source = this.root.querySelector('video');
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
      } catch (e) {

      }
    }

    this.setVideoDimension = () => {
      if(this.player.videoDetails.hasOwnProperty('meta') && typeof this.player.videoDetails.meta !== 'undefined') {
        const meta = this.player.videoDetails.meta;
        const optsEvent = {
          'dimension1' : meta.title || '',
          'dimension2' : meta.producer_id || '',
          'dimension3' : meta.tags ? meta.tags.join(', ') : '',
          'dimension4' : this.player.videoDetails.meta.id
          //'dimension9' : TC_PLAYER_VERSION
        }

        EventService.setVideoDimensions(optsEvent);
      }
    }

    this.setPoiDimension = () => {
      let optsEvent = {
        'dimension5' : this.marker.poi_name
      }

      if(opts.videoID) {
        optsEvent.dimension8  = this.marker.poi_id;
      }

      if(this.marker && this.marker.hasOwnProperty('details')) {
        const address = this.marker.details.address || '';
        const parts = address.split(',');
        const country = parts.length ? parts[parts.length - 1] : '';
        optsEvent.dimension6 = country;
        optsEvent.dimension7 = this.marker.details.city_name;
      }
      EventService.setPoiDimensions(optsEvent);
    }

    this.sendPlaytimeEvent = () => {
      const time = Date.now();
      let timeSpent = (time - this.startPlaytime) / 1000 ;
      //Ensure that we don t send the date in ms if startPlaytime is empty
      if(this.startPlaytime > 0 && timeSpent > 0){
        timeSpent = timeSpent.toFixed(0);
        const duration = Math.floor(this.player.player.duration());
        if(timeSpent > duration) {
          EventService.send(Events.PLAY_TIME_ERROR,{'metric1':timeSpent});
          timeSpent = duration;
        } 
        EventService.send(Events.PLAY_TIME,{'metric1':timeSpent});
      };
    }

    this.sendPaneltimeEvent = () => {
      let timeSpent = (Date.now() - this.startPanelTime) / 1000;
      if(timeSpent > 0){
        timeSpent = timeSpent.toFixed(0);
        EventService.send(Events.DETAILS_PANEL_HIDE,{'metric2':timeSpent});
      }
    }

    this.openPanel = (shouldPause, blur) => {
      shouldPause = typeof shouldPause === 'undefined' ? true : shouldPause;
      blur = typeof blur === 'undefined' ? !this.isInlineTemplate() : blur;
      if (this.marker !== null && !this.firstTime ) {
        this.hide('share');
        this.hide('header');
        this.show('template', shouldPause, blur);
        this.startPanelTime = Date.now();
        EventService.send(Events.DETAILS_PANEL, {'metric8': 1});
      }
    }

    this.closePanel = () => {
      this.hide('template');
      this.show('header', false, false);
    }

    this.openShare = () => {
      this.hide('template');
      this.show('share', true, true);
    }

    this.closeShare = () => {
      this.hide('share');
    }

    this.currentMarker = () => {
      return this.marker;
    }

    this.isUnsupported = () => {
      if(this.player && this.player.hasBeenInitialized()) {
        return this.player.hasError();
      } else {
        return 0;
      }
    }

    this.playRequest = () => {
      this.player.ready().then(() => {
        if(this.player.hasBeenInitialized()) { 
          if(this.isMobile()){
            this.player.requestFullscreen();
          }
          this.player.play();
        }
      });
    }

    this.checkRequierements = () => {
      this.hide('requierement');
      if (this.isMobile() && this.player.isFullscreen() &&  Utils.getOrientation() === 0) {
        this.show('requierement', true);
      } 
    }

    this._moveHeader = () => {
      const cssSelector = this.player.isFullscreen()? `#overlays-${this.playerId}` : `#player-${this.playerId}`;
      const refEl = document.querySelector(cssSelector);
      const headerEl = document.querySelector(`#player-${this.playerId} avs-header`);

      if(refEl && headerEl) {
        refEl.insertBefore(headerEl, refEl.firstChild);
      }
    }

    this.isMobile = () => Utils.isMobile();
  </script>
</avs-player>
