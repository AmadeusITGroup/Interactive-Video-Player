<avs-header>
  <div class={"overlay-header" : true, disabled : !parent.played || opts.marker === null}>
    <i class={ getIconClass() }
       if={opts.marker && opts.marker.poi_name}
       onclick={parent.openPanel.bind(parent)}></i>
    <div class="content-wrapper">
      <div class="poi-container" if={opts.marker !== null} onclick={parent.openPanel.bind(parent)}>
        <div class="name">{opts.marker.poi_name || 'Not specified'}</div>
      </div>
    </div>
  </div>
  <script>
    import {default as mapIcons} from "../../scripts/utils/map-icons";
    
    this.getIconClass = () => {
      let iconType = 'default';
      if (opts.marker.hasOwnProperty('details')) {
        const icons = mapIcons(opts.marker.details.types);
        if (icons.length) {
          iconType =  `fa-${icons[0]}`;
        }
      }
      return `fa type ${iconType}`;
    }
  </script>
</avs-header>