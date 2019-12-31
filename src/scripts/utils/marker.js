
/**
 * Get a POI default configuration
 */
export function getDefaultPOIConfiguration(){
  return {
    template_type: 0,
    google_place_photos:true,
    cta_label: '',
    cta_url: '',
    zoomLevel:  5,
    inline : false
  };
}

/**
 * Default markers plugin configuration
 */
export function getDefaultMarkerPluginConfiguration(){
  return {
    markerStyle: {
      'width':'7px',
      'border-radius': '30%',
      'background-color': 'red',
    },
    markerTip: {
      display: true,
      text: function(marker) {
        return "Break: " + marker.text;
      },
      time: function(marker) {
        return marker.time;
      }
    },
    breakOverlay:{
      display: false,
      displayTime: 3,
      text: function(marker) {
        return "Break overlay: " + marker.overlayText;
      },
      style: {
        'width':'100%',
        'height': '20%',
        'background-color': 'rgba(0,0,0,0.7)',
        'color': 'white',
        'font-size': '17px',
      },
    },
    onMarkerClick: function(marker) {},
    onMarkerReached: function(marker, index) {},
    markers: []
  };
}
