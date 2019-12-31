import 'jasmine';
import 'jasmine-ajax';

import {ApiManager} from '../../../../src/scripts/api/manager';
import {default as ConfigurationService} from '../../../../src/scripts/configuration/service';
import {Environment} from '../../../../src/scripts/enums';

import {clearAllStorage} from '../../../helpers/reset';

import * as Utils from '../../../../src/scripts/utils';

import innsbruckResponse from '../../../fixtures/places/innsbruck.response';
import marker from '../../../fixtures/marker';


describe('Api manager', () => {
  let manager:ApiManager;
  const videoID = 'video-1';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcmlkIjoiNThkOGJiMDlmMTQ5YzUwMDAxMzJjNjZjIiwiZW52IjoiUFJPRFVDVElPTiIsInNlc3Npb25pZCI6IjVjMGE5M2JlOTU4ZGYyMDAwMTNkN2IyMyJ9.zD3E0MJIYWoTi7Lbv04XaW7gs4BxUtE4H03sBJpfOI0';
  const bearer = `Bearer ${token}`;
  
  beforeEach(() => {
    clearAllStorage();
    manager = new ApiManager();
    const authorizedLocation = Utils.getAuthorizedStore();
    Utils.setKey(authorizedLocation, Utils.getTravelCastKeyName(authorizedLocation), token, 1);
  });

  it('should use saved token', () => { 
    const stubURL = `${manager.base}/video/${videoID}`;
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(stubURL);
    const p = manager.getVideo(videoID);
    const request = jasmine.Ajax.requests.mostRecent();
    jasmine.Ajax.uninstall();
    expect(request.url).toEqual(stubURL);
    expect(request.requestHeaders.authorization).toEqual(bearer);
  });

  it('should fallback to default value when MAIN_SERVER variable is undefined', () => { 
    const restore =  ConfigurationService.getValue(Environment.MAIN_SERVER);
    ConfigurationService.setValue(Environment.MAIN_SERVER, 'null');
    expect(manager.server).toEqual('');
    delete ConfigurationService.cfg.MAIN_SERVER;
    expect(manager.server).toEqual('');
    
    ConfigurationService.setValue(Environment.MAIN_SERVER, restore);
  });

  it('(e2e) should return value stored in places cache for subsequent calls', (done) => { 
    manager.getPlace(innsbruckResponse.result.place_id).then((responseA) => {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /.*place.*/gi
      ).andReturn({
        status: 500,
        contentType: 'text/plain'
      });
      manager.getPlace(innsbruckResponse.result.place_id).then((responseB) => {
        expect(responseB.place_id).toEqual(responseA.place_id);
        jasmine.Ajax.uninstall();
        done();
      })
    })
  });

  it('(e2e) should return value stored in pois cache for subsequent calls', (done) => { 
    manager.getPOI(marker.poi_id).then((responseA) => {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /.*place.*/gi
      ).andReturn({
        status: 500,
        contentType: 'text/plain'
      });
      manager.getPOI(marker.poi_id).then((responseB) => {
        expect(responseB.poi_id).toEqual(responseA.poi_id);
        jasmine.Ajax.uninstall();
        done();
      })
    })
  });
});