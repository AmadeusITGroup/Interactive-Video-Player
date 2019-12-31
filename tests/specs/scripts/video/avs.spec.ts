import 'jasmine';
import 'jasmine-ajax';

import * as Helpers from '../../../helpers';

import {AVSVideoService} from  '../../../../src/scripts/video/avs';
import ApiManager from  '../../../../src/scripts/api/manager';
import SkinService from  '../../../../src/scripts/skin/service';

import {default as ConfigurationService} from '../../../../src/scripts/configuration/service';
import { Network, Environment } from '../../../../src/scripts/enums';

import * as Utils from '../../../../src/scripts/utils';

import {avsConfiguration, producerResponse, videoResponse, vimeoResponse, externalVideoResponse} from '../../../fixtures/video';
import sessionResponse from '../../../fixtures/session.response';


describe('AVS video service', () => {
  const server = ConfigurationService.getValue(Environment.MAIN_SERVER);
  const videoID = '5a09876e4d7fac0001a8592d';

  let service:AVSVideoService;

  beforeEach(() => {
    Helpers.clearAllStorage();
    spyOn(ApiManager, 'createSession').and.callFake(() => Promise.resolve({response:sessionResponse}));    
    spyOn(ApiManager, 'getProducer').and.callFake(() => Promise.resolve({response:producerResponse}));    

    const options = Object.assign({}, avsConfiguration, {dimensions: new DOMRect(0,0,1800, 0)});
    service = new AVSVideoService(options);

    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(
      /.*styles.*/gi
    ).andReturn({
      status: 200,
      contentType: 'text/plain',
      response: `$holidaypirates : (
        watermark: url(https://storage.googleapis.com/travelcast/images/logo-holidaypirates.svg) no-repeat center
      );`
    });
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should create session if needed', (done) => { 
    spyOn(ApiManager, 'getVideo').and.callFake(() => Promise.resolve({response:videoResponse}));
    spyOn(ApiManager, 'getVimeoSource').and.callFake(() => Promise.resolve({response:vimeoResponse}));

    service.getData().then((data:any) => {
      const authorizedStore = Utils.getAuthorizedStore();
      const key = Utils.getTravelCastKeyName(authorizedStore)
      expect(ApiManager.createSession).toHaveBeenCalled();
      expect(Utils.getKey(authorizedStore, key)).toBeDefined();
      done();
    });
  });

  it('should not create session if token if exists', (done) => { 
    spyOn(ApiManager, 'getVideo').and.callFake(() => Promise.resolve({response:videoResponse}));
    spyOn(ApiManager, 'getVimeoSource').and.callFake(() => Promise.resolve({response:vimeoResponse}));

    Helpers.setBearer();
    service.getData().then(() => {
      expect(ApiManager.createSession).not.toHaveBeenCalled();
      done();
    });
  });

  it('should generate captions', () => { 
    const captions = service.getCaptions(videoResponse.captions);
    expect(captions.length).toBe(2);
    const first = captions[0];
    expect(first.label).toEqual('English');
    expect(first.srclang).toEqual('en');
    expect(first.kind).toEqual('captions');
    expect(captions[1].label).toEqual('Unknown');
  });

  it('should pick appropriate video resolution', () => { 
    const withoutHLS = { files : vimeoResponse.files.slice(0, 4)};

    expect(service.getVideoResolution(vimeoResponse, new DOMRect(0,0,1800, 0))).toBe(1800);
    expect(service.getVideoResolution(vimeoResponse, new DOMRect(0,0,180, 0))).toBe(180);
    expect(service.getVideoResolution(vimeoResponse, new DOMRect(0,0,3440, 0))).toBe(3440);

    expect(service.getVideoResolution(withoutHLS, new DOMRect(0,0,1800, 0))).toBe(1280);
    expect(service.getVideoResolution(withoutHLS, new DOMRect(0,0,180, 0))).toBe(640);
    expect(service.getVideoResolution(withoutHLS, new DOMRect(0,0,3440, 0))).toBe(1920);
  });

  it('should get branding', (done) => {
    //@ts-ignore
    service.videoDetails = {
      meta : videoResponse
    }
    SkinService.initialize('holidaypirates');
    SkinService.ready().then(()=> {
      service.getBranding().then((brand:any) => {
        expect(ApiManager.getProducer).toHaveBeenCalledWith(videoResponse.producer_id);
        expect(brand.destination).toBe(producerResponse.links[0].url);
        expect(brand.destinationTarget).toBe('_blank');
        expect(brand.image).toBe(SkinService.getValue('watermark'));

        done();
      });
    });
  });

  it('should generate sorted video sources', () => {
    const sources = service.getVideoURLs(vimeoResponse) as any;
    expect(sources.length).toEqual(5);
    const last = sources[sources.length - 1];
    expect(last.res).toEqual(Infinity);
    expect(last.type).toEqual('application/x-mpegURL');
    expect(last.label).toEqual('Auto');    
    expect(last.src).toEqual(vimeoResponse.files[4].link_secure);

    const first = sources[0];
    expect(first.res).toEqual(640);
    expect(first.type).toEqual('video/mp4');

    expect(sources).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({label : '1080p <small>HD</small>'}),
      jasmine.objectContaining({label : '720p <small>HD</small>'}),
      jasmine.objectContaining({label : '360p <small>SD</small>'}),
      jasmine.objectContaining({label : '540p <small>SD</small>'}),
      jasmine.objectContaining({label : 'Auto'})
    ]))
  });

  it('should linearize POIs', () => {
    const pois = service.normalize(videoResponse) as any;
    expect(pois.length).toEqual(videoResponse.linearized_video_pois.length);
    pois.forEach((poi:any) => {
      expect(poi.time).toBeDefined();
      expect(poi.poi_name).toBeDefined();
    });
  });

  it('should not get branding when producer_id is not defined', (done) => {
    let video = Object.assign({}, videoResponse);
    delete video.producer_id;

    Helpers.setBearer();
    spyOn(ApiManager, 'getVideo').and.callFake(() => Promise.resolve({response:video}));
    spyOn(ApiManager, 'getVimeoSource').and.callFake(() => Promise.resolve({response:vimeoResponse}));

    spyOn(service, 'getBranding');
    service.getData().then(() => {
      expect(service.getBranding).not.toHaveBeenCalled();
      done();
    })
  });

  it('should generate video details as expected', (done) => {
    Helpers.setBearer();
    spyOn(ApiManager, 'getVideo').and.callFake(() => Promise.resolve({response:videoResponse}));
    spyOn(ApiManager, 'getVimeoSource').and.callFake(() => Promise.resolve({response:vimeoResponse}));

    service.getData().then((videoDetails) => {
      expect(videoDetails.brand).toBeDefined();
      expect(videoDetails.brand.destination).toBe(producerResponse.links[0].url);

      expect(videoDetails.captions).toBeDefined();
      expect(videoDetails.captions.length).toEqual(2);

      expect(videoDetails.meta).toBeDefined();
      expect(videoDetails.meta.title).toEqual(videoResponse.title);

      expect(videoDetails.pois).toBeDefined();
      expect(videoDetails.pois.length).toEqual(videoResponse.linearized_video_pois.length);

      expect(videoDetails.selectedResolution).toBe(1800);

      expect(videoDetails.sources).toBeDefined();
      expect(videoDetails.sources.length).toEqual(5);

      done();
    })
  });

  it('should not called vimeo when video is external', (done) => {
    //@ts-ignore
    service.opts.external = true;
    Helpers.setBearer();
    spyOn(ApiManager, 'getVideoBy').and.callFake(() => Promise.resolve({response:[externalVideoResponse]}));
    spyOn(ApiManager, 'getVimeoSource').and.callThrough();

    service.getData().then((videoDetails:any) => {
      expect(ApiManager.getVimeoSource).not.toHaveBeenCalled();
      expect(videoDetails.sources.length).toBe(1);
      expect(videoDetails.sources).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({
          src: externalVideoResponse.original_source
        })
      ]));
      done();
    });
  });

  describe('should not', () => {
    beforeEach(()=>{
      Helpers.setBearer();
    })


    it('initialized when video is not found', (done) => {
      
      jasmine.Ajax.stubRequest(
        /.*video.*/gi
      ).andReturn({
        status: 500
      });
      service.getData().then((videoDetails:any) => {
        console.error('"should not initialized when video is not found" test should not be able to acces this piece of code');
        done();      
      }).catch((e) => {
        expect(e).toEqual(2);
        done();
      });
    });


    it('initialized when vimeo is not found', (done) => {
      spyOn(ApiManager, 'getVideo').and.callFake(() => Promise.resolve({response:videoResponse}));
      jasmine.Ajax.stubRequest(
        /.*vimeo.*/gi
      ).andReturn({
        status: 500
      });
      service.getData().then((videoDetails:any) => {
        console.error('"should not initialized when vimeo is not found" test should not be able to acces this piece of code');
        done();      
      }).catch((e) => {
        expect(e).toEqual(3);
        done();
      });
    });
  });
});
