declare module "universal-ga" {
  export class UniversalGA {
    /**
     * Before anything else will work, you must first initialize analytics by passing an initial tracking id.
     * Additional options can also be sent to analytics.create by including them as additional properties on the options object.
     * 
     * @param trackingID Your analytics tracking id, i.e. UA-XXXXX-YY.
     * @param options Additional options
     */
    initialize(trackingID:string, options?:any):UniversalGA;

    /**
     * Allows you to create multiple tracking ids. If you just need to add an additional tracking id, options can just be the name of your additional tracker. 
     * This can be used in combination with the .name() method.
     * However, if you need to combine additional options with a name, you will need to name your tracker as part of the options object.
     * @param trackingID  Another analytics tracking id, i.e. UA-XXXXX-YY.
     * @param options object or string (optional) additional options to pass to the tracker.
     */
    create(trackingID:string, options?:any):UniversalGA;

    /**
     * Namespaces the next set of values sent to analytics.
     * @param name Send next value for the namespaced tracking id.
     */
    name(name:string):UniversalGA;

    /**
     * Set key/value pairs for analytics.
     * @param key  Key to send to analytics.
     * @param value Value for the key.
     */
    set(key:string, value:string):UniversalGA;


    /**
     * Allows you to add plugins to analytics. Additional options for plugins can be seen in the plugins documentation.
     * https://developers.google.com/analytics/devguides/collection/analyticsjs/using-plugins
     * @param name Plugin to require.
     * @param options (optional) Additional options.
     */
    plugin(name:string, options?:any):UniversalGA;

    /**
     * Allows you to send a pageview to analytics. Additional options for the pageview can be seen in the pages documentation.
     * https://developers.google.com/analytics/devguides/collection/analyticsjs/using-plugins
     * @param pagename Pagename to send to analytics.
     * @param options (optional) Additional options.
     */
    pageview(pagename:string, options?:any):UniversalGA;

    /**
     * Send a screenview to analytics. Additional options for the screenview can be seen in the app screens documentation.
     * @param screenname Screenname to send to analytics.
     * @param options (optional) Additional options.
     */
    screenview(screenname:string, options?:any):UniversalGA;

    /**
     * Send event data and event metrics to analytics. Additional options for events can be seen in the event tracking documentation.
     * @param category Event category.
     * @param action Event action.
     * @param options (optional) Additional options.
     */
    event(category:string, action:string, options?:any):UniversalGA;

    /**
     * Send timing data to analytics. Additional options for timing can be seen in the user timing documentation.
     * 
     * @param category Timing category.
     * @param key Timing variable.
     * @param value Timing value (in milliseconds).
     * @param options Additional options.
     */
    timing(category:string, key:string, value:number, options?:any):UniversalGA;

    /**
     * Send exception data to analytics. You can specify whether or not the event was fatal with the optional boolean flag.
     * @param message Exception message.
     * @param isFatal Is fatal event.
     */
    exception(message:string, isFatal?:boolean):UniversalGA;

    /**
     * Send custom dimension/metrics to analytics. You need to first configure caustom dimensions/metrics through the analytics management interface. 
     * This allows you to specify a metric/dimension index to track custom values. See custom dimensions/metrics documentation for more details.
     * 
     * Dimensions and metrics keys will be a key of dimension[0-9] or metric[0-9].
     * @param key Custom dimension/metric key.
     * @param value Custom dimension/metric value.
     */
    custom(key:string, value:String):UniversalGA;
  }

  const value: UniversalGA;
  export default value;
}