
<budget>
  <div class="vertical-wrapper">
    <div class="from"><localize>template.label.average_cost_from</localize></div>
    <div class="price" if={(user.data.initialized && user.data.geolocation) || opts.editable}>
      <a href={deeplink} target="_blank" class="hyperlink" if={!loading}>
        <span if={valueBudget} class="budget-amount">
          <raw content={valueBudget} if={valueBudget}/>
        </span>
        <span if={!valueBudget} class="not-found">
          <localize>template.label.pricenotfound</localize>
        </span>
      </a>
      <loading if={loading}/>
    </div>
    <div class="subtitle" if={(user.data.initialized && user.data.geolocation)|| opts.editable}>
      <span if={!opts.editable}>{valueFor}</span>
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
    this.valueBudget = i18n.localise('format.currency', {value : '---', symbol : '€'});
    this.deeplink = 'javascript:void(0)';

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

    this.getData = async () => {
      try {
        const res = await ApiManager.getGeodataFromID(opts.marker.place_id);
        this.onGeoDataRecieved(res.response);
      } catch (e) {
        this.loading = false;
        this.valueBudget = null;
        console.error('Could  not retrieved budget data')
      } finally {
        this.update();
      }
    }

    this.fakeData = () => {
      this.valueBudget = i18n.localise('format.currency', {value : '---', symbol : User.data.currencySymbol});
      this.deeplink = 'javascript:void(0)';
    }

    this.onGeoDataRecieved = (data) => {
      this.loading = false;
      if(data.country && data.country.countryname.length) {
        this.valueBudget = this.formatPrice(data.country ? Math.round(parseFloat(data.country.budget.value_midrange)): 0);
        this.valueFor = data.country.countryname;
        this.countryCode = data.country.country_code;
        this.geoNameID = '';
        this.deeplink = `http://www.budgetyourtrip.com/budgetreportadv.php?country_code=${this.countryCode}&startdate=&enddate=&categoryid=&budgettype=&triptype=&travelerno=`;        
        if (data.country.country_code && 
            data.country.country_code.toUpperCase() == 'US' &&
            data.city.budget.value_midrange) {
          this.valueBudget = this.formatPrice(Math.round(parseFloat(data.city.budget.value_midrange)));
          this.valueFor = data.city.asciiname;
          this.countryCode = data.city.country_code;
          this.geoNameID = data.city.geonameid;
          this.deeplink += `&geonameid=${this.geoNameID}`;
        }
      } else {
        this.valueBudget = null;
      }
    }

    this.formatPrice = (value) => {
      return value ? i18n.localise('format.currency', {value : Math.round(value), symbol : User.data.currencySymbol}) : User.data.currencySymbol;
    }

  </script>
</budget>
