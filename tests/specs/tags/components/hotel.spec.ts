
import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';

import * as Helpers from '../../../helpers';
import {Environment} from '../../../../src/scripts/enums';
import ConfigurationService from '../../../../src/scripts/configuration/service';
import ApiManager from '../../../../src/scripts/api/manager';
import UserDataService from '../../../../src/scripts/user';


import "../../../../src/tags/webplayer/mixins/template.js";
import '../../../../src/locales/en_US';
import '../../../../src/tags/i18n/localize.tag';
import '../../../../src/tags/webplayer/templates/components/hotel.tag';

import {TemplateType} from '../../../../src/scripts/enums';

import originAirportsResponse from '../../../fixtures/origin.airports.response';
import destinationAirportsResponse from '../../../fixtures/destination.airports.response';
import currencyResponse from "../../../fixtures/currency.response";
import convertResponse from "../../../fixtures/convert.response";

import markerBluePrint from '../../../fixtures/marker';
import poiResponse from '../../../fixtures/poi.response';

declare const i18n:any;

describe('Hotel tag', () => {
  const locale = 'en_US';
  const latitude  = 43.622650;
  const longitude = 7.060159;
  const amount = 42;

  let apiKey:string;

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'hotel';
  const id = 'fixture';

  let link:string;
  //@ts-ignore
  const nextMonth = moment().endOf('month').add(1, 'd');

  let poiSpy:jasmine.Spy;
  let geolocationSpy:jasmine.Spy;
 
  let marker:any;
  let cfg:any;


  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);

    apiKey = ConfigurationService.getValue(Environment.IP_STACK_API_KEY);
    //Change IPStack api key to a wrong value to force fallback
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, '');

    geolocationSpy = spyOn(navigator.geolocation, "getCurrentPosition").and.callFake((success:Function) => {
      var position = { 
        coords: { 
          latitude: latitude,
          longitude: longitude 
        }
      };
      success(position);
    });

    const start = nextMonth.startOf("month").format("YYYY-MM-DD");
    const end = nextMonth.startOf("month").add(1, 'd').format("YYYY-MM-DD");
    link =  `https://www.skyscanner.com/hotels/?sd=${start}&ed=${end}&na=1&nr=1&s-f_iplace=${poiResponse.city}`;
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
    poiSpy = spyOn(ApiManager, 'getPOI').and.callFake(() => Promise.resolve(poiResponse));
    spyOn(ApiManager, 'convertCurrency').and.callFake(() => Promise.resolve(convertResponse));
    
    //Reset the UserDataService to ensure no side effect from other tests
    UserDataService.data.initialized = false;
    UserDataService._initialized = false;

    marker = Object.assign({}, markerBluePrint);
  });

  afterEach((done) => {
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  describe('in edit mode', () => {
    beforeEach((done) => { 
      Helpers.mount(id, tagName, {
        marker : marker,
        editable : true,
      }, 'template').then((res) => {
        host = res.host;
        tag = res.tag;
        done();
      });
    });

    it('should display live data warning', (done) => { 
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {
        const subtitleEl = document.querySelector(`#${id} .subtitle`);
        const subtitle = subtitleEl.textContent.trim();
        const label = i18n._entities[locale].template.label.livedata;
        expect(subtitle).toEqual(label);
        done();
      });
    });
  })

  describe('in view mode', () => {
    beforeEach((done) => {
      cfg = {
        currency : 'EUR',
        value : amount,
        template_type : TemplateType.Hotel
      };
      Helpers.mount(id, tagName, {
        marker : marker,
        editable : false,
        cfg : cfg
      }, 'template').then((res) => {
        host = res.host;
        tag = res.tag;
        done();
      });
    });

    it('should display loading while fetching data', (done) => { 
      Helpers.waitsFor(() => tag.loading).then(() => {
        expect(document.querySelector(`#${id} .price .loading`)).toBeDefined();
        expect(document.querySelector(`#${id} .price .hyperlink`)).toEqual(null);
        done();
      })
    });

    it('should display hotel data once fetched', (done) => { 
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {

        expect(document.querySelector(`#${id} .price .loading`)).toEqual(null);
        const hyperlinkEl = document.querySelector(`#${id} .price .hyperlink`);
        expect(hyperlinkEl).toBeDefined();
        
        expect(hyperlinkEl.getAttribute('href')).toEqual(link);
        const hotelAmountEl = document.querySelector(`#${id} .price .hotel-amount`);
        expect(hotelAmountEl).toBeDefined();
        const hotelAmount = hotelAmountEl.textContent.trim();
        expect(hotelAmount).toEqual(`€${amount}`);

        done();
      })
    });

    it('should not call currency convertion when currencies are identical', (done) => { 
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(ApiManager.convertCurrency).not.toHaveBeenCalled();
        done();
      })
    });

    it('should call currency convertion when currencies are different', (done) => { 
      cfg.currency = 'USD';
      Helpers.update(tag, true);
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(ApiManager.convertCurrency).toHaveBeenCalled();
        const hotelAmountEl = document.querySelector(`#${id} .price .hotel-amount`);
        const hotelAmount = hotelAmountEl.textContent.trim();
        expect(hotelAmount).toEqual(`€${convertResponse.converted}`);
        done();
      })
    });

    it('should display error when failing', (done) => { 
      poiSpy.and.callThrough();
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /.*limitedpois.*/gi
      ).andReturn({
        status: 500
      });

      Helpers.update(tag, true);
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(document.querySelector(`#${id} .price .hotel-amount`)).toEqual(null);
        const notFoundEl = document.querySelector(`#${id} .price .not-found`);
        const notFound = notFoundEl.textContent.trim();
        const label = i18n._entities[locale].template.label.pricenotfound      
        expect(notFound).toBeDefined(label);
        const hyperlinkEl = document.querySelector(`#${id} .price .hyperlink`);
        expect(hyperlinkEl.getAttribute('href')).toEqual('javascript:void(0)');        
        jasmine.Ajax.uninstall();
        done();
      })
    });

    it('should display localisation message when location service fails', (done) => { 
      geolocationSpy.and.callFake((success:Function, error:Function) => {
        error();
      });
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(document.querySelector(`#${id} .localisation-error`)).toBeDefined();
        done();
      });
    });

    it('should display error when marker is empty', (done) => { 
      Object.keys(marker).forEach((k) => delete marker[k]);
      Helpers.update(tag, true);
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(document.querySelector(`#${id} .not-found`)).toBeDefined();
        done();
      });
    });
    
    it('should display error when value is not a number', (done) => { 
      cfg.value = 'xyz';
      Helpers.update(tag, true);
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(document.querySelector(`#${id} .not-found`)).toBeDefined();
        done();
      });
    });
  });
});