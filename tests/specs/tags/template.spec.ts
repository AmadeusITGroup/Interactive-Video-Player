
import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';

import * as Helpers from '../../helpers';
import {Environment} from '../../../src/scripts/enums';
import ConfigurationService from '../../../src/scripts/configuration/service';
import ApiManager from '../../../src/scripts/api/manager';
import UserDataService from '../../../src/scripts/user';

import {TemplateType} from '../../../src/scripts/enums';


import {TemplateMixin} from "../../../src/tags/webplayer/mixins/template.js";
import '../../../src/locales/en_US';
import '../../../src/tags/i18n/localize.tag';

import '../../../src/tags/webplayer/template.tag';

import originAirportsResponse from '../../fixtures/origin.airports.response';
import destinationAirportsResponse from '../../fixtures/destination.airports.response';
import currencyResponse from "../../fixtures/currency.response";
import convertResponse from "../../fixtures/convert.response";

import marker from '../../fixtures/marker';
import placeResponse from '../../fixtures/places/innsbruck.response';
import poiResponse from '../../fixtures/poi.response';

declare const i18n:any;

describe('Template', () => {
  const locale = 'en_US';
  const latitude  = 43.622650;
  const longitude = 7.060159;
  const amount = 42;

  let apiKey:string;

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const id = 'fixture';

  //@ts-ignore
  const nextMonth = moment().endOf('month').add(1, 'd');
  let placeSpy:jasmine.Spy;

  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);

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
  });

  afterAll(() => {
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
  });

  beforeEach(() => {
    Helpers.clearAllStorage();
    Helpers.setBearer();

    spyOn(ApiManager, 'getAirportDetailsByLocation').and.callFake(() => Promise.resolve(destinationAirportsResponse));
    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsResponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));
    placeSpy = spyOn(ApiManager, 'getPlace').and.callFake(() => Promise.resolve(placeResponse.result));
    spyOn(ApiManager, 'getFares').and.callFake(() => {
      //@ts-ignore
      return Promise.resolve([{ depdate: nextMonth.format("YYYY-MM"), retdate: "", amount: amount, deeplink: "" },])
    });
    spyOn(ApiManager, 'getPOI').and.callFake(() => Promise.resolve(poiResponse));
    spyOn(ApiManager, 'convertCurrency').and.callFake(() => Promise.resolve(convertResponse));
    

    //Reset the UserDataService to ensure no side effect from other tests
    UserDataService.data.initialized = false;
    UserDataService._initialized = false;
  });


  afterEach((done) => {
    if(host) {
      Helpers.unmount(id, {host: host, tag:tag}).then(done);
    } else {
      done();
    }
  });

  it('should request photo when no configuration', (done) => {
    const mixin = new TemplateMixin();
    mixin.getPhotoReferences(null, marker, null).then((photos:string[]) => {
      expect(photos.length).toBeGreaterThan(0);
      expect(photos.length).toBeLessThanOrEqual(mixin.MAX_NB_PHOTOS);
      expect(photos[0].indexOf(placeResponse.result.photos[0].photo_reference)).toBeGreaterThan(-1);
      done();
    }); 
  });

  it('should use cached value when provided', (done) => {
    const mixin = new TemplateMixin();
    let cache = {};
    const photo = 'photo1';
    cache[marker.poi_id] = [photo];
    mixin.getPhotoReferences(cache, marker, null).then((photos:string[]) => {
      expect(photos.length).toEqual(1);
      expect(photos[0]).toEqual(photo);
      done();
    }); 
  });

  it('should respect configuration value', (done) => {
    const mixin = new TemplateMixin();
    let cache = {};
    const photo = 'photo1';
    cache[marker.poi_id] = [photo];
    mixin.getPhotoReferences(cache, marker, {google_place_photos : true}).then((photos:string[]) => {
      expect(photos.length).toBeGreaterThan(0);
      expect(photos.length).toBeLessThanOrEqual(mixin.MAX_NB_PHOTOS);
      expect(photos[0]).toContain(placeResponse.result.photos[0].photo_reference);
      done();
    }); 
  });

  it('should coplete even if place call fails', (done) => {
    placeSpy.and.callThrough();
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(
      /.*place.*/gi
    ).andReturn({
      status: 500,
      contentType: 'text/plain'
    });
    const mixin = new TemplateMixin();
    let cache = {};
    const photo = 'photo1';
    cache[marker.poi_id] = [photo];
    mixin.getPhotoReferences(cache, marker, {google_place_photos : true}).catch((photos:string[]) => {
      expect(photos.length).toEqual(0);
      jasmine.Ajax.uninstall();

      done();
    }); 
  });

  const mount = (id:string, opts:any) => {
    return new Promise((resolve, reject) => {
      Helpers.mount(id, 'avs-template', opts, 'template').then((res) => {
        host = res.host;
        tag = res.tag;
        Helpers.update(tag, true);
        Helpers.waitsFor(() => !tag.loading)
          .then(() => resolve())
          .catch(() => reject()); 
      }).catch(() => reject()); 
    });
  };

  const  shouldDisplayPoiName = (inline:boolean, done:Function) => {
    const type = TemplateType.Default;
    mount(id, {
      marker : marker,
      cfg : { template_type : type, inline:inline  },
      type : type
    }).then(() => {
      const nameEl = document.querySelector(`#${id} .name`) as HTMLSpanElement;
      expect(nameEl.textContent).toEqual(marker.poi_name);
      done();
    });
  };

  const  shouldDisplayTips = (inline:boolean, done:Function) => {
    const type = TemplateType.Default;
    mount(id, {
      marker : marker,
      cfg : { template_type : type, inline:inline },
      type : type
    }).then(() => {
      const tipsEl = document.querySelector(`#${id} .tips-wrapper tips`) as HTMLSpanElement;
      expect(tipsEl).toBeDefined();
      done();
    });
  }

  const shouldFallbackToDefaultMessages = (inline:boolean, done:Function) => {
    const type = TemplateType.Default;
    mount(id, {
      marker : null,
      cfg : {
        template_type : type,
        inline:inline 
      },
      type : type
    }).then(() => {

      const titleEl = document.querySelector(`#${id} h1 .no-data`) as HTMLSpanElement;
      const tipsEl = document.querySelector(`#${id} .tips-wrapper .no-data`) as HTMLSpanElement;

      const defaultTitle = i18n._entities[locale].template.label.notitle.trim();
      expect(titleEl.textContent.trim()).toEqual(defaultTitle);

      const defaultTips = i18n._entities[locale].template.label.notips.trim();
      expect(tipsEl.textContent.trim()).toEqual(defaultTips);

      done();
    });
  };

  const shouldDisplayCta = (inline:boolean, done:Function) => {
    const type = TemplateType.Default;
    const url = 'http://www.example.com/';
    const cta = 'Some action'
    mount(id, {
      marker : marker,
      cfg : {
        template_type: type,
        cta_url : url,
        cta_label : cta, 
        inline:inline 
      },
      type : type
    }).then(() => {
     

      const ctaEl = document.querySelector(`#${id} .actions-wrapper .cta a`) as HTMLAnchorElement;
      expect(ctaEl.textContent.trim()).toEqual(cta);
      
      const href = ctaEl.getAttribute('href');
      const target = ctaEl.getAttribute('target');

      expect(href).toEqual(url);
      expect(target).toEqual('_blank');

      done();
    });
  };

  const shouldUseDefaultCtaLabel = (inline:boolean, done:Function) => {
    const type = TemplateType.Destination;
    mount(id, {
      marker : marker,
      cfg : {
        template_type: type,
        cta_url : 'http://www.example.com/', 
        inline:inline 
      },
      type : type
    }).then(() => {
      const ctaEl = document.querySelector(`#${id} .actions-wrapper .cta a`) as HTMLAnchorElement;

      const defaultLabel = i18n._entities[locale].template.button.getthere.trim();
      expect(ctaEl.textContent.trim()).toEqual(defaultLabel);

      done();
    });
  };

  const shouldCheckLayout = (inline:boolean, type:number, shouldExist:string[], shouldNotExist:string[], done:Function) => {
    mount(id, {
      marker : marker,
      cfg : {
        template_type: type,
        cta_url : 'http://www.example.com/', 
        inline:inline 
      },
      type : type
    }).then(() => {
      shouldExist.forEach((cssPath) =>  expect(document.querySelector(`#${id} ${cssPath}`)).not.toEqual(null));
      shouldNotExist.forEach((cssPath) =>  expect(document.querySelector(`#${id} ${cssPath}`)).toEqual(null));

      done();
    });
  };

  describe('Large tag', () => {
    it('should display poi name', (done) => { 
      shouldDisplayPoiName(false, done);
    });

    it('should display tips', (done) => { 
      shouldDisplayTips(false, done);
    });

    it('should fallback to pre-defined messages when no data', (done) => { 
      shouldFallbackToDefaultMessages(false, done);
    });

    it('should display cta when cta_url is specified', (done) => { 
      shouldDisplayCta(false, done);
    });

    it('should use default cta label when none is specified', (done) => { 
      shouldUseDefaultCtaLabel(false, done);
    });

    it('should display title, tips, flight, budget and cta for template type destination', (done) => { 
      shouldCheckLayout(
        false, TemplateType.Destination,
        ['carousel', '.tips-wrapper', '.map-wrapper', '.flight', '.budget', '.cta'],
        ['.details-wrapper.default', '.details-wrapper.expanded', 'map-wrapper.expanded', '.hotel', '.address', '.contact', '.tour'],
        done
      );
    });

    it('should display title, tips, small map, hotel, contact info and cta for template type Hotel', (done) => { 
      shouldCheckLayout(
        false, TemplateType.Hotel,
        ['carousel', '.tips-wrapper', '.map-wrapper.highlighted', 'static-map.col', '.hotel', '.address', '.contact', '.cta'],
        ['.details-wrapper.default', '.details-wrapper.expanded', 'map-wrapper.expanded', '.flight', '.budget', '.tour'],
        done
      );
    });

    it('should display title, tips, small map, tour, contact info and cta for template type tour', (done) => { 
      shouldCheckLayout(
        false, TemplateType.Tour,
        ['carousel', '.tips-wrapper', '.map-wrapper', '.tour', '.cta'],
        ['.details-wrapper.default', '.details-wrapper.expanded', 'map-wrapper.expanded', '.flight', '.budget',  '.address', '.contact'],
        done
      );
    });
  })

  describe('Small tag', () => {
    it('should display poi name', (done) => { 
      shouldDisplayPoiName(true, done);
    });

    it('should display tips', (done) => { 
      shouldDisplayTips(true, done);
    });

    it('should fallback to pre-defined messages when no data', (done) => { 
      shouldFallbackToDefaultMessages(true, done);
    });

    it('should display cta when cta_url is specified', (done) => { 
      shouldDisplayCta(true, done);
    });

    it('should use default cta label when none is specified', (done) => { 
      shouldUseDefaultCtaLabel(true, done);
    });

    it('should display photos, title, flight and cta for template type destination', (done) => { 
      shouldCheckLayout(
        true, TemplateType.Destination,
        ['.photo-wrapper', 'h1 > .name',  '.flight', '.cta'],
        ['.tips-wrapper > .tips', '.hotel', '.contact', '.tour'],
        done
      );
    });

    it('should display photos, title, hotel and cta for template type hotel', (done) => { 
      shouldCheckLayout(
        true, TemplateType.Hotel,
        ['.photo-wrapper', 'h1 > .name', '.hotel', '.cta'],
        ['.tips-wrapper > .tips', '.flight', '.contact', '.tour'],
        done
      );
    });

    it('should display photos, title, hotel and cta for template type tour', (done) => { 
      shouldCheckLayout(
        true, TemplateType.Tour,
        ['.photo-wrapper', 'h1 > .name', '.tour', '.cta'],
        ['.tips-wrapper > .tips', '.flight', '.contact', '.hotel'],
        done
      );
    });
  });
});