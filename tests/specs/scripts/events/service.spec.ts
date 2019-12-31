import 'jasmine';
import analytics from 'universal-ga';

import {EventService} from '../../../../src/scripts/events/service';
import {Events} from '../../../../src/scripts/events/list';

import ApiManager from  '../../../../src/scripts/api/manager';
import * as Env from '../../../../config/env/karma';

import {setLocalStorageValue} from  '../../../../src/scripts/utils/storage';
import Profile from  '../../../../src/scripts/enums/profile';

import {clearAllStorage} from '../../../helpers/reset';

describe('Event service ', () => {
  let service:EventService;
  
  const videoDimensions = {
    'dimension1' : 'My video',
    'dimension4' : 'video-id-1'
  };

  const poiDimensions = {
    'dimension5' : 'Eiffel tower'
  }

  beforeAll(() => {
    spyOn(analytics, 'initialize');
    spyOn(analytics, 'create');
    spyOn(analytics, 'event');
    spyOn(analytics, 'pageview');
    spyOn(analytics, 'custom');
  });

  beforeEach(() => {
    clearAllStorage();
    service = new EventService();
    spyOn(ApiManager, 'event').and.callThrough();
  })

  afterEach(() => {
    const spies = ['initialize', 'create', 'event', 'pageview', 'custom'];
    //@ts-ignore
    spies.forEach((spy) => analytics[spy].calls.reset());
  });

  it('should initiialize with environment data', () => { 
    service.initialize([]);
    expect(analytics.initialize).toHaveBeenCalledWith(Env.GOOGLE_ANALYTICS_TRACKING_CODE);    
  });

  it('should allow the addition of a single GA tracking code', () => { 
    const GATrackingCode = 'UA-ADD';
    service.initialize(GATrackingCode);
    expect(analytics.create).toHaveBeenCalledWith(GATrackingCode, `tracking-${GATrackingCode}`);
  });

  it('should allow the addition of an array of GA tracking code', () => { 
    const GATrackingCodes = ['UA-ADD-1', 'UA-ADD-2'];
    service.initialize(GATrackingCodes);
    GATrackingCodes.forEach((GATrackingCode) => {
      expect(analytics.create).toHaveBeenCalledWith(GATrackingCode, `tracking-${GATrackingCode}`);
    })
  });

  it('should only allow strings as GA tracking code', () => { 
    const GATrackingCodes = [{code : 'UA-ADD-1'}, 'UA-ADD-2', null];
    service.initialize(GATrackingCodes);
    //@ts-ignore
    expect(analytics.create.calls.count()).toBe(1);
  });

  it('should only allow dimension keys', () => { 
    service.initialize([]);
    service.setVideoDimensions({
      dimension1 : 'My video',
      unknown : 'dimension',
      d1m3ns10n : 'My video'
    })
    //@ts-ignore
    expect(analytics.custom.calls.count()).toBe(1);
  });

  it('should not send event when not initialized', () => { 
    service.send(Events.START);
    expect(ApiManager.event).not.toHaveBeenCalled();
  });

  it('should not send event when diasabled', () => { 
    service.initialize([]);
    service.enabled(false);
    service.send(Events.START);
    expect(ApiManager.event).not.toHaveBeenCalled();
  });

  it('should not send event when profile is ADMIN', () => { 
    setLocalStorageValue('auth_profile', Profile.ADMIN);
    service.initialize([]);
    service.send(Events.START);
    expect(ApiManager.event).not.toHaveBeenCalled();
  });

  it('should send event to both providers', () => { 
    service.initialize([]);
    service.send(Events.START);
    expect(ApiManager.event).toHaveBeenCalled();
    expect(analytics.event).toHaveBeenCalledWith(Events.START.category, Events.START.ga, jasmine.any(Object));
    expect(analytics.pageview).not.toHaveBeenCalled();
  });

  it('should send event with merged dimensions', () => { 
    service.initialize([]);
    service.setVideoDimensions(videoDimensions);
    service.setPoiDimensions(poiDimensions);

    service.send(Events.START);
    expect(ApiManager.event).toHaveBeenCalledWith(jasmine.objectContaining({
      action: Events.START.tc,
      action_name: Events.START.ga,
      rsrc: videoDimensions.dimension4,
      event_details: jasmine.objectContaining({
        'dimension1' : videoDimensions.dimension1,
        'dimension4' : videoDimensions.dimension4,
        'dimension5' : poiDimensions.dimension5
      }),
      label: ''
    }));

    expect(analytics.event).toHaveBeenCalledWith(Events.START.category, Events.START.ga, jasmine.any(Object));
    expect(analytics.pageview).not.toHaveBeenCalled();
  });

  it('should update dimensions', () => { 
    service.initialize([]);
    service.setVideoDimensions(videoDimensions);
    service.setPoiDimensions(poiDimensions);

    const analyticDimensions = Object.assign({}, videoDimensions, poiDimensions);
    Object.keys(analyticDimensions).forEach((k) => {
      expect(analytics.custom).toHaveBeenCalledWith(k, analyticDimensions[k])
    })
  });

  it('should update dimensions for additional trackers', () => { 
    const GATrackingCode = 'UA-ADD-1'

    service.initialize(GATrackingCode);
    const additionalTracker = service.getTrackerFor(GATrackingCode);
    spyOn(additionalTracker, 'custom');

    service.setVideoDimensions(videoDimensions);
    service.setPoiDimensions(poiDimensions);

    const analyticDimensions = Object.assign({}, videoDimensions, poiDimensions);
    Object.keys(analyticDimensions).forEach((k) => {
      expect(additionalTracker.custom).toHaveBeenCalledWith(k, analyticDimensions[k])
    })
  });

  it('should return null for unknow tracking code', () => { 
    service.initialize([]);
    expect(service.getTrackerFor('UA-UNKNOWN')).toEqual(null);
  });
});