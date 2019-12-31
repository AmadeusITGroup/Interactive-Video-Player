import 'jasmine';
import {ConfigurationService} from '../../../../src/scripts/configuration/service';
import * as Env from '../../../../config/env/karma';
import {clearAllStorage} from '../../../helpers/reset';
import { Environment } from '../../../../src/scripts/enums';

describe('Configuration service ', () => {
  let service:ConfigurationService;

  beforeEach(() => {
    clearAllStorage();
    service = new ConfigurationService();
  });

  it('should return null for unknown value', () => { 
    expect(service.getValue('unknown')).toEqual(null);
  });

  it('should have been initialized with env variable', () => { 
    expect(service.getValue(Environment.MAIN_SERVER)).toEqual(Env.MAIN_SERVER);
    expect(service.getValue(Environment.VIMEO_API_KEY)).toEqual(Env.VIMEO_API_KEY);
    expect(service.getValue(Environment.API_KEY)).toEqual(Env.API_KEY);
    expect(service.getValue(Environment.GOOGLE_MAP_API_KEY)).toEqual(Env.GOOGLE_MAP_API_KEY);
    expect(service.getValue(Environment.GOOGLE_ANALYTICS_TRACKING_CODE)).toEqual(Env.GOOGLE_ANALYTICS_TRACKING_CODE);
    expect(service.getValue(Environment.IP_STACK_API_KEY)).toEqual(Env.IP_STACK_API_KEY);
  });

  it('should allow modification of existing value', () => { 
    const newValue = 'http://localhost:3000';
    service.setValue(Environment.MAIN_SERVER, newValue);
    expect(service.getValue(Environment.MAIN_SERVER)).toEqual(newValue);
  });

  it('should not allow object value', () => { 
    const newValue = {server : 'http://localhost:3000'};
    service.setValue('newKey', newValue);
    expect(service.getValue('newKey')).toEqual(null);
  });
});