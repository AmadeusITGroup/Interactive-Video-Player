
import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';

import * as Helpers from '../../../helpers';
import ApiManager from '../../../../src/scripts/api/manager';


import "../../../../src/tags/webplayer/mixins/template.js";
import '../../../../src/locales/en_US';
import '../../../../src/tags/i18n/localize.tag';
import '../../../../src/tags/webplayer/templates/components/additional-info.tag';

import marker from '../../../fixtures/marker';
import placeResponse from '../../../fixtures/places/innsbruck.response';


declare const i18n:any;

describe('Additional info tag', () => {
  const locale = 'en_US';

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'additional-info';
  const id = 'fixture';

  let placeSpy:jasmine.Spy;

  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);
  });

  beforeEach((done) => {
    placeSpy = spyOn(ApiManager, 'getPlace').and.callFake(() => Promise.resolve(placeResponse.result));

    Helpers.mount(id, tagName, {
      marker : marker,
    }).then((res) => {
      host = res.host;
      tag = res.tag;
      done();
    });
  });

  afterEach((done) => {
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  it('should display rating', (done) => { 
    tag.update();
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const plainStars = document.querySelectorAll(`#${id} .rating .fa-star`);
      const emptyStars = document.querySelectorAll(`#${id} .rating .fa-star-o`); 
      const halfStars = document.querySelectorAll(`#${id} .rating .fa-star-half-o`); 

      expect(plainStars.length).toBe(3);
      expect(emptyStars.length).toBe(1);
      expect(halfStars.length).toBe(1);

      const ratingEl = document.querySelector(`#${id} .rating .value`);
      expect(ratingEl.textContent.trim()).toEqual('3.7/5');

      const phoneEl = document.querySelector(`#${id} .phone`);
      expect(phoneEl.textContent.trim()).toEqual(placeResponse.result.international_phone_number);
      const href = phoneEl.getAttribute('href');
      expect(href).toEqual(`tel:${placeResponse.result.international_phone_number}`);

      done();
    });
  });

  it('should not display when place fails', (done) => { 
    placeSpy.and.callFake(() => Promise.reject());
    tag.update();
    Helpers.waitsFor(() => !tag.loading).then(() => {
      expect(document.querySelector(`#${id} .phone`)).toEqual(null);
      expect(document.querySelector(`#${id} .rating`)).toEqual(null);

      done();
    });
  });
});