
export interface Marker {
  time: number,
  duration: number,
  text?: string,
  class?: string,
  overlayText?: string,
  // private property
  key: string
};

export interface  MarkerTip {
  display: boolean,
  text: (marker:Marker) => string,
  time : (marker:Marker) => number
}

export interface  MarkerBreakOverlay {
  display: boolean,
  displayTime: number,
  text: (marker:Marker) => string,
  style : {[key:string]:string;}
}

export interface  PluginSettings  {
  markerStyle : {[key:string]:string},
  markerTip : MarkerTip,
  breakOverlay : MarkerBreakOverlay,
  onMarkerClick : (marker:Marker) => boolean | void,
  onMarkerReached : (marker:Marker, index:number) => void,
  onTimeUpdateAfterMarkerUpdate? : () => void;
  markers: Marker[]
}