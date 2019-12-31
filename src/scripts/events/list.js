/**@ignore */
export const Events = {
  LOADED                : {tc:0 , ga: '/player/loaded', category: 'Video', ga_type: 'pageview'},
  START                 : {tc:10 , ga: 'START', category: 'Video', ga_type: 'event'},
  PAUSE                 : {tc:20 , ga: 'PAUSE', category: 'Video', ga_type: 'event'},
  ENDED                 : {tc:25 , ga: '/player/ended', category: 'Video', ga_type: 'pageview'},
  CTRLBRPOI_CLICKED     : {tc:37 , ga: 'CTRLBRPOI_CLICK', category: 'Poi', ga_type: 'event'},
  FULLSCREEN            : {tc:85 , ga: 'FULLSCREEN', category: 'Video',ga_type: 'event'},
  DETAILS_PANEL         : {tc:100, ga: 'DETAILS_PANEL', category: 'Interaction', ga_type: 'event'}, 
  DETAILS_PANEL_HIDE    : {tc:101, ga: 'DETAILS_PANEL_HIDE', category: 'Interaction', ga_type: 'event'}, 
  DEEPLINK_CLICKED      : {tc:120, ga: 'DEEPLINK_CLICK', category: 'Interaction', ga_type: 'event'}, 
  PLAY_TIME             : {tc:270, ga: '/player/playtime', category:'Video', ga_type: 'pageview'},
  PLAY_TIME_ERROR       : {tc:271, ga:'/player/playtime/error', category:'Video', ga_type:'pageview'},
  VIDEO_COMPLETED       : {tc:280, ga: '/player/completed', category:'Video', ga_type: 'pageview'},
  VIDEO_VIEWS           : {tc:290, ga: '/player/videoviewed', category:'Video' , ga_type: 'pageview'},
  VIMEO_ERROR           : {tc:300, ga:'VIMEO_ERROR', category:'Vimeo', ga_type:'event'}
};