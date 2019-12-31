<additional-info>
  <div class="vertical-wrapper" >
    <div class="box "> 
      <i class="fa fa-heart" aria-hidden="true"></i>
      <small>  
        <localize>template.label.rating</localize>
      </small>
      <span class="rating" if={opts.marker && details}>
        <i each={ref in stars} class={fa:true, "fa-star":isPlain(ref), "fa-star-o":isEmpty(ref), "fa-star-half-o":isHalf(ref)}></i>
        <span class="value">{details.rating}/5</span>
      </span>
    </div>
    <div class="box"> 
      <i class="fa fa-phone" aria-hidden="true"></i>
      <small>  
        <localize>template.label.contactinfo</localize>
      </small>
      <a href={"tel:"+details.international_phone_number} class="phone hyperlink " if={opts.marker && details && details.international_phone_number}>
        {details.international_phone_number}
      </a>
    </div>
  </div>
  <script type="es6">
    import ApiManager from "../../../../scripts/api/manager";
    import "../../mixins/versioned.js";

    this.mixin('versioned');
    this.stars = [0,1,2,3,4];
    this.details = null;
    this.currentID = null;

    this.loading = true;    

    this.on("update", async () => {
      const version = this.getVersion();
      if(opts.marker && version !== this.currentID) {
        this.currentID = version;
        try {
          this.details = await ApiManager.getPlace(opts.marker.place_id);
        } catch (e) {
          console.warn('Unable to get place', opts.marker.place_id);
        } finally {
          this.loading = false;
          this.update();
        }
      }
    });

    this.isPlain = (ref) => {
      return opts.marker && this.details && this.details.rating - ref > 1;
    }
    
    this.isHalf = (ref) => {
      return  opts.marker && this.details && this.details.rating - ref > 0 && this.details.rating - ref < 1;
    }

    this.isEmpty = (ref) => {
      return  !opts.marker || !this.details || this.details.rating  - ref < 0;
    }
  </script>
</additional-info>