import 'jasmine';
import 'jasmine-ajax';

import {UserDataService} from '../../../src/scripts/user';
import ApiManager from '../../../src/scripts/api/manager';
import ConfigurationService from '../../../src/scripts/configuration/service';
import {Environment} from '../../../src/scripts/enums';


import {clearAllStorage} from '../../helpers/reset';
import originAirportsRessponse from "../../fixtures/origin.airports.response";
import currencyResponse from "../../fixtures/currency.response";


describe('User data service', () => {
  const server = ConfigurationService.getValue(Environment.MAIN_SERVER);

  let service:UserDataService;
  const latitude  = 43.622650;
  const longitude = 7.060159;

  beforeEach(() => {
    clearAllStorage();
    service = new UserDataService();

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

  it('should use first element in airport list', (done) => { 
    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsRessponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));

    service.ready(() => {
      const first = originAirportsRessponse[0];
      expect(service.data).toEqual(jasmine.objectContaining({
        initialized : true,
        city : first.city_name,
        airport : first.airport_name,
        airportCode : first.airport,
        countryCode : 'FR'
      }));
      done();
    });
  });

  it('should initialize with ipstack first', (done) => { 
    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsRessponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));

    service.ready(() => {
      expect(ApiManager.getNearestAirport).toHaveBeenCalled();
      expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
      expect(ApiManager.getCurrency).toHaveBeenCalled();
      
      expect(service.data.initialized).toEqual(true);
      done();
    });
  });

  it('should fallback to navigator.geolocation', (done) => { 
    const apiKey = ConfigurationService.getValue(Environment.IP_STACK_API_KEY);
    //Change IPStack api key to a wrong value to force fallback
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, '');
    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsRessponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));

    service.ready(() => {
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      expect(ApiManager.getNearestAirport).toHaveBeenCalledWith(latitude, longitude);
      expect(service.data).toEqual(jasmine.objectContaining({
        initialized : true,
        countryCode : 'FR',
        latitude : latitude,
        longitude : longitude
      }));
      ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
      done();
    });
  });

  it('should initialize even if currency service is failing', (done) => { 
    const apiKey = ConfigurationService.getValue(Environment.IP_STACK_API_KEY);
    //Change IPStack api key to a wrong value to force fallback
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, '');

    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsRessponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:{status : 'ko'}}));

    service.ready(() => {
      expect(ApiManager.getNearestAirport).toHaveBeenCalledWith(latitude, longitude);
      expect(service.data).toEqual(jasmine.objectContaining({
        initialized : true,
        currencyCode : 'EUR',
        currencySymbol : '€'
      }));
      ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
      done();
    });
  });

  it('should initialize even if currency service is inaccessible', (done) => { 
    const apiKey = ConfigurationService.getValue(Environment.IP_STACK_API_KEY);
    //Change IPStack api key to a wrong value to force fallback
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, '');

    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsRessponse}));

    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(
      `${server}/api/currency/for/FR`
    ).andReturn({
      status: 500,
      contentType: 'text/plain'
    });
    service.ready(() => {
      expect(ApiManager.getNearestAirport).toHaveBeenCalledWith(latitude, longitude);
      expect(service.data).toEqual(jasmine.objectContaining({
        initialized : true,
        currencyCode : 'EUR',
        currencySymbol : '€'
      }));
      jasmine.Ajax.uninstall();
      ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
      done();
    });
  });

  it('should execute callback immediately when serivce is ready', (done) => { 
    const apiKey = ConfigurationService.getValue(Environment.IP_STACK_API_KEY);
    //Change IPStack api key to a wrong value to force fallback
    ConfigurationService.setValue(Environment.IP_STACK_API_KEY, '');
    spyOn(ApiManager, 'getNearestAirport').and.callFake(() => Promise.resolve({response:originAirportsRessponse}));
    spyOn(ApiManager, 'getCurrency').and.callFake(() => Promise.resolve({response:currencyResponse}));


    spyOn(service, 'intialize').and.callThrough();
    
    service.ready(() => {
      //@ts-ignore
      expect(service.intialize.calls.count()).toEqual(1);
      //@ts-ignore
      service.intialize.calls.reset();
      service.ready(() => {
        //@ts-ignore
        expect(service.intialize.calls.count()).toEqual(0);
        ConfigurationService.setValue(Environment.IP_STACK_API_KEY, apiKey);
        done();
      })
    });
  });
});