crashcaster.module_template_copy_me = (function (cc$, $, d3) {
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

    var plugin_name = "crashcaster.module_template_copy_me";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };


    // Add ANYTHING that needs happen when this plugin/module is initialized
    function init() {
        echo("initialize crashcaster.module_template_copy_me");
        getWeather();
    }

    // Once the module is ready via init(), add anything that needs to be run here
    function run() {
        echo("running crashcaster.module_template_copy_me");
    }

    // COOL VARS & METHODS GO HERE

    var some_data = {}; // Some JSON data to expose publically by adding it to the var my = {} object at the bottom

    // Public method: A simple example function, exposed as a public method in the var my = {} object at the bottom
    function echo(v) {
        console.log(v);
    };


    // Private method: fetch the weather data
    function getWeather(f) {

        var url = "http://api.wunderground.com/api/053fc50550431c69/conditions/q/MA/Cambridge.json";

        d3.json(url, function (json) {

            // Add the weather underground data object under `crashcast.module_template_copy_me.some_data`
            my.some_data = json;

            // IMPORTANT: Be sure to set the ready state for this module to LOADED so that all `crashcast` modules
            // know it is done loading and ready to use
            READY_STATE._current = READY_STATE.LOADED;
        });

    }


    // Call the initialization function by default for this module or call it from elsewhere, e.g.
    //      crashcaster.module_template_copy_me.init();
    init();


    // Public variables and methods we want to expose.  Just add the var or function reference here.
    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo,
        some_data: some_data
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


