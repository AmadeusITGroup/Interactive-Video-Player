<hotel>
  <div class="vertical-wrapper">
    <div class="from">
      <localize>template.label.bestoffer</localize> 
    </div>
    <div class="price" >
      <a class="hyperlink" href={parent.getCTALink()} target="_blank" if={!loading}>
        <span if={hotel.amountAfterTaxes} class="hotel-amount">
          <raw content={hotel.amountAfterTaxes}/>
        </span>
        <span if={!hotel.amountAfterTaxes} class="not-found">
          <localize>template.label.pricenotfound</localize>
        </span>
      </a>
      <loading class="loading" if={loading}/>
    </div>
    <div class="subtitle">
      <localize if={!opts.editable}>template.label.pernight</localize>
      <localize if={opts.editable}>template.label.livedata</localize>
    </div>
    <div if={user.data.initialized && !user.data.geolocation && !opts.editable}>
      <div class="localisation-error"> <localize>template.error.localisation</localize> </div>
    </div>
  </div>
  <script>

    import ApiManager from "../../../../scripts/api/manager";
    import User from "../../../../scripts/user";

    import "./loading.tag";
    import "./raw.tag";
    import "../../mixins/versioned.js";

    this.mixin('versioned');
    this.loading = true;
    this.user = User;

    this.date = moment().endOf('month').add(1, 'd');
    this.currentID = null;

    this.details = null; 
    this.hotel = {
      amountAfterTaxes : 0
    };

    this.on("mount", () => this.fakeData());

    this.on("update", () => {
      if(!opts.editable){
        const version = this.getVersion();
        if(opts.marker && version !== this.currentID) {            
          this.currentID = version;
          this.user.ready(this.getData.bind(this));
        }
      } else {
        this.loading = false;
      }
    });
    
    this.fakeData = () => {
      opts.marker.deeplinks = opts.marker.deeplinks || {};      
      opts.marker.deeplinks.hotel = 'javascript:void(0)';
    }

    this.getData = async () => { 
      try {
        this.details = await ApiManager.getPOI(opts.marker.poi_id);
        opts.marker.deeplinks = opts.marker.deeplinks || {};
        opts.marker.deeplinks.hotel =  this.generateHotelDeeplink();
        const checkIn = this.date.startOf("month").format("YYYY-MM-DD");
        const checkOut = this.date.startOf("month").add(1, 'day').format("YYYY-MM-DD");
        const currency = User.data.currencyCode;
        if (opts.cfg){  
          if(typeof opts.cfg.property_code !== "undefined" && opts.cfg.property_code != ""){
            const res = await ApiManager.getHotelsByID(opts.cfg.property_code, checkIn, checkOut);
            this.onHotelReceived(res.response);
          } else {
            let data = {converted : opts.cfg.value};
            if(opts.cfg.currency.toLowerCase() !== User.data.currencyCode.toLowerCase()) {
              data = await ApiManager.convertCurrency(opts.cfg.currency, User.data.currencyCode, opts.cfg.value);      
            }
            this.onConvertionReceived(data);
          }
        }
      } catch(e) {
        this.loading = false;
      } finally {
        this.update();
      }
    }
    
    this.onConvertionReceived = (data) => {
      this.loading = false;
      const parsed = parseInt(data.converted, 10);
      if(!isNaN(parsed)) {
        this.hotel = { 
          amountAfterTaxes : this.formatPrice(parsed)
        };
      }
    }

    this.onHotelReceived = (data) => {
      this.loading = false;
      this.hotel = data;
      this.hotel.amountAfterTaxes = this.formatPrice(this.hotel.amountAfterTaxes);
    }

   
    this.generateHotelDeeplink = () => {
      let link = "";
      if(this.details !== null) {
        let startDate = this.date.startOf("month").format("YYYY-MM-DD");
        let endDate = this.date.startOf("month").add(1, 'd').format("YYYY-MM-DD");
        let code = this.details.city_code || this.details.city || this.details.city_name;
        link = `https://www.skyscanner.com/hotels/?sd=${startDate}&ed=${endDate}&na=1&nr=1&s-f_iplace=${code}`;
      }
      return link;
    }

    this.formatPrice = (value) => {
      return value ? i18n.localise('format.currency', {value : Math.round(value), symbol : User.data.currencySymbol}) : User.data.currencySymbol
    }
  </script>
</hotel>
