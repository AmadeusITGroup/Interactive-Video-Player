<address>
  <div class="box vertical-wrapper"> 
    <i class="fa fa-map-marker" aria-hidden="true"></i>
    <small>  
      <localize>template.label.address</localize>
    </small>
    <span class="address value" if={opts.marker && details && details.formatted_address}>
      {details.formatted_address}
    </span>
  </div>
  <script type="es6">
    import ApiManager from "../../../../scripts/api/manager";
    import "../../mixins/versioned.js";

    this.mixin('versioned');
    this.details = null;
    this.currentID = null;

    this.on("update", async () =>{
      const version = this.getVersion();
      if(opts.marker && version !== this.currentID) {
        this.currentID = version;
        try {
          this.details = await ApiManager.getPlace(opts.marker.place_id);
        } catch (e) {
          console.warn('Unable to get place', opts.marker.place_id);
        } finally {
          this.update();
        }
      }
    });
  </script>
</address>