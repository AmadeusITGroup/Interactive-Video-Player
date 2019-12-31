<avs-template>
  <div id={'template-'+parent.playerId} class={template:true, large:  !isInline(), small : isInline()}>
    <div class="close" onclick={hide}></div>
    <template-large type={type} cfg={opts.cfg} marker={opts.marker} editable={opts.editable} photos={photos} if={!isInline()}></template-large>
    <template-small type={type} cfg={opts.cfg} marker={opts.marker} editable={opts.editable} photos={photos} if={isInline()}></template-small>
  </div>
  <script type="es6">
    import * as Utils from "../../scripts/utils";
    import ApiManager from "../../scripts/api/manager";
    import TemplateType from "../../scripts/enums/template";

    import "./mixins/template.js";
    import "./mixins/versioned.js";

    import "./templates/small.tag";
    import "./templates/large.tag";

    this.mixin('template');
    this.mixin('versioned');

    this.MAX_NB_PHOTOS = 5;

    this.type = TemplateType.Default;
    this.photos = [];

    this.currentID = null;
    this.loading = true;

    this.on("mount", function() {
      this.addResizeListener();   
      this._overlay = this.root.querySelector('div[id^="template-"]');
      this.onResize();
    });

    this.on("update", async function(){
      this.addFullscreenChangeListener();
      this.type = this.getType(opts.marker, opts.cfg);
      window.setTimeout(this.onResize.bind(this), 0);
      const version = this.getVersion();
      if(opts.marker && version !== this.currentID) {
        this.currentID = version;
        try {
           this.photos = await this.getPhotoReferences(opts.player.videoDetails.meta.pictures, opts.marker, opts.cfg);
        } catch(e) {
          console.warn('Unable to retrieve photos', opts.marker);
          this.photos = [];
        } finally {
          this.loading = false;
          //update is made mandatory by the await statement above
          this.update();
        }
      } else {
        this.loading = false;
      }
    });

    this.getVersioningKeys = () => {
      return ['opts.marker.place_id', 'opts.marker.poi_id', 'opts.cfg.google_place_photos', 'opts.player.timestamp'];
    }

    this.on("unmount", function() {
      this.removeLsiteners();
    });
    
    this.isInline = () => {
      return opts.cfg && opts.cfg.hasOwnProperty('inline') && opts.cfg.inline;
    }

    this.hide = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.parent.hide('template', true);
    }

    this.getOverlay = () => {
      return this._overlay;
    } 

  </script>
</avs-template>
