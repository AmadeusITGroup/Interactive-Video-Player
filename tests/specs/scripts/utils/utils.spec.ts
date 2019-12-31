import 'jasmine';
import 'jasmine-ajax';
import ApiManager from '../../../../src/scripts/api/manager';
import { default as ConfigurationService } from '../../../../src/scripts/configuration/service';
import { Environment, Network } from '../../../../src/scripts/enums';
import Store from '../../../../src/scripts/enums/store';
import * as Utils from '../../../../src/scripts/utils';
import * as Helpers from '../../../helpers';




describe('Utils > ', () => {

  describe('Cookies helpers', () => {
    const cookieName = 'test-cookie';
    const cookieValue = 'some value';

    beforeEach(() => {
      Helpers.clearAllStorage();
    });

    it('should store cookie', () => { 
      Utils.setCookie(cookieName, cookieValue, 365);
      expect(Utils.getCookie(cookieName)).toEqual(cookieValue);
    });

    it('should delete stored cookie', () => { 
      Utils.setCookie(cookieName, cookieValue, 365);
      Utils.eraseCookie(cookieName);
      expect(Utils.getCookie(cookieName)).toEqual(null);
    });

    it('should allow cookie', () => { 
      expect(Utils.isCookieAuthorized()).toBeTruthy();
    });
  });

  describe('DOM helpers', () => {
    const fixtureID = 'fixture';
    const className = 'test-class';
    const text = 'lorem ipsum'
    const htmlStr = `<span class="${className}">${text}</span>`;
    const malFormedHtmlStr = `<span>${text}/div>`;

    beforeEach(() => {
      const fixtureStr:string = `<div id="${fixtureID}"</div>`;
      document.body.insertAdjacentHTML(
        'afterbegin', 
        fixtureStr);
    });

    afterEach(() => {
      const fixture = document.querySelector(`#${fixtureID}`);
      if(fixture) {
        fixture.parentNode.removeChild(fixture);
      }
    })

    it('should transform HTML string to DOM node', () => { 
      const el = Utils.htmlToElement(htmlStr);
      expect(el.nodeName).toEqual('SPAN');
      expect(el.innerText).toEqual(text);
    });

    it('should transform malformed HTML', () => { 
      const el = Utils.htmlToElement(malFormedHtmlStr);
      expect(el.nodeName).toEqual('SPAN');
      expect(el.innerText).toEqual(`${text}/div>`);
    });

    it('should style DOM element', () => { 
      const style = {
        color : 'rgba(0, 124, 43, 0.5)',
        fontWeight: 'bold',
        border: '1px solid red'
      };
      Utils.style(`#${fixtureID}`, style);
      const el:HTMLElement = document.querySelector(`#${fixtureID}`);
      expect(el).toBeDefined();
      expect(el.style.cssText).toEqual(`color: ${style.color}; font-weight: ${style.fontWeight}; border: ${style.border};`)
    });

    it('should remove css classes', () => { 
      const selector = `#${fixtureID}`
      const el:HTMLElement = document.querySelector(selector);
      Utils.removeClass(selector, className);
      expect(el.classList.length).toEqual(0);

      const classList =  [`${className}1`,`${className}2`,`${className}1`];
      Utils.addClass(selector, classList);
      expect(el.classList.length).toEqual(2);

      Utils.removeClass(selector, classList);
      expect(el.classList.length).toEqual(0);
    });

    it('should remove all css classes when classArray is undefined', () => { 
      const selector = `#${fixtureID}`
      const el:HTMLElement = document.querySelector(selector);

      const classList =  [`${className}1`,`${className}2`,`${className}1`];
      Utils.addClass(selector, classList);
      Utils.removeClass(selector, null);
      expect(el.classList.length).toEqual(0);
    });

    it('should add css class', () => { 
      const selector = `#${fixtureID}`
      const el:HTMLElement = document.querySelector(selector);
      Utils.addClass(selector, className);
      expect(el.classList.length).toEqual(1);

      const classList =  [`${className}1`,`${className}2`,`${className}1`];
      Utils.addClass(selector, classList);
      expect(el.classList.length).toEqual(3);
    });
  });

  describe('Events helper', () => {
    const cfg = {
      eventName : 'myCustomEvent',
      fn : (e:any) => {}
    };

    beforeEach(()=>{
      spyOn(cfg, 'fn').and.callThrough;
      window.addEventListener(cfg.eventName, cfg.fn);
    })

    afterEach(()=>{
      window.removeEventListener(cfg.eventName, cfg.fn);
    })

    it('should dispatch event and call listener', () => { 
      const detail = {id : 'video'};
      Utils.dispatchEvent(cfg.eventName, detail);
      expect(cfg.fn).toHaveBeenCalledWith(jasmine.objectContaining({
        detail : jasmine.objectContaining(detail)
      }));
    });

    it('should debounce events', (done) => {
      let debouncedFn = Utils.debounce(cfg.fn, 250, false);
      for(let i=0; i< 10; i++) {
        debouncedFn();
      }
      window.setTimeout(() => {
        //@ts-ignore
        expect(cfg.fn.calls.count()).toEqual(1);
        done();
      }, 250)
    }); 
  });

  describe('JSONLd helper', () => {
    afterEach(()=> {
      document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
        el.parentNode.removeChild(el);
      })
    });

    it('should inject a script tag in the page', () => { 
      const jsonLDStr = `{
        "@context": "http://schema.org",
        "@type": "VideoObject",
        "name": "Funny Cat Poses 2.0",
        "description": "A short description of your video, we'd keep it at 140 characters just to be safe.",
        "thumbnailUrl": "http://www.example.com/thumbnail.jpg",
        "uploadDate": "2015-04-05T08:00:00+02:00",
        "duration": "PT1M33S",
        "contentUrl": "http://www.example.com/movie.mov",
        "embedUrl": "http://www.example.com/embed?videoetc",
        "interactionCount": "2347"
      }`;
      Utils.injectJSONLd(jsonLDStr, document.body);
      const jsonLd:HTMLScriptElement = document.querySelector('script[type="application/ld+json"]');
      expect(jsonLd).toBeDefined();
      expect(jsonLd.text).toEqual(jsonLDStr);
    });
  });

  describe('Google place type to Font awesome icon helper', () => {
    it('should return a list of icons', () => { 
      const icons = Utils.mapIcons(['airport', 'night_club', 'zoo']);
      expect(icons.length).toEqual(3);
      expect(icons).toEqual(jasmine.arrayContaining(['plane','ticket','paw']));      
    });

    it('should filter unknow icons', () => { 
      const icons = Utils.mapIcons(['airport', 'unknown', 'zoo', 'foo']);
      expect(icons.length).toEqual(2);
      expect(icons).toEqual(jasmine.arrayContaining(['plane','paw'])); 
    });

    it('should always return an array ', () => { 
      [null, 'test', {key : 'test'}].forEach((p) => {
        //@ts-ignore
        const icons = Utils.mapIcons(p);
        expect(Array.isArray(icons)).toBeTruthy();
        expect(icons.length).toEqual(0);
      });      
    });
  });

  describe('Mobile helper', () => {
    it('should detect mobile', () => { 
      expect(Utils.isMobile()).toBeFalsy();
      expect(Utils.isiOSDevice()).toBeFalsy();
      expect(Utils.isAndroidDevice()).toBeFalsy();    
    });

    it('should detect orientation', () => { 
      expect(Utils.getOrientation()).toEqual(0);  
    });
  });

  describe('Network helper', () => {
    const server = ConfigurationService.getValue(Environment.MAIN_SERVER);
    let options = {
      method: Network.POST,
      url: `${server}/api/session`,
      body: {
        api_key: ConfigurationService.getValue(Environment.API_KEY)
      },
      headers: {
        "Content-Type": "application/json"
      },
      json : false
    };
  

    it('should resolve promise for known endpoint', (done) => { 
      options.json = false;
      const p = Utils.makeRequest(options);
      p.then((data:any) => {
        expect(typeof data.response).toEqual('string');
        expect(data.response.indexOf('"env"')).toBeGreaterThan(0)
        done();
      })
    });

    it('should resolve promise and parse JSON reponse', (done) => { 
      options.json = true;
      const p = Utils.makeRequest(options);
      p.then((data:any) => {
        expect(data.response).toEqual(jasmine.objectContaining({
          env : 'PRODUCTION'
        }));
        done();
      })
    });

    it('should inject parameters in url', () => { 
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        `${server}/api/currencies`
      );
      const p = Utils.makeRequest({
        method: Network.GET,
        url: `${server}/api/currencies`,
        params : {
          page : '1'
        }
      });
    
      const request = jasmine.Ajax.requests.mostRecent();
      jasmine.Ajax.uninstall();
      expect(request.url).toEqual(`${server}/api/currencies?page=1`);
    });

    it('should attach data to body', () => { 
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        `${server}/api/currencies`
      );
      const p = Utils.makeRequest({
        method: Network.GET,
        url: `${server}/api/currencies`,
        body : {
          page : '1'
        }
      });
    
      const request = jasmine.Ajax.requests.mostRecent();
      jasmine.Ajax.uninstall();
      expect(Object.keys(request.data())).toEqual(jasmine.arrayContaining(['{"page":"1"}']));

    });

    it('should add custom headers to request', () => { 
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        `${server}/api/currencies`
      );
      const bearer = 'Bearer TEST';
      const p = Utils.makeRequest({
        method: Network.GET,
        url: `${server}/api/currencies`,
        headers : {
          authorization: bearer
        }
      });
    
      const request = jasmine.Ajax.requests.mostRecent();
      jasmine.Ajax.uninstall();
      expect(request.requestHeaders.authorization).toBeDefined();
      expect(request.requestHeaders.authorization).toEqual(bearer);
    });

    it('should reject promise for unknown endpoint', (done) => { 
      const p = Utils.makeRequest( {
        method: Network.GET,
        url: `${server}/ipa/noisses`
      });
      p.then(() => {
        console.error('This block should not be called');
      }).catch((data:any) => {
        expect(data).toBeDefined();
        done();
      })
    });

    it('should resolve promise for jsonp endpoint', (done) => { 
      const p = Utils.makeJSONp(`https://api.ipstack.com/check?access_key=${ConfigurationService.getValue(Environment.IP_STACK_API_KEY)}&format=1`);      
      p.then((data:any) => {
        expect(data).toBeDefined();
        done();
      });
    });

    it('should remove script injected for jsonp endpoint', (done) => { 
      const length = document.querySelectorAll('script').length;
      const p = Utils.makeJSONp(`https://api.ipstack.com/check?access_key=${ConfigurationService.getValue(Environment.IP_STACK_API_KEY)}&format=1`);      
      p.then(() => {
        expect(document.querySelectorAll('script').length).toEqual(length);
        done();
      });
    });
  })

  describe('Security helper', () => {
    beforeEach(() => {
      Helpers.clearAllStorage();
    });

    it('should return AVS key for store', () => { 
      [Store.COOKIE, Store.LOCAL_STORAGE, Store.SESSION_STORAGE].forEach((store) => {
        Helpers.clearAllStorage();
        expect(Utils.getTravelCastKeyName(store)).toEqual('tc-cookie');
        Utils.setKey(store, 'tc-env', 'TEST', 1);
        expect(Utils.getTravelCastKeyName(store)).toEqual('tc-cookie-TEST');
      });
    });

    it('should fallback to different store', () => { 
      expect(Utils.getAuthorizedStore()).toEqual(Store.COOKIE);
      spyOnProperty(document, 'cookie', 'get').and.returnValue('');
      expect(Utils.getAuthorizedStore()).toEqual(Store.LOCAL_STORAGE);
      spyOn(localStorage, 'getItem').and.callFake(():any => null);
      expect(Utils.getAuthorizedStore()).toEqual(Store.SESSION_STORAGE);
      spyOn(sessionStorage, 'getItem').and.callFake(():any => null);
      expect(Utils.getAuthorizedStore()).toEqual(Store.NONE);
    });
    

    it('should read token stored by create session', (done) => { 
      ApiManager.createSession().then(() => {
        expect(Utils.getToken()).toBeDefined();  
        done();
      });
    });
  });

  describe('Storage helper', () => {
    const key = 'testKey';
    const unknownKey = 'unknownKey';
    const value = 'testValue';

    beforeEach(() => {
      Helpers.clearAllStorage();
    });

    it('should store data in local storage', () => { 
      Utils.setLocalStorageValue(key, value);
      expect(Utils.getLocalStorageValue(key)).toEqual(value);
      expect(Utils.getLocalStorageValue(unknownKey)).toEqual(null);

    });

    it('should store data in session storage', () => { 
      Utils.setSessionStorageValue(key, value);
      expect(Utils.getSessionStorageValue(key)).toEqual(value);
      expect(Utils.getSessionStorageValue(unknownKey)).toEqual(null);
    });

    it('should store data in given store', () => { 
      Utils.setKey(Store.COOKIE, key, value, 1);
      expect(Utils.getKey(Store.COOKIE, key)).toEqual(value);

      Utils.setKey(Store.LOCAL_STORAGE, key, value, 1);
      expect(Utils.getKey(Store.LOCAL_STORAGE, key)).toEqual(value);

      Utils.setKey(Store.SESSION_STORAGE, key, value, 1);
      expect(Utils.getKey(Store.SESSION_STORAGE, key)).toEqual(value);
    });
  });

  describe('UUID helper', () => {
    it('should return a valid UUID', () => {
      const uuid = Utils.uuid();
      expect(uuid.length).toEqual(36);
      expect(uuid.split('-').length).toEqual(5);
      expect(uuid.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)).not.toEqual(null);
    })
  });
});