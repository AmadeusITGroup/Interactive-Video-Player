
<static-map>
  <a class="avs-map" style="background-image:url('{staticMapSrc}');" href="{googleMapDeeplink}" target="_blank">
  </a>
  <script type="es6">
    import ApiManager from "../../../../../scripts/api/manager";    

    import SkinService from "../../../../../scripts/skin/service";   
    import TemplateType from "../../../../../scripts/enums/template";  
    import Environment from "../../../../../scripts/enums/environment";

    import ConfigurationService from "../../../../../scripts/configuration/service";

    import "../../../mixins/versioned.js";

    this.mixin('versioned');

    this.loading = true;

    this.DEFAULT = 'https://storage.googleapis.com/travelcast/images/no-map.svg';
    this.DEFAULT_LINK = 'javascript:void(0)';

    this.currentID = null;
    this.staticMapSrc = this.DEFAULT;
    this.googleMapDeeplink = this.DEFAULT_LINK;

    this.on("mount", () => {
      SkinService.ready().then(() => this.generateGMapUrl());
    });

    this.on("update", () => {
      SkinService.ready().then(() => this.generateGMapUrl());
    });

    this.generateGMapUrl = () => {
      
      const version = this.getVersion();
      if(opts.marker && version !== this.currentID) {
        this.staticMapSrc = this.DEFAULT;
        const dim = this.root.getBoundingClientRect();
        this.currentID = version;
        const key = ConfigurationService.getValue(Environment.GOOGLE_MAP_API_KEY);
        const color = SkinService.getValue('primary').replace('#', '');

        let places = [];
        let url = `https://maps.googleapis.com/maps/api/staticmap?size=410x140&scale=2&maptype=roadmap&key=${key}&format=png&visual_refresh=true&style=${this.getMapStyle()}` 

        if(opts.cfg && opts.cfg.template_type === TemplateType.Tour) {
          this.staticMapSrc = `${url}&autoscale=1`;
          places = opts.cfg.places || [];
        } else {
          const zoomLevel = opts.cfg && opts.cfg.hasOwnProperty('zoom_level') ? opts.cfg.zoom_level : 12;
          url = `${url}&zoom=${zoomLevel}`;
          places = opts.marker.place_id ? [opts.marker.place_id] : [];
        }
        if(places.length > 0) {
          this.googleMapDeeplink = `https://www.google.com/maps?q=place_id:${places[0]}`;
        } else {
          this.googleMapDeeplink = this.DEFAULT_LINK;
        }
        
        this.update();
        let failedCount = 0;
        places.forEach(async (id, index) => {
          try {
            const place = await ApiManager.getPlace(id);
            if(place) {
              const location = place.geometry.location;
              const coordinates = {
                lat: typeof location.lat === 'function' ? location.lat() : location.lat,
                lng: typeof location.lng === 'function' ? location.lng() : location.lng
              };
              url = `${url}&markers=size:medium%7Ccolor:0x${color}%7Clabel:${name}%7C${coordinates.lat},${coordinates.lng}`;
            }
          } catch (e) {
            failedCount++;
            console.warn('Unable to get place', opts.marker.place_id);
          } finally {
            if(index === places.length -1) {
              if(places.length === failedCount) {
                this.googleMapDeeplink = this.DEFAULT_LINK;
                this.staticMapSrc = this.DEFAULT;
              } else {
                this.staticMapSrc = url;
              }
        
              this.loading = false;
              this.update();
            }
          }
        });
      }
    }

    this.getMapStyle = () => {
      return `feature:landscape.natural%7Celement:geometry.fill%7Ccolor:0xe0efef%7Cvisibility:on&style=feature:poi%7Cvisibility:on&style=feature:poi%7Celement:geometry.fill%7Ccolor:0xc0e8e8%7Chue:0x1900ff%7Cvisibility:on&style=feature:poi.business%7Cvisibility:off&style=feature:poi.government%7Cvisibility:off&style=feature:poi.medical%7Cvisibility:off&style=feature:poi.school%7Cvisibility:off&style=feature:poi.sports_complex%7Cvisibility:off&style=feature:road%7Celement:geometry%7Clightness:100%7Cvisibility:simplified&style=feature:road%7Celement:labels%7Cvisibility:off&style=feature:road.local%7Cvisibility:on&style=feature:transit.line%7Celement:geometry%7Clightness:700%7Cvisibility:on&style=feature:water%7Ccolor:0x00a9e0%7Cvisibility:on&size=480x360`;
    }

    this.getVersioningKeys = () => {
      return ['opts.marker.place_id','opts.cfg.zoom_level'];
    }
  </script>
</static-map>
