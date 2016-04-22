var crashcaster = cc$ = (function (my, modules, $, d3, moment) {


    var plugin_name = "crashcaster";
    var plugin_version = "0.0.1";
    var READY_STATE = {_current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2};
    var moduleReadyStateTimeout = 10;
    var moduleReadyStateMaxWaitTime = 7000;
    var moduleReadyStateTimer = 0;


    /* Plug-in module loader functionality
     * --------------------------------------------------------------------- */

    var callbackFnName;
    var moduleInProgress;
    var next = -1;

    // Load the plug-in modules for `crashcaster`
    function loadModules() {
        if (++next < modules.length) {
            READY_STATE._current = READY_STATE.LOADING;
            moduleInProgress = modules[next];
            loadScript("js/" + modules[next] + ".js", checkModuleReadyState);
            console.log("loaded " + modules[next] + ".js");
        } else {
            READY_STATE._current = READY_STATE.LOADED;
            executeCallback();
        }
    };

    // Load each script of plug-in modules in `modules` array
    function loadScript(url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onreadystatechange = callback;
        script.onload = callback;
        head.appendChild(script);
    };

    // Check the READY_STATE of each module before we execute our `crashcast.run()`
    function checkModuleReadyState(newState) {

        var currentModule = moduleInProgress.replace(plugin_name + ".", "");

        // If the module does not have a READY_STATE we're done, load the next module
        if (!my[currentModule].READY_STATE) {
            loadModules();
        } else {
            //console.log("moduleInProgress=" + moduleInProgress);
            //console.log("enter=" + newState);

            setTimeout(function () {
                if (newState == READY_STATE.LOADED) {
                    moduleReadyStateTimer = 0;
                    loadModules();
                } else if(moduleReadyStateTimer >= moduleReadyStateMaxWaitTime) {

                    console.error("Timeout loading plug-in module '" + currentModule + "' after waiting " + moduleReadyStateTimer + "ms.");
                    console.error("Please be sure that '" + currentModule + "' sets its internal READY_STATE once fully loaded, e.g.");
                    console.error("    READY_STATE._current = READY_STATE.LOADED;");
                    console.error("Otherwise raise the `crashcast.moduleReadyStateMaxWaitTime` value higher than the current " + moduleReadyStateMaxWaitTime +"ms.");

                    moduleReadyStateTimer = 0;
                    loadModules();
                } else {
                    moduleReadyStateTimer += moduleReadyStateTimeout;
                    //console.log(my[currentModule]);
                    newState = my[currentModule].READY_STATE._current;
                    //console.log("update=" + newState);
                    checkModuleReadyState(newState);
                }
            }, moduleReadyStateTimeout);
        }
    }

    // Use a local callback executor
    function executeCallback() {
        executeFunctionByName(callbackFnName);
    };

    // Using only the stringified name of a given function, execute the function -- pretty slick right :)
    function executeFunctionByName(fnName, fnCtx /*, args... */) {
        var args = Array.prototype.slice.call(arguments).splice(2);
        var namespaces = fnName.split(".");
        var func = namespaces.pop();

        fnCtx = fnCtx || window;
        for (var i = 0; i < namespaces.length; i++) {
            fnCtx = fnCtx[namespaces[i]];
        }
        //console.log("executeFunctionByName=" + fnName + "(" + args + ")");
        return fnCtx[func].apply(this, args);
    }



    /* Crashcaster code
     * --------------------------------------------------------------------- */

    // Initialize the entire `crashcast` and plug-in submodules
    function init() {

        // Load all our plug-in modules and call the function `crashcaster.run`
        callbackFnName = "crashcaster.run"; // e.g. "crashcaster.run", "crashcaster.weather.run", etc.
        loadModules();
    }

    // Run the entirety of `crashcast` once the plug-in submodules are initialized and ready to run
    function run() {

        // Run UI modules from here, once everything is loaded and initialized
        my.ui_forecast.run();
        my.heatmap.run();

    }

    function echo(v) {
        console.log(v);
    };
    

    // Use the selective longhand to add properties to the existing `my` object.  Don't do this for plug-in modules use {} instead
    my.plugin_name = plugin_name;
    my.plugin_version = plugin_version;
    my.READY_STATE = READY_STATE;
    my.moduleReadyStateMaxWaitTime = moduleReadyStateMaxWaitTime;
    my.init = init;
    my.run = run;
    my.echo = echo;
    my.executeFunctionByName = executeFunctionByName;
    my.loadScript = loadScript;


    return my;

})(crashcaster || {}, ["crashcaster.weather", "crashcaster.model", "crashcaster.heatmap", "crashcaster.ui_forecast"], $, d3, moment);










