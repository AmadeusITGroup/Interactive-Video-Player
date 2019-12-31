
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
import '../../../../src/tags/webplayer/templates/components/budget.tag';

import originAirportsResponse from '../../../fixtures/origin.airports.response';
import currencyResponse from "../../../fixtures/currency.response";
import geodataResponse from '../../../fixtures/geodata.response';
import usGeodataResponse from '../../../fixtures/us.geodata.response';

import marker from '../../../fixtures/marker';

declare const i18n:any;

describe('Budget tag', () => {
  const locale = 'en_US';
  const latitude  = 43.622650;
  const longitude = 7.060159;

  let apiKey:string;

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'budget';
  const id = 'fixture';

  let link:string;
  let geolocationSpy:jasmine.Spy;
  let geoDataSpy:jasmine.Spy;

 
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

    const countryCode = geodataResponse.country.country_code;
    link = `http://www.budgetyourtrip.com/budgetreportadv.php?country_code=${countryCode}&startdate=&enddate=&categoryid=&budgettype=&triptype=&travelerno=`;
  });

  afterAll(() => {
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
  });

  beforeEach(() => {
    Helpers.clearAllStorage();
    Helpers.setBearer();

    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsResponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));
    
    geoDataSpy = spyOn(ApiManager, 'getGeodataFromID').and.callFake(() => Promise.resolve({response:geodataResponse}));

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
      }).then((res) => {
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
      }).then((res) => {
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

    it('should display budget data once fetched', (done) => { 
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {

        expect(document.querySelector(`#${id} .price .loading`)).toEqual(null);
        const hyperlinkEl = document.querySelector(`#${id} .price .hyperlink`);
        expect(hyperlinkEl).toBeDefined();
        
        expect(hyperlinkEl.getAttribute('href')).toEqual(link);
        const budgetAmountEl = document.querySelector(`#${id} .price .budget-amount`);
        expect(budgetAmountEl).toBeDefined();
        const budgetAmount = budgetAmountEl.textContent.trim();
        expect(budgetAmount).toEqual(`€${geodataResponse.country.budget.value_midrange}`);
        
        const subtitleEl = document.querySelector(`#${id} .subtitle`);
        const subtitle = subtitleEl.textContent.trim();
        expect(subtitle).toEqual(geodataResponse.country.countryname);
        done();
      })
    });

    it('should display budget for city when country is US', (done) => { 
      geoDataSpy.and.callFake(() => Promise.resolve({response:usGeodataResponse}));

      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {

        expect(document.querySelector(`#${id} .price .loading`)).toEqual(null);
        const hyperlinkEl = document.querySelector(`#${id} .price .hyperlink`);
        expect(hyperlinkEl).toBeDefined();
        
        const countryCode = usGeodataResponse.country.country_code;
        const geoNameID = usGeodataResponse.city.geonameid;
        const enhancedLink = `http://www.budgetyourtrip.com/budgetreportadv.php?country_code=${countryCode}&startdate=&enddate=&categoryid=&budgettype=&triptype=&travelerno=&geonameid=${geoNameID}`;
        
        expect(hyperlinkEl.getAttribute('href')).toEqual(enhancedLink);
        const budgetAmountEl = document.querySelector(`#${id} .price .budget-amount`);
        expect(budgetAmountEl).toBeDefined();
        const budgetAmount = budgetAmountEl.textContent.trim();
        expect(budgetAmount).toEqual(`€${usGeodataResponse.city.budget.value_midrange}`);
        
        const subtitleEl = document.querySelector(`#${id} .subtitle`);
        const subtitle = subtitleEl.textContent.trim();
        expect(subtitle).toEqual(usGeodataResponse.city.asciiname);
        done();
      })
    });

    it('should display error when failing', (done) => { 
      geoDataSpy.and.callThrough();
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /.*geodata.*/gi
      ).andReturn({
        status: 500,
        contentType: 'text/plain'
      });
      tag.update();
      Helpers.waitsFor(() => !tag.loading).then(() => {
        expect(document.querySelector(`#${id} .price .budget-amount`)).toEqual(null);
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