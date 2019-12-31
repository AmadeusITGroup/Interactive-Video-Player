/**
 * Create a Custom dom event and dispatch it on the window object
 * @param {string} eventName The name of the vent to dispatch
 * @param {any} detail A key/value object to send along with the event
 */
export function dispatchEvent(eventName, detail) {
  const event = new CustomEvent(eventName, {detail: detail || null});
  window.dispatchEvent(event);
}

/**
 * An helper function that will allow to "group" multiple sequential calls in a single one.
 * see https://css-tricks.com/debouncing-throttling-explained-examples/
 * @param {Function} func A function to invoke at the end of the chain
 * @param {number} wait A wait time before triggering the function execution
 * @param {boolean} immediate Should the function be called immediately if there is no activity
 * @return A fucntion handling the beboucing
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return () => {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
