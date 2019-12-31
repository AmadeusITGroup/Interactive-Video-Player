import "jasmine";
import "jasmine-ajax";
import ApiManager from '../../../src/scripts/api/manager';
import ConfigurationService from '../../../src/scripts/configuration/service';
import { Environment } from '../../../src/scripts/enums';
import { Player, PlayerError } from '../../../src/scripts/player';
import { Options } from '../../../src/scripts/types/options.type';
import * as Utils from '../../../src/scripts/utils';
import currencyResponse from "../../fixtures/currency.response";
import destinationAirportsResponse from '../../fixtures/destination.airports.response';
import originAirportsResponse from '../../fixtures/origin.airports.response';
import * as Helpers from '../../helpers';

/**@ignore */
const videojs = require('video.js').default;




declare const i18n:any;

describe('Amadeus Video Player', () => {
  const locale = 'en_US';
  const latitude  = 43.622650;
  const longitude = 7.060159;
  let apiKey:string;

  const fixtureID = 'fixture';
  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);

    const fixtureStr:string = `
      <div id="${fixtureID}"
           style="width: 450px;
                  height: calc(450px * 9/16);
                  position: absolute;
                  bottom: 1rem;
                  right: 1rem;">
      </div>`;

    document.body.insertAdjacentHTML(
      'afterbegin', 
      fixtureStr);
    spyOn(videojs, 'registerPlugin').and.callThrough();

    apiKey = ConfigurationService.getValue(Environment.IP_STACK_API_KEY);
    //Change IPStack api key to a wrong value to force fallback
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, '');

   spyOn(navigator.geolocation, "getCurrentPosition").and.callFake((success:Function) => {
      var position = { 
        coords: { 
          latitude: latitude,
          longitude: longitude 
        }
      };
      success(position);
    });
    spyOn(ApiManager, 'getAirportDetailsByLocation').and.callFake(() => Promise.resolve(destinationAirportsResponse));
    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsResponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));
    
  });

  afterAll(() => {
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
  })

  afterEach(() => {
    player.dispose();
    player = null;
  })

  let player:Player;
  const createPlayer = (cssPath:string, opts?:Options) => {
    if(typeof opts !== 'undefined') {
      player = new Player(cssPath, opts);
    } else {
      player = new Player(cssPath);
    }
    return new Promise((resolve, reject) => {
      player.ready().then(() => {
        player.getPlayer().on('loadedmetadata', resolve)
      }).catch(reject)
    })
  };

  describe("when initialized with a video ID", () =>{ 

    beforeAll(() => {
      document.querySelector(`#${fixtureID}`).appendChild(
        Utils.htmlToElement('<div id="player1"></div>')
      );
    });

    beforeEach((done) => {
      Helpers.clearAllStorage();
      const p = createPlayer('div#player1', {
        videoID : '5a09876e4d7fac0001a8592d',
        poster: 'https://test.amadeus-video-solutions.com/api/video/picture/5a09876e4d7fac0001a8592d'
      });
      p.then(done);
    });
   
    it("should have been initialized", () => { 
      expect(videojs.registerPlugin).toHaveBeenCalledWith('repeat', jasmine.any(Function));
      expect(videojs.registerPlugin).toHaveBeenCalledWith('iosFullscreen', jasmine.any(Function));
      expect(videojs.registerPlugin).toHaveBeenCalledWith('resolutionSwitcher', jasmine.any(Function));
      expect(videojs.registerPlugin).toHaveBeenCalledWith('share', jasmine.any(Function));

      expect(player.hasBeenInitialized()).toEqual(true);
      
    });
  });

  describe("when initialized with dom node", () =>{ 

    beforeAll(() => {
      document.querySelector(`#${fixtureID}`).appendChild(
        Utils.htmlToElement(`<div id="player1">
          <video poster="https://storage.googleapis.com/travelcast-pictures/PRODUCTION/599408d5b360d300017a32c8.png" controls>
            <source src="https://player.vimeo.com/external/229822737.m3u8?s=2935ea3e37a721a2b123f384b2778382a7089bba&oauth2_token_id=982834104" data-label="Auto" data-res="Infinity"/>
            <source src="https://player.vimeo.com/external/229822737.hd.mp4?s=819e47f19c3be40fde5ac5d2c8b452d4f5d2165c&profile_id=174&oauth2_token_id=982834104" data-label="1080p <small>HD</small>" data-res="1080"/>
          </video>
        </div>`)
      );
    });

    //https://storage.googleapis.com/travelcast/videos/Ljub.mp4
    beforeEach((done) => {
      Helpers.clearAllStorage();
      const p = createPlayer('div#player1');
      p.then(done);
    });

   
    it("should have been initialized", () => { 
      expect(player.hasBeenInitialized()).toEqual(true);
    });
  });

  describe("when initialized with source", () =>{ 
    const optsBluePrint =  {
      poster : "https://storage.googleapis.com/travelcast-pictures/PRODUCTION/599408d5b360d300017a32c8.png",
      source: {
        src: "https://player.vimeo.com/external/229822737.m3u8?s=2935ea3e37a721a2b123f384b2778382a7089bba&oauth2_token_id=982834104",
        type: "application/x-mpegURL"
      },
      pois: [
        {
          poi_name: "Island",
          place_id: "ChIJw-3c7rl01kgRcWDSMKIskew",
          start_time: 0
        }
      ]
    };

    //https://storage.googleapis.com/travelcast/videos/Ljub.mp4
    beforeEach(() => {
      Helpers.clearAllStorage();
      document.querySelector(`#${fixtureID}`).appendChild(
        Utils.htmlToElement(`<div id="player1"></div>`)
      );
    });
   
    it("should have been initialized", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint));
      p.then(() => {
        expect(player.hasBeenInitialized()).toEqual(true);
        done();
      })
    });

    it("should display tutorial", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint));
      p.then(() => {
        player.play();
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-tutorial-wrapper`).then(() => {
          const tutorialEl =  document.querySelector(`#${fixtureID} .overlay-tutorial-wrapper`) as HTMLElement;
          tutorialEl.click();
          expect(tutorialEl.classList.contains('visible')).toBeFalsy();
          done();
        })
      })
    });

    it("should display rotate message when playing on portrait, mobile", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint));
      p.then(() => {
        if(window.orientation) {
          spyOnProperty(window, 'orientation').and.returnValue(0);
        } else if (window.screen && window.screen.orientation) {
          spyOnProperty(window.screen.orientation, 'angle').and.returnValue(0);
        }
        ///@ts-ignore
        spyOn(player.tag, 'isMobile').and.returnValue(true);
        spyOn(player, 'isFullscreen').and.returnValue(true);
        player.play();

        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-requierement`).then(() => {
          const requierementEl = document.querySelector(`#${fixtureID} .overlay-requierement`) as HTMLElement;
          expect(requierementEl.style.cssText.indexOf('visibility: visible;')).toBeGreaterThan(0);
          done();
        })
      })
    });

    it("should jump in time and open panel", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint));
      p.then(() => {
        expect(document.querySelector(`#${fixtureID} .vjs-big-play-button`)).not.toEqual(null);
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          expect(player.currentTime()).toEqual(5);
          done();
        }) 
      })
    });

    it("should close open panel when play is requested", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint));
      spyOn(player, "closePanel").and.callThrough();
      p.then(() => {
        expect(document.querySelector(`#${fixtureID} .vjs-big-play-button`)).not.toEqual(null);
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          player.play()
          expect(player.closePanel).toHaveBeenCalled();
          done();
        }) 
      })
    });

    it("should jump in time", (done) => { 
      const pois = [
        {
          poi_name: "Island",
          place_id: "ChIJw-3c7rl01kgRcWDSMKIskew",
          start_time: 0,
          end_time : 2
        },

        {
          poi_name: "NoMad bar, New york",
          place_id: "ChIJmU4QDaZZwokRJMu8riAhVv0",
          start_time: 3,
          end_time : 6
        },

        {
          poi_name: "Paris",
          place_id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
          start_time: 7
        }
      ];
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {pois : pois}));
      p.then(() => {
        expect(document.querySelector(`#${fixtureID} .vjs-big-play-button`)).not.toEqual(null);
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          expect(player.currentTime()).toEqual(5);
          expect(player.currentPOI().poi_name).toEqual(pois[1].poi_name);
          //@ts-ignore
          expect(player.tag.marker.poi_name).toEqual(pois[1].poi_name);

          done();
        }) 
      })
    });

    it("should use brand plugin when option is present", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {
        brand : {
          image : "url(https://storage.googleapis.com/travelcast/images/sata.svg) no-repeat center",
          destination : "https://santaclausvillage.info/",
          destinationTarget : "_blank",
          title : "Title"
        }
      }));
      p.then(() => {
        expect(videojs.registerPlugin).toHaveBeenCalledWith('brand', jasmine.any(Function));
        expect(player.hasBeenInitialized()).toEqual(true);
        done();
      })
    });

    it("should still initiliazed with error", (done) => {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /.*session.*/gi
      ).andReturn({
        status: 500,
        contentType: 'text/plain'
      });
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint));
      p.catch(() => {
        expect(player.hasBeenInitialized()).toEqual(true);
        expect(player.hasError()).toEqual(PlayerError.SessionError);
        Helpers.waitsFor(() =>  document.querySelector(`#${fixtureID} .player-container-error .error-message`) !== null).then(() => {
          const errorEl = document.querySelector(`#${fixtureID} .player-container-error .error-message`);
          expect(errorEl).toBeDefined();
          expect(errorEl.textContent.trim()).toEqual(i18n._entities[locale].player.error.cookies);
          jasmine.Ajax.uninstall();
          done();
        });
      })
    });

    it("should add POI, seek and open panel", (done) => { 
      const poiName = "NoMad bar, New york"
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {
        editable: true, 
        pois : [{
          poi_name: "Island",
          place_id: "ChIJw-3c7rl01kgRcWDSMKIskew",
          start_time: 0,
          end_time : 2
        }]}));
      p.then(() => {

        player.addPOI({
          poi_name: poiName,
          place_id: "ChIJmU4QDaZZwokRJMu8riAhVv0",
          start_time: 3,
          end_time : 6
        }, true, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          expect(player.currentTime()).toEqual(3);
          expect(player.currentPOI().poi_name).toEqual(poiName);
          done();
        }) 
      })
    });

    it("should properly remove POI", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable: true}));
      spyOn(player, "closePanel").and.callThrough();      
      p.then(() => {
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          player.removePOI(0);
          expect(player.closePanel).toHaveBeenCalled();
          expect(player.getMarkers().length).toEqual(0);
          expect(document.querySelector(`#${fixtureID} .overlay-header`)).toEqual(null);

          done();
        }) 
      })
    });

    it("should not allow editing methods when not in edit mode", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable : false}));
      p.then(() => {
        spyOn(console, 'warn');
        const functions = ['addPOI', 'removePOI', 'removePOIs', 'updatePOIsTimes', 'updatePOI', 'updateCurrentPOIConfiguration', 'updatePOIConfiguration', 'updatePictures'];
        functions.forEach((fn) => player[fn]());
        //@ts-ignore
        expect(console.warn.calls.count()).toBeGreaterThanOrEqual(functions.length);
        done();
      })
    });

    
    it("should have videojs markers in seekbar", (done) => { 
      const pois = [
        {
          poi_name: "Island",
          place_id: "ChIJw-3c7rl01kgRcWDSMKIskew",
          start_time: 0,
          end_time : 2
        },
        {
          poi_name: "NoMad bar, New york",
          place_id: "ChIJmU4QDaZZwokRJMu8riAhVv0",
          start_time: 3,
          end_time : 6
        },
        {
          poi_name: "Paris",
          place_id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
          start_time: 7
        },
        {
          poi_name: "Paris",
          start_time: 9
        }
      ];
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {pois : pois}));
      p.then(() => {
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
  
          const markers = document.querySelectorAll(`#${fixtureID} .vjs-marker`);
          //Marker without place_id should not appears
          expect(markers.length).toEqual(3);
          done();
        }) 
      })
    });

    it("should update POI when in edit mode", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable : true}));
      p.then(() => {
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          const placeID = optsBluePrint.pois[0].place_id;
          const newName = 'New name'
          player.updatePOI(placeID, 'poi_name', newName);
          const nameEL = document.querySelector('h1 > .name');
          expect(nameEL.textContent.trim()).toEqual(newName);
          done();
        }) 
      })
    });

    it("should update POI through custom event listener", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable : true}));
      p.then(() => {
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          const newName = 'New name'
          Helpers.dispatchEvent(Helpers.BridgeEvent.OnVideoPOIChanged, {
            key : 'poi_name',
            newValue : newName
          })
          const nameEL = document.querySelector('h1 > .name');
          expect(nameEL.textContent.trim()).toEqual(newName);
          done();
        }) 
      })
    });

    it("should seek to given position through custom event listener", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable : true}));
      p.then(() => {
        Helpers.dispatchEvent(Helpers.BridgeEvent.OnCurrentTimeChanged, {
          seconds : 5,
          shouldOpenPanel : true
        });
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          expect(player.currentTime()).toEqual(5);
          done();
        }) 
      })
    });

    it("should transition from large to small overlay", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable : true}));
      p.then(() => {
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          const placeID = optsBluePrint.pois[0].place_id;
          player.updatePOIConfiguration(placeID, 'inline', true);
          expect(document.querySelector('template-small')).not.toEqual(null);
          player.updatePOIConfiguration(placeID, 'inline', false);
          expect(document.querySelector('template-small')).toEqual(null);
          done();
        }) 
      })
    });

    it("update POI's configuration through custom event listener", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {editable : true}));
      p.then(() => {
        player.currentTime(5, true);        
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          Helpers.dispatchEvent(Helpers.BridgeEvent.OnVideoPOICfgChanged, {
            key : 'inline',
            newValue : true
          });
          expect(document.querySelector('template-small')).not.toEqual(null);
          done();
        }) 
      })
    });

    it("should update carousel with new pictures", (done) => { 
      const p = createPlayer('div#player1', Object.assign({}, optsBluePrint, {
        editable : true,
        pois : [
          {
            poi_name: "Island",
            place_id: "ChIJw-3c7rl01kgRcWDSMKIskew",
            start_time: 0,
            configuration : {
              google_place_photos : false
            }
          }
        ]
      }));
      p.then(() => {
        player.currentTime(5, true);
        Helpers.waitsForElementToBeVisible(`#${fixtureID} .overlay-template`).then(() => {
          const placeID = optsBluePrint.pois[0].place_id;
          const photos = [
            'https://www.amadeus-video-solutions.com/api/place/picture/CmRaAAAAE3We8LQSmlHeGjMw6RNyaMJYxNBv4-OgJwSpcnjJHH6KhWrFoIEfOpSeMtbS0or56JGcrehAmLMYbw0grgCFo9xeOYtBQgMiZoph4_eZmeuYqJ-dQU_xJjNzkyHspMs8EhCYagNEt5ybR2W3Xyd_wsJbGhQtaoH485mPsQ1RUTgdMuwI5kfCRw',
            'https://www.amadeus-video-solutions.com/api/place/picture/CmRaAAAAOy7ZMKk_dJgFgZv8vp38WB46dqYNrFzpZy4BQU7uPw0fei2SrxLWjIIwj_04voCMpFo4BEkxO3bv_zUz8_X7aLziBjMRvJUGUeklnrHbIuOEOw86rhYlQk25hCeaAUKNEhC-8LDri3Q8N_RDwOgj2n35GhTyicu4lyQWIgiZk1pl6FWrxDGeGA',
            'https://www.amadeus-video-solutions.com/api/place/picture/CmRaAAAArtT-sN4SwJ35KOcScWCQQiwPMOoXLsi0wWf3rHjmebMTCXrhxq2fPkbEb7BXavIRCHFZWoslmyEOgAg3WJ3ll4Zg-A-_KPIaqjxuxmKhmHCvgx31FD0zULuNJD1PDqH8EhDKs5PvvJrHrr4yw0e9bG4XGhSVaYrHsctVzICZdL1G5syOn2KNWQ'
          ];
          player.updatePictures(placeID, photos);
          Helpers.waitsFor(() => document.querySelectorAll(`#${fixtureID} .carousel .slide-img`).length ).then(() => {
            const els = document.querySelectorAll(`#${fixtureID} .carousel .slide-img`);
            expect(els.length).toEqual(photos.length);
            photos.forEach((p, index) => {
              const el = els[index] as HTMLDivElement;
              expect(el.style.cssText.indexOf(p)).toBeGreaterThan(0);
            });
            done();
          })
        }) 
      })
    });
  });
});