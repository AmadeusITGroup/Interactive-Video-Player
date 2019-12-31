<flight>
  <div class="vertical-wrapper">
    <div class="from">
      <localize>template.label.roundtrip_from</localize>
    </div>
    <div class="price">
      <a href={parent.getCTALink()} target="_blank" class="hyperlink" if={!loading}>
        <span if={opts.marker.flight_amount} class="flight-amount">
          <raw content={opts.marker.flight_amount}/>
        </span>
        <span if={!opts.marker.flight_amount} class="not-found">
          <localize>template.label.pricenotfound</localize>
        </span>
      </a>
      <loading if={loading}/>
    </div>
    <div class="subtitle" if={(user.data.initialized && user.data.geolocation) || opts.editable}>
      <span if={!opts.editable}>
        {getUserCity()} 
        <localize>template.label.to</localize> 
        {getFormattedItinerary()}
      </span>
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
    this.date = moment().endOf('month').add(1, 'd');
    this.monthTag = this.date.format(i18n.localise('YYYY-MM'));
    
    this.details = null;
    this.airportDetails = null;

    this.on("mount", () => this.fakeData());    

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

    this.getUserCity = () => {
      return this.user.data.city||"&mdash;";
    }
    
    this.getFormattedItinerary = () => {
      let city = '-';
      let airport = '-';
      if(this.details) {
        city = this.airportDetails? this.airportDetails.city_name : '-';
        airport = this.airportDetails? this.airportDetails.airport : '-';
      }
      return `${city}(${airport})`;
    }

    this.fakeData = () => {
      opts.marker.flight_amount = i18n.localise('format.currency', {value : '---', symbol : this.user.data.currencySymbol});
      opts.marker.deeplinks = opts.marker.deeplinks || {};
      opts.marker.deeplinks.flight = 'javascript:void(0)';
    }

    this.getData = async () => {
      try {
        this.details = await ApiManager.getPlace(opts.marker.place_id);
        const month = this.date.format('YYYY-MM');
        if(opts.marker && this.details && this.details.geometry) {
          const airports = await ApiManager.getAirportDetailsByLocation(this.details.geometry.location);
          if(airports.length) {
            this.airportDetails = airports[0];
            let params = {};
            if(opts.marker.poi_id) {
              params.poi_id = opts.marker.poi_id;
            }
            if(opts.marker.video_id) {
              params.video_id = opts.marker.video_id;
            }
            const fares = await ApiManager.getFares(
                this.user.data.airportCode,
                this.airportDetails.airport,
                month, params);
            this.onFlightsRecieved(fares);
          } else {
            this.airportDetails = '';
            this.onFlightsRecievedError()
          }
        }
      } catch (e) {
        console.warn('Unable to get place', opts.marker.place_id);
        this.onFlightsRecievedError()
      } finally {
        this.update();
      }
    }

    this.onFlightsRecieved = (data) => {
      if (data) {
        data = data.filter(f => {
          f.amount = this.formatPrice(f.amount);
          return f;
        });
        this.origin = this.user.data.airportCode;
        this.destination = this.details.airport_code;
        this.airportCity = this.details.city;
        this.flights = data;
        this.updateMarker(opts.marker);
      } else {
        this.flights = null;
      }
      this.update();
      this.loading = false;
    }

    this.onFlightsRecievedError = () => {
      this.loading = false;
      this.opts.marker.flight_amount = 0;
    }

    this.updateMarker = (marker) => {
      if(this.flights && this.flights.filter) {
        const f = this.flights.filter(x => moment(x.depdate,'YYYY-MM-DD').format('YYYY-MM') === this.monthTag);
        if(f.length>0) {
          marker.flight_amount = f[0].amount;
          marker.deeplinks =  marker.deeplinks || {};

          const date = moment().endOf('month').add(1, 'd');
          const start = date.startOf("month").format("YYMMDD");
          const end = date.endOf("month").format("YYMMDD");
          if (f[0].deeplink !== undefined && f[0].deeplink !== '') {
             marker.deeplinks.flight = marker.deeplink = f[0].deeplink;
          } else {
            marker.deeplinks.flight = `https://www.skyscanner.com/transport/vols/${this.user.data.airportCode}/${this.airportDetails.airport}/${start}/${end}/`;
          }
        }
      }
    }

    this.formatPrice = (value) => {
      return value ? i18n.localise('format.currency', {value : Math.round(value), symbol : this.user.data.currencySymbol}) : this.user.data.currencySymbol
    }
  </script>
</flight>
