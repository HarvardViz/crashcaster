crashcaster.weather = (function (cc$, $, d3) {
    /* Above:
     * 1. Define the plug-in module name, e.g. `crashcaster.weather` (no `var` is needed since `crashcaster` already exists)
     * 2. The plug-in module name should be named to match, e.g. `crashcaster.weather.js`
     * 3. The function arguments are libraries we want to import for use within the closure (this plug-in module), e.g. $, d3
     *    Note `cc$` is a shortcut to the main `crashcaster` object, you could just as easily use `crashcaster` instead
     *    
     *    IMPORTANT:  For async calls like d3.json be sure to set the current READY_STATE in the callback to LOADED or in the
     *    init(), e.g.
     *      
     *      READY_STATE._current = READY_STATE.LOADED;
     *
     *  4. Update the last line of the `crashcaster.js` by adding the module name to the module array, e.g.
     *
     *      })(crashcaster || {}, ["crashcaster.weather", "crashcaster.model"], $, d3, moment);
     */


    /* Your plug-in module code here - write simple functions
     * --------------------------------------------------------------------- */

    var plugin_name = "crashcaster.weather";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };

    var current = {}; // A global variable to put the current weather in when fetched

    // Add anything that needs happen when this plugin/module is initialized
    function init() {
        echo("initialize crashcaster.weather");
        getWeather("conditions", "MA", "Cambridge");
    }

    // Public method: A simple example function, exposed as a public method
    function echo(v) {
        console.log(v);
    };

    // Private method: fetch the weather data
    function getWeather(forecastType, state, city) {

        forecastType = forecastType ? forecastType : "conditions";
        state = state ? state : "MA";
        city = city ? city : "Cambridge";

        var url = "http://api.wunderground.com/api/053fc50550431c69/" + forecastType + "/q/" + state + "/" + city + ".json";
        // console.log("url=" + url);

        d3.json(url, function (json) {

            // Add the weather underground data object under `crashcast.weather.current`
            my.current = json;

            // Be sure to set the ready state for this module to LOADED so that all `crashcast` modules are run
            READY_STATE._current = READY_STATE.LOADED;
        });

    }


    // Call the initialization function by default for this module
    init();


    // Public variables and methods we want to expose.  Just add the var or function reference here.
    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        current: current,
        init: init,
        echo: echo
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;


    /* Below:  import the libraries, plug-ins and modules that you want to use within this plug-in module.
     * This will be the inputs to the variables at the very top of the module, e.g.
     *
     *      crashcaster.weather = (function (cc$, $, d3) {
     *
     *  In this example the external `crashcaster` is mapped to internal `cc$` for use within this module code
     */
})(crashcaster, $, d3);


