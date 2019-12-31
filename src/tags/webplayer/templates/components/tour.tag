
<tour>
  <div class="vertical-wrapper">
    <div class="from">
      <localize>template.label.bestoffer</localize> 
    </div>
    <div class="price" >
      <a class="hyperlink" href={parent.getCTALink()} target="_blank" if={!loading}>
        <span if={amount} class="tour-amount">
          <raw content={amount}/>
        </span>
        <span if={!amount} class="not-found">
          <localize>template.label.pricenotfound</localize>
        </span>
      </a>
      <loading class="loading" if={loading}/>
    </div>
    <div class="subtitle">
      <localize if={opts.editable}>template.label.livedata</localize>
    </div>
    <div if={user.data.initialized && !user.data.geolocation && !opts.editable}>
      <div class="localisation-error"> <localize>template.error.localisation</localize> </div>
    </div>
  </div>
  <script type="es6">
    import ApiManager from "../../../../scripts/api/manager";
    import User from "../../../../scripts/user";

    import "./loading.tag";
    import "./raw.tag";
    import "../../mixins/versioned.js";

    this.mixin('versioned');
    this.user = User;

    
    this.loading = true;
    this.currentID = null;
    this.amount = 0

    this.on("update", () => {
      if(!opts.editable){
        const version = this.getVersion();
        if(opts.marker && version !== this.currentID) {
          this.currentID = version;
          this.loading = true;
          this.user.ready(this.getData.bind(this));
        } 
      } else {
        this.loading = false;
      }
    });
    
    this.getData = async () => { 
      try {
        const currency = User.data.currencyCode;
        if (opts.cfg){  
          let data = {converted : opts.cfg.value};
          if(opts.cfg.currency.toLowerCase() !== User.data.currencyCode.toLowerCase()) {
            data = await ApiManager.convertCurrency(opts.cfg.currency, User.data.currencyCode, opts.cfg.value);      
          }
          this.onConvertionReceived(data);
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
        this.amount =  this.formatPrice(parsed);
      }
    }
   
    this.formatPrice = (value) => {
      return value ? i18n.localise('format.currency', {value : Math.round(value), symbol : User.data.currencySymbol}) : User.data.currencySymbol
    }
  </script>
</tour>
