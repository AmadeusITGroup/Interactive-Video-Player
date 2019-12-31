/**
 * Convert a string represneting html to an HTML Element.
 * @param {string} html representing a single element
 * @return {HTMLElement}
 */
export function htmlToElement(html) {
  let template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

/**
 * Apply a list of styles to all element matching selector
 * @param {string, NodeList} selector One css selector or a list of DOM nodes
 * @param {any} style A JSON objext of key/value where key represent a css attribute
 */
export function style(selector, style) {
  selector = selector || [];
  let elements =  NodeList.prototype.isPrototypeOf(selector) ? selector : [selector];
  if(typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  }
  Array.prototype.forEach.call(elements, function(el, i){
    Object.keys(style).forEach(k => {
      el.style[k] = style[k];
    });
  });
}

/**
 * Remove all or a set of CSS classes from a dom node. 
 * @param {string, string[]} selector One or more CSS selectors
 * @param {string, string[]} classArray Optional a list of css classes to remove. If not specified the fiunction will remove all clases of the matching HTML element
 */
export function removeClass(selector, classArray) {
  selector = selector || [];
  let elements =  NodeList.prototype.isPrototypeOf(selector) ? selector : [selector];
  if(typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  }
  let removeAll = !classArray;
  classArray = Array.isArray(classArray) ? classArray : [classArray];
  for (const el of elements) {
    if(!removeAll) {
      el.classList.remove(...classArray);
    } else {
      el.classList.remove(...el.classList);
    }
  }
}

/**
 * Add CSS class(es) to a set of HTML elements. 
 * @param {string, string[]} selector One or more CSS selectors
 * @param {string | string[]} classArray The cCSS classes to add to the HTML elements
 */
export function addClass(selector, classArray) {
  selector = selector || [];
  let elements =  NodeList.prototype.isPrototypeOf(selector) ? selector : [selector];
  if(typeof selector === 'string') {
    elements = document.querySelectorAll(selector);
  }
  classArray = Array.isArray(classArray) ? classArray : [classArray];
  for (const el of elements) {
    el.classList.add(...classArray);
  }
}

/**
 * Returns the size of an element and its position
 * a default Object with 0 on each of its properties
 * its return in case there's an error
 * @param  {Element} element  el to get the size and position
 * @return {DOMRect}   size and position of an element
 */
export function getElementBounding(element) {
  let elementBounding;
  const defaultBoundingRect = new DOMRect(0,0,0,0);
  try {
    elementBounding = element.getBoundingClientRect();
  } catch (e) {
    elementBounding = defaultBoundingRect;
  }

  return elementBounding ;
}