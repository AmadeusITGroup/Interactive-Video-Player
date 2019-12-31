

import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';
import * as Helpers from '../../helpers';

import '../../../src/locales/en_US';
import '../../../src/tags/i18n/localize.tag';
import '../../../src/tags/webplayer/header.tag';

import markerBluePrint from '../../fixtures/marker';
declare const i18n:any;
describe('Header tag', () => {
  const locale = 'en_US';

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'avs-header';
  const id = 'fixture';

  let marker:any;

  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);
  });

  const createHeader = (marker?:any) => {
    return new Promise((resolve, reject) => {
      Helpers.mount(id, tagName, {
        played : true,
        marker : marker
      }).then((res) => {
        host = res.host;
        tag = res.tag;
        resolve();
      }).catch(() => reject);
    })
  };

  afterEach((done) => {
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  it('should display header', (done) => { 
    createHeader(Object.assign({}, markerBluePrint)).then(() => {
      const iconEl = document.querySelector(`#${id} .fa.type`);
      const nameEl = document.querySelector(`#${id} .poi-container .name`);

      expect(iconEl.classList.contains('default')).toBeTruthy();
      expect(nameEl.textContent.trim()).toEqual(markerBluePrint.poi_name);
      done();
    });
  });

  it('should display icon accroding to marker types ', (done) => { 
    createHeader(Object.assign({}, markerBluePrint, {
      details : {
        types : ['cafe', 'night_club']
      }
    })).then(() => {
      const iconEl = document.querySelector(`#${id} .fa.type`);
      expect(iconEl.classList.length).toEqual(3);
      expect(iconEl.classList.contains('ticket')).toBeFalsy();
      done();
    })
  });

  it('should not display when marker is empty', (done) => { 
    createHeader(null).then(() => {
      const headerEl = document.querySelector(`#${id} .overlay-header`);    
      const nameEl = document.querySelector(`#${id} .poi-container .name`);
      const iconEl = document.querySelector(`#${id} .fa.type`);

      expect(headerEl.classList.contains('disabled')).toBeTruthy();
      expect(iconEl).toEqual(null);
      expect(nameEl).toEqual(null);

      done();
    });
  });
});