
import 'jasmine';
import 'jasmine-ajax';
import 'moment';

import * as Riot from 'riot';

import * as Helpers from '../../../helpers';

import '../../../../src/locales/en_US';
import '../../../../src/tags/webplayer/templates/components/carousel.tag';

import marker from '../../../fixtures/marker';

declare const i18n:any;

describe('Carousel tag', () => {
  const locale = 'en_US';

  let host:Riot.TagInstance;
  let tag:Riot.TagInstance;

  const tagName = 'carousel';
  const id = 'fixture';

  const interval = 250;
  const photos = [
    'https://www.amadeus-video-solutions.com/api/place/picture/CmRaAAAAE3We8LQSmlHeGjMw6RNyaMJYxNBv4-OgJwSpcnjJHH6KhWrFoIEfOpSeMtbS0or56JGcrehAmLMYbw0grgCFo9xeOYtBQgMiZoph4_eZmeuYqJ-dQU_xJjNzkyHspMs8EhCYagNEt5ybR2W3Xyd_wsJbGhQtaoH485mPsQ1RUTgdMuwI5kfCRw',
    'https://www.amadeus-video-solutions.com/api/place/picture/CmRaAAAAOy7ZMKk_dJgFgZv8vp38WB46dqYNrFzpZy4BQU7uPw0fei2SrxLWjIIwj_04voCMpFo4BEkxO3bv_zUz8_X7aLziBjMRvJUGUeklnrHbIuOEOw86rhYlQk25hCeaAUKNEhC-8LDri3Q8N_RDwOgj2n35GhTyicu4lyQWIgiZk1pl6FWrxDGeGA',
    'https://www.amadeus-video-solutions.com/api/place/picture/CmRaAAAArtT-sN4SwJ35KOcScWCQQiwPMOoXLsi0wWf3rHjmebMTCXrhxq2fPkbEb7BXavIRCHFZWoslmyEOgAg3WJ3ll4Zg-A-_KPIaqjxuxmKhmHCvgx31FD0zULuNJD1PDqH8EhDKs5PvvJrHrr4yw0e9bG4XGhSVaYrHsctVzICZdL1G5syOn2KNWQ'
  ];
 
  let opts:any = {
    photos : []
  };

  // inject the HTML fixture for the tests
  beforeAll(() => {
    i18n.setLanguage(locale);
  });

  afterEach((done) => {
    opts.photos = [];
    Helpers.unmount(id, {host: host, tag:tag}).then(done);
  });

  describe('in edit mode', () => {
    beforeEach((done) => {
      Helpers.mount(id, tagName, {
        marker : marker,
        interval : interval,
        editable : true,
        photos : opts.photos
      }).then((res) => {
        host = res.host;
        tag = res.tag;
        done();
      });
    });

    it('should not set interval', (done) => { 
      tag.opts.photos = [photos[0]];
      Helpers.update(tag, true);
      spyOn(tag, 'onTick').and.callThrough();
      const now = Date.now();
      Helpers.waitsFor(() => Date.now() > now + (2*interval)).then(() => {
        expect(tag.onTick).not.toHaveBeenCalled();
        done();
      })
    });
  });

  describe('in view mode', () => {
    beforeEach((done) => {
      Helpers.mount(id, tagName, {
        marker : marker,
        interval : interval,
        editable : false,
        photos : opts.photos
      }).then((res) => {
        host = res.host;
        tag = res.tag;
        done();
      });
    });

    it('should display photos', () => { 
      opts.photos.splice(0, 0, ...photos);
      tag.update();
      expect(document.querySelector(`#${id} .no-pictures`)).toEqual(null);
      const slides = document.querySelectorAll(`#${id} .slide-img`);
      expect(slides.length).toEqual(photos.length);
      photos.forEach((p , i) => {
        const slide = slides[i] as HTMLDivElement;
        expect(slide.style.cssText).toEqual(`background-image: url("${p}");`);
      });
      expect(document.querySelector(`#${id} .carousel-indicators`)).toBeDefined();
    });
    
    it('should change active photo', (done) => { 
      opts.photos.splice(0, 0, ...photos);
      tag.update();
      const selected = 2;
      tag.show(selected);
      const second = document.querySelector(`#${id} .indicator:nth-child(${selected+1})`) as HTMLLIElement;
      Helpers.waitsFor(() => second.classList.contains('active')).then(() => {
        //This asserttion is always valid as waitsFor function ensure this is true
        //but Jasmine need a least one expect statment
        expect(second.classList.contains('active')).toBeTruthy();
        done();
      })
    });

    it('should cycle through photos', (done) => { 
      opts.photos.splice(0, 0, ...photos);
      tag.update();
      Helpers.waitsFor(() => {
        const second = document.querySelector(`#${id} .item:nth-child(2)`) as HTMLDivElement;
        return second && second.classList.contains('active');
      }).then(() => {
        const second = document.querySelector(`#${id} .indicator:nth-child(2)`) as HTMLLIElement;
        expect(second.classList.contains('active')).toBeTruthy();
        done();
      })
    });

    it('should not display navigation for single photo', () => { 
      opts.photos.splice(0, 0, photos[0]);
      tag.update();
      expect(document.querySelector(`#${id} .carousel-indicators`)).toEqual(null);
    });

    it('should not set interval for single photo', (done) => { 
      opts.photos.splice(0, 0, photos[0]);
      tag.update();
      spyOn(tag, 'onTick').and.callThrough();
      const now = Date.now();
      Helpers.waitsFor(() => Date.now() > now + (2*interval)).then(() => {
        expect(tag.onTick).not.toHaveBeenCalled();
        done();
      })
    });

    it('should display default image when no photo', () => { 
      expect(document.querySelector(`#${id} .no-pictures`)).toBeDefined();
      expect(document.querySelector(`#${id} .carousel-indicators`)).toEqual(null);
    });
  });
});