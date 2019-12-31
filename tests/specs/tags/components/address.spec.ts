

import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';

import * as Helpers from '../../../helpers';
import ApiManager from '../../../../src/scripts/api/manager';


import "../../../../src/tags/webplayer/mixins/template.js";
import '../../../../src/locales/en_US';
import '../../../../src/tags/i18n/localize.tag';
import '../../../../src/tags/webplayer/templates/components/address.tag';

import marker from '../../../fixtures/marker';
import placeResponse from '../../../fixtures/places/innsbruck.response';


declare const i18n:any;

describe('Address tag', () => {
  const locale = 'en_US';

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'address';
  const id = 'fixture';

  let placeSpy:jasmine.Spy;

  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);
  });

  beforeEach((done) => {
    Helpers.mount(id, tagName, {
      marker : marker,
    }).then((res) => {
      host = res.host;
      tag = res.tag;
      done();
    });
    placeSpy = spyOn(ApiManager, 'getPlace').and.callFake(() => Promise.resolve(placeResponse.result));
  });

  afterEach((done) => {
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  it('should display address', (done) => { 
    tag.update();
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const addressEl = document.querySelector(`#${id} .address.value`)
      expect(addressEl.textContent.trim()).toBe(placeResponse.result.formatted_address);
      done();
    });
  });

  it('should not display when place fails', (done) => { 
    placeSpy.and.callFake(() => Promise.reject());
    tag.update();
    Helpers.waitsFor(() => !tag.loading).then(() => {
      expect(document.querySelector(`#${id} .address.value`)).toEqual(null);
      done();
    });
  });
});