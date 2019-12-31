import 'jasmine';
import 'jasmine-ajax';

import * as Helpers from '../../../helpers';

import {InlineVideoService} from  '../../../../src/scripts/video/inline';
import ApiManager from  '../../../../src/scripts/api/manager';

import * as Utils from '../../../../src/scripts/utils';

import cfg from '../../../fixtures/video/inline.configuration';

describe('Inline video service', () => {
  let service:InlineVideoService;
  
  beforeEach(() => {
    Helpers.clearAllStorage();
    spyOn(ApiManager, 'createSession').and.callThrough();
    service = new InlineVideoService(cfg);
  });

  it('should create video details', (done) => { 
    service.getData().then((videoDetails:any) => {
      expect(videoDetails.meta).toBeDefined();

      expect(videoDetails.pois).toBeDefined();
      expect(videoDetails.pois.length).toEqual(1);

      expect(videoDetails.captions).toBeDefined();
      expect(videoDetails.captions.length).toEqual(0);

      expect(videoDetails.selectedResolution).toBeDefined();
      expect(videoDetails.selectedResolution).toEqual(Infinity);

      expect(videoDetails.sources).toBeDefined();
      expect(videoDetails.sources.length).toEqual(1);


      done();
    });
  });

  it('should create session if needed', (done) => { 
    service.getData().then(() => {
      const authorizedStore = Utils.getAuthorizedStore();
      const key = Utils.getTravelCastKeyName(authorizedStore)
      expect(ApiManager.createSession).toHaveBeenCalled();
      expect(Utils.getKey(authorizedStore, key)).toBeDefined();
      done();
    });
  });

  it('should not create session if token if exists', (done) => { 
    Helpers.setBearer();
    service.getData().then(() => {
      expect(ApiManager.createSession).not.toHaveBeenCalled();
      done();
    });
  });

  it('should set single source correctly', (done) => { 
    service = new InlineVideoService(cfg);
    expect(ApiManager.createSession).not.toHaveBeenCalled();
    service.getData().then((videoDetails:any) => {
      expect(videoDetails.sources).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining(cfg.source)
        ])
      );
      done();
    });
  });

  it('should normalize POIs', () => { 
    service = new InlineVideoService(cfg);
    const normalized = service.normalize(cfg.pois);
    expect(normalized.pois.length).toBe(1);
    const first = normalized.pois[0];
    expect(first.poi_id).toBeDefined();
    expect(first.poi_id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)).not.toEqual(null);
    expect(first.time).toEqual(first.start_time);
    expect(first.end_time).toEqual(Infinity);
    expect(Object.keys(normalized.configurations).indexOf(first.poi_id)).toBe(0);
    const configuration = normalized.configurations[first.poi_id];
    expect(configuration.template_type).toEqual(first.configuration.template_type);
    expect(configuration.inline).toBeTruthy();
    
    expect(Object.keys(normalized.pictures).indexOf(first.poi_id)).toBe(0);
    const pictures = normalized.pictures[first.poi_id];
    expect(pictures.length).toBe(1);
    expect(pictures).toEqual(jasmine.arrayContaining([first.pictures[0]]));    
  });
});
