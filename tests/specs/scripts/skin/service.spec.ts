import 'jasmine';

import {SkinService} from '../../../../src/scripts/skin/service';
import ApiManager from  '../../../../src/scripts/api/manager';

import {clearAllStorage} from '../../../helpers/reset';

import skin from '../../../fixtures/skin.response';

describe('Skin service ', () => {
  let service:SkinService;
  let skinSpy:jasmine.Spy;

  beforeEach(() => {
    clearAllStorage();
    service = new SkinService();
    skinSpy = spyOn(ApiManager, 'getSkin').and.callFake(() => Promise.resolve({response:skin}));
  })

  it('should not have been initialized when created', () => { 
    expect(ApiManager.getSkin).not.toHaveBeenCalled();
    expect(service.getValue('primary')).toEqual(null);
  });

  it('should be able to initialize', (done) => { 
    const skin = 'avs';
    service.initialize(skin);
    service.ready().then((error) => { 
      expect(error).not.toBeDefined();
      expect(ApiManager.getSkin).toHaveBeenCalledWith(skin);
      expect(service.getValue('primary')).toEqual('#2676c3');
      done();
    });
  });

  it('should throw error when skin has no variable', (done) => {
    skinSpy.and.callFake(() =>  Promise.resolve({response:''}));
    const skin = 'avs';
    service.initialize(skin);
    service.ready().catch((error) => { 
      expect(error).toBeDefined();
      done();
    });
  });

  it('should throw an error when skin does not exist', (done) => { 
    skinSpy.and.callFake(() =>  Promise.reject());
    const skin = 'unknown';
    service.initialize(skin);
    service.ready().catch((error) => { 
      expect(error).toBeDefined();
      done();
    });
  });

  it('should extract css key value pair', () => { 
    const keyValue = service.extract('map-marker-stroke: #fff');
    expect(keyValue).toEqual(jasmine.objectContaining({
      key : 'map-marker-stroke',
      value : '#fff'
    }));
  });
  
  it('should extract css key value pair edge cases', () => { 
    const keyValue = service.extract('poi-bg:linear-gradient(to right,#005eb8 10%, rgba(0,0,0,0) 100%),');
    expect(keyValue).toEqual(jasmine.objectContaining({
      key : 'poi-bg',
      value : 'linear-gradient(to right,#005eb8 10%, rgba(0,0,0,0) 100%)'
    }));
  });

  it('should ignore malformed css key value pair', () => { 
    const keyValue = service.extract('map-marker-stroke #fff,');
    expect(keyValue).toEqual(null);
  });
});