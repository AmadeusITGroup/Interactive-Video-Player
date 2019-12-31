
import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';

import * as Helpers from '../../../helpers';
import {Environment} from '../../../../src/scripts/enums';
import ConfigurationService from '../../../../src/scripts/configuration/service';
import ApiManager from '../../../../src/scripts/api/manager';
import UserDataService from '../../../../src/scripts/user';

import {TemplateType} from '../../../../src/scripts/enums';


import "../../../../src/tags/webplayer/mixins/template.js";
import '../../../../src/locales/en_US';
import '../../../../src/tags/i18n/localize.tag';
import '../../../../src/tags/webplayer/templates/components/flight.tag';

import originAirportsResponse from '../../../fixtures/origin.airports.response';
import destinationAirportsResponse from '../../../fixtures/destination.airports.response';
import currencyResponse from "../../../fixtures/currency.response";

import marker from '../../../fixtures/marker';
import placeResponse from '../../../fixtures/places/innsbruck.response';

declare const i18n:any;

describe('Flight tag', () => {
  const locale = 'en_US';
  const latitude  = 43.622650;
  const longitude = 7.060159;
  const amount = 42;

  let apiKey:string;

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'flight';
  const id = 'fixture';

  let link:string;
  //@ts-ignore
  const nextMonth = moment().endOf('month').add(1, 'd');

  let faresSpy:jasmine.Spy;
  let geolocationSpy:jasmine.Spy;
 
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

    const start = nextMonth.startOf("month").format("YYMMDD");
    const end = nextMonth.endOf("month").format("YYMMDD");
    link = `https://www.skyscanner.com/transport/vols/NCE/MUC/${start}/${end}/`;
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
    spyOn(ApiManager, 'getPlace').and.callFake(() => Promise.resolve(placeResponse.result));
    faresSpy = spyOn(ApiManager, 'getFares').and.callFake(() => {
      //@ts-ignore
      return Promise.resolve([{ depdate: nextMonth.format("YYYY-MM"), retdate: "", amount: amount, deeplink: "" },])
    });

    //Reset the UserDataService to ensure no side effect from other tests
    UserDataService.data.initialized = false;
    UserDataService._initialized = false;
  });


  afterEach((done) => {
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  describe('in edit mode', () => {
    beforeEach((done) => { 
      Helpers.mount(id, tagName, {
        marker : marker,
        editable : true,
        cfg : {
          template_type : TemplateType.Destination
        }
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
      Helpers.mount(id, tagName, {
        marker : marker,
        editable : false,
        cfg : {
          template_type : TemplateType.Destination
        }
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

    it('should display flight data once fetched', (done) => { 
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {

        expect(document.querySelector(`#${id} .price .loading`)).toEqual(null);
        const hyperlinkEl = document.querySelector(`#${id} .price .hyperlink`);
        expect(hyperlinkEl).toBeDefined();
        
        expect(hyperlinkEl.getAttribute('href')).toEqual(link);
        const flightAmountEl = document.querySelector(`#${id} .price .flight-amount`);
        expect(flightAmountEl).toBeDefined();
        const flightAmount = flightAmountEl.textContent.trim();
        expect(flightAmount).toEqual(`€${amount}`);
        
        const subtitleEl = document.querySelector(`#${id} .subtitle`);
        const subtitle = subtitleEl.textContent.trim();
        expect(subtitle).toEqual('Nice to Munich(MUC)');
        done();
      })
    });

    it('should display error when failing', (done) => { 
      faresSpy.and.callThrough();
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /.*fares.*/gi
      ).andReturn({
        status: 500,
        contentType: 'text/plain'
      });
      Helpers.update(tag, true);
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(document.querySelector(`#${id} .price .flight-amount`)).toEqual(null);
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
  });
});