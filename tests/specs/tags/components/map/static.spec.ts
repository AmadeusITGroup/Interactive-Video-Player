
import 'jasmine';
import 'jasmine-ajax';
import * as Riot from 'riot';

import * as Helpers from '../../../../helpers';
import {default as ApiManager, ApiManagerCache} from '../../../../../src/scripts/api/manager';
import {default as SkinService} from '../../../../../src/scripts/skin/service';

import '../../../../../src/tags/webplayer/templates/components/map/static.tag';

import {TemplateType} from '../../../../../src/scripts/enums';

import markerBluePrint from '../../../../fixtures/marker';
import innsbruckResponse from '../../../../fixtures/places/innsbruck.response';
import nycResponse from '../../../../fixtures/places/newyork.response';

import skinResponse from '../../../../fixtures/skin.response';

describe('Static map tag', () => {
  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'static-map';
  const id = 'fixture';

  let placeSpy:jasmine.Spy;
  let marker:any;
  let cfg:any;

  beforeAll(() => {
    spyOn(ApiManager, 'getSkin').and.callFake(() => Promise.resolve({response : skinResponse}));
    SkinService.initialize('avs');
  })

  beforeEach((done) => {
    placeSpy = spyOn(ApiManager, 'getPlace').and.callFake((id:string) => {
      if (id === nycResponse.result.place_id) 
        return Promise.resolve(nycResponse.result)
      else 
      return Promise.resolve(innsbruckResponse.result)
    });
    marker = Object.assign({}, markerBluePrint);
    cfg = {
      template_type : TemplateType.Default
    };
    Helpers.mount(id, tagName, {
      marker : marker,
      cfg : cfg
    }, 'template').then((res) => {
      host = res.host;
      tag = res.tag;
      done();
    });
  });

  afterEach((done) => {
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  it('should generate static map url', (done) => { 
    Helpers.update(tag, true);
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      expect(mapEl.style.cssText).not.toEqual('background-image: url("https://storage.googleapis.com/travelcast/images/no-map.svg");');
      done();
    });
  });

  it('should set google map link', (done) => { 
    tag.update();
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      const link = mapEl.getAttribute('href');
      expect(link).not.toEqual('javascript:void(0)');
      done();
    });
  });

  it('should take into account zoom level', (done) => { 
    cfg.zoom_level = 3;
    Helpers.update(tag, true); 
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      const style = mapEl.style.cssText;
      expect(style.indexOf(`zoom=${cfg.zoom_level}`)).toBeGreaterThan(0);
      done();
    });
  });

  it('should add multiple points for tour template', (done) => { 
    cfg.template_type = TemplateType.Tour;
    cfg.places = [innsbruckResponse.result.place_id, nycResponse.result.place_id];
    placeSpy.calls.reset();    
    Helpers.update(tag, true);    
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      //@ts-ignore
      expect(placeSpy.calls.count()).toBe(2);

      const style = mapEl.style.cssText;

      expect(style.indexOf(`%7C${innsbruckResponse.result.geometry.location.lat},${innsbruckResponse.result.geometry.location.lng}`)).toBeGreaterThan(0);
      expect(style.indexOf(`%7C${nycResponse.result.geometry.location.lat},${nycResponse.result.geometry.location.lng}`)).toBeGreaterThan(0);
      
      done();
    });
  });

  it('should not have marker if places is undefined in cfg object for tour template', (done) => { 
    cfg.template_type = TemplateType.Tour;
    placeSpy.calls.reset();
    Helpers.update(tag, true);    
    Helpers.waitsFor(() => !tag.loading).then(() => {
       //@ts-ignore
       expect(placeSpy.calls.count()).toBe(0);

      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      const link = mapEl.getAttribute('href');
      expect(link).toEqual('javascript:void(0)');
      done();
    });
  });

  it('should display default image when no marker', (done) => {
    Object.keys(marker).forEach((k) => delete marker[k]);
    Helpers.update(tag, true);
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      expect(mapEl.style.cssText).toEqual('background-image: url("https://storage.googleapis.com/travelcast/images/no-map.svg");');
      done();
    });
  });

  it('should complete even if place call fails', (done) => { 
    ApiManager.clear(ApiManagerCache.Places);
    placeSpy.and.callThrough();
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(
      /.*place.*/gi
    ).andReturn({
      status: 500
    });

    Helpers.update(tag, true);
    Helpers.waitsFor(() => !tag.loading).then(() => {
      const mapEl = document.querySelector(`#${id} .avs-map`) as HTMLAnchorElement;
      const link = mapEl.getAttribute('href');
      expect(link).toEqual('javascript:void(0)');
      jasmine.Ajax.uninstall();
      done();
    });
  });
});