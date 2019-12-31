import { RequestOptions } from "../types/request-options.type";

/**
 * Load JSON-encoded data from the server using a GET HTTP request.
 * @param {string} uri A string containing the URL to which the request is sent.
 * @return {Promise<any>}
 */
export function makeJSONp(uri) {
  return new Promise(function(resolve, reject) {
      const id = `_${Math.round(10000 * Math.random())}`;
      const callbackName = `jsonp_callback_${id}`;
      window[callbackName] = function(data) {
        delete window[callbackName];
        let ele = document.getElementById(id);
        ele.parentNode.removeChild(ele);
        resolve(data);
      };

      let src = `${uri}&callback=${callbackName}`;
      if (uri.indexOf('?') < 0 ){
        src = `${uri}?callback=${callbackName}`;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.addEventListener('error', reject);
      (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script);
  });
}

/**
 * Perform an asynchronous HTTP (Ajax) request.
 * @param {RequestOptions} opts A set of key/value pairs that configure the Ajax request.
 * @return {Promise<any>}  
 */
export default function makeRequest (opts){
  return new Promise(function (resolve, reject) {
    let xhr = getXMLHttpRequest();
    let params = opts.params;
    if (params) {
      params = Object.keys(params).filter(key=>params[key]!==null).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    }
    let url = opts.url;
    if(params && params.length) {
      url = `${url}?${params}`;
    }

    xhr.open(opts.method, url);

    const onError = (status) => {
      let response = {
        status: status,
        statusText: xhr.statusText
      };
      reject(response);
    };

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        let response = xhr.response;
        if(opts.hasOwnProperty('json') && opts.json) {
          response = JSON.parse(response);
        }
        resolve({response : response, headers : getHeaders(xhr)});
      } else {
        onError(this.status);
      }
    };

    xhr.onerror = function () {
      if(opts.onerror){
        opts.onerror();
      }
      onError(this.status);
    };

    if (opts.headers) {
      Object.keys(opts.headers).forEach(key => {
        xhr.setRequestHeader(key, opts.headers[key]);
      });
    } else {
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    if (opts.hasOwnProperty('body')) {
      xhr.send(JSON.stringify(opts.body));
    } else {
      xhr.send(/*params*/);
    }
  });
}
/**@ignore */
function getXMLHttpRequest() {
  let xhr = null;

  if (window.XMLHttpRequest || window.ActiveXObject) {
    if (window.ActiveXObject) {
      try {
        xhr = new ActiveXObject('Msxml2.XMLHTTP');
      } catch(e) {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }
    } else {
      xhr = new XMLHttpRequest();
    }
  } else {
    alert('Votre navigateur ne supporte pas l\'objet XMLHTTPRequest...');
    return null;
  }

  return xhr;
}

/**@ignore */
function getHeaders(xhr) {
  const headersAsStr = xhr.getAllResponseHeaders();
  let parts = headersAsStr.split('\r\n');
  let headers = {};
  parts.forEach(function(header){
    let parts = header.split(': ');
    if(parts[0].length > 0) {
      headers[parts[0]] = parts[1];
    }
  });
  return headers;
}