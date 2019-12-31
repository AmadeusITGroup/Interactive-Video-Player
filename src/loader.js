(function () {

  var createLightBox = function (AmadeusVideoPlayer) {
    return GLightbox({
      autoplayVideos : false,
      afterSlideLoad : function(slide, data) {
        var video = slide.querySelector('video');
        var parent = video.parentNode;
        const container = slide.querySelector('.ginner-container');
        container.classList.add('lightbox-player-container');

        var wrapper = document.createElement('div');
        wrapper.appendChild(video);
        parent.appendChild(wrapper);
        slide.player = new AmadeusVideoPlayer(wrapper, data.opts);
      },
      afterSlideChange : function(prevSlide, activeSlide) {
        if(prevSlide && prevSlide.slide && prevSlide.slide.player) {
          prevSlide.slide.player.pause();
          window.setTimeout(function() {
            prevSlide.slide.player.closePanel();
          }, 500);
        }
      }
    });
  };

  var createLightBoxElement = function (img, index) {
    var parent = img.parentNode;
    var videoID = img.getAttribute('data-videoID');
    var skin = img.getAttribute('data-skin') || 'avs';

    if(videoID) {
      parent.setAttribute('data-slideIndex', index);
      parent.onclick = function() { 
        var index = parseInt(this.getAttribute('data-slideIndex'), 10);
        avsLightbox.settings.startAt = index;
        avsLightbox.open();
      };
      parent.insertAdjacentHTML(
        'beforeend', 
        '<button class="vjs-big-play-button" type="button"><span class="vjs-icon-placeholder"></span></button>');
      var href = 'https://studio.amadeus-video-solutions.com/api/redirect/vimeo/'+videoID;

      return {
        href : href,
        type : 'video',
        source : 'local',
        mp4 : href,
        opts :  {
          videoID : videoID,
          autoplay  :true,
          skin : skin
        }
      };
    } 
  };

  var setupLightbox = function (AmadeusVideoPlayer) {
    window.avsLightbox = createLightBox(AmadeusVideoPlayer); 
    var images = document.querySelectorAll('img[data-lightbox-slide]');
    var elements = [];     
    for (var i=0; i < images.length; i++) {
      elements.push(createLightBoxElement(images[i], i));
    }
    window.avsLightbox.setElements(elements);
  };

  var setupVideos = function (AmadeusVideoPlayer) {
    var videos = document.querySelectorAll('video[data-interactive]');
    for (var i =0; i < videos.length; i++) {
      var parent = videos[i].parentNode;
      parent.player = new AmadeusVideoPlayer(parent);
    }
  };

  var automaticSetup = function(AmadeusVideoPlayer) {
    setupVideos(AmadeusVideoPlayer);
    setupLightbox(AmadeusVideoPlayer);
    window.dispatchEvent(new CustomEvent('onAVSLibraryReady'));
  };

  var load  = function(doc, tag, id, path){
    if (doc.getElementById(id)){ return; }
    var tagEl = doc.createElement(tag); 
    tagEl.id = id;
    if(tag.toLowerCase() === 'script') {
      tagEl.onload = function(){
        automaticSetup(window.AmadeusVideoPlayer);
      };
      tagEl.type = 'application/javascript';
      tagEl.src = path;
    } else if (tag.toLowerCase() === 'link') {
      tagEl.rel = 'stylesheet';
      tagEl.type = "text/css";
      tagEl.href = path;
    }

    var avsloader = doc.querySelector('script[src*="loader.js"]');
    avsloader.parentNode.insertBefore(tagEl, avsloader);
  };

  var onManifestRetrieved = function (manifest) {
    if(typeof define === 'function' && define.amd) {
      require([manifest['main.js']], automaticSetup);
    } else {
      load(document, 'script', 'avs-jssdk',  manifest['main.js']);
    }
   
    load(document, 'link', 'avs-csssdk',  manifest['main.css']);
  };

  var findVideoID = function() {
    var video = document.querySelector('video[data-interactive]');
    if(video) {
      return video.getAttribute('data-videoID');
    }
    var img = document.querySelector('img[data-lightbox-slide]');
    if(img) {
      return img.getAttribute('data-videoID');
    }
    return null;
  };

  var injectJSONLd = function () {
    var id = findVideoID();
    if(id) {
      var videoXHR = new XMLHttpRequest();
      videoXHR.open('GET', 'https://studio.amadeus-video-solutions.com/api/json/ld/'+id);
      videoXHR.onload = function () {
        if (videoXHR.status === 200) {
          var script = document.createElement('script');
          script.type = "application/ld+json";
          script.text = videoXHR.responseText;
          document.body.appendChild(script);
        }
      };
      videoXHR.send();
    }
  };
  
  var manifestXHR = new XMLHttpRequest();
  manifestXHR.open('GET', 'https://storage.googleapis.com/travelcast/stable/manifest.json?t='+Date.now());
  manifestXHR.onload = function () {
    if (manifestXHR.status === 200) {
      onManifestRetrieved(JSON.parse(manifestXHR.responseText));
    } else {
      console.error('Manifest unreachable. Amadeus video player will fail to initialize.');
    }
  };

  manifestXHR.send();
  injectJSONLd();
})();