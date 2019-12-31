
<carousel>
  <div id="photos-carousel" class="photos-container">
    <div class="carousel slide">

      <!-- Wrapper for slides -->
      <div class="carousel-inner" role="listbox">
        <div each={ref,index in opts.photos} class={item:true, active:index === current, "slide-img":true} style="background-image:url('{ref}');">
        </div>
        <div class="no-picture" if={!opts.photos || !opts.photos.length}>
          <img src="https://storage.googleapis.com/travelcast/images/no-picture.svg"/>
        </div>
      </div>
    </div>
    <ol class="carousel-indicators" if={canNavigate()}>
      <li each={ref,index in opts.photos} class={active:index === current, indicator:true} onclick={show.bind(this, index)}></li>
    </ol>
  </div>
 
  <script type="es6">
    import * as Utils from "../../../../scripts/utils";
    import "../../mixins/versioned.js";

    this.mixin('versioned');
    this.currentID = null;
    this.intervalID = null;
    this.current = 0;

    this.on("mount", () => {
      this.addInterval(); 
    });

    this.on("update", () => {
      const version = this.getVersion();
      if(opts.marker && version !== this.currentID) {
        this.current = 0;
        this.currentID = version;
        this.clearInterval();
        this.addInterval();
      }
    });

    this.on("unmount", () => {
      this.clearInterval();
    });

    this.addInterval = () => {
      if(!opts.editable) {
        const interval = opts.interval || 10000;
        this.intervalID = window.setInterval(this.onTick.bind(this), interval);
      }
    } 

    this.clearInterval = () => {
      if(this.intervalID) {
        window.clearInterval(this.intervalID);
      }
    } 

    this.onTick = () => {
      if(opts.photos && opts.photos.length > 1) {
        this.show((this.current +1) % opts.photos.length );
      }
    }

    this.canNavigate = () => {
      return opts.photos && opts.photos.length > 1;
    }

    this.show = (index) => {
      if(this.canNavigate()) {
        this.current = index;
        this.update();
      }
    }
  </script>
</carousel>
