
/**
 * Inject a JSON-ld object in the page. see https://schema.org/
 * @param {string} jsonld the JSON-ld object to inject in the page
 * @param {HTMLElement} el iin which HTML element the script tag will be added
 */
export function injectJSONLd(jsonld, el) {
  var script = document.createElement('script');
  script.type = "application/ld+json";
  script.text = jsonld;
  el.appendChild(script);
}