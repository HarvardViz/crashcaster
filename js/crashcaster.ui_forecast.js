crashcaster.ui_forecast = (function (cc$, $, d3) {


    var plugin_name = "crashcaster.ui_forecast";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };

    var data = {};

    function init() {
        echo("initialize crashcaster.ui_forecast");

        // Nothing fancy to do here that makes us wait, just set the READY_STATE
        READY_STATE._current = READY_STATE.LOADED;
    }

    function run() {
        echo("running crashcaster.ui_forecast");
        console.log("Current weather condition is " + cc$.weather.current.current_observation.icon);
        showLocation();
        updateClock();
        timedUpdate();
    }

    function echo(v) {
        console.log(v);
    };


    // For future use to set various locations
    function showLocation() {

        var city = "Cambridge";
        var state = "MA";

        $('#current-location').text(city + ", " + state);

    }

    // Show the current date and time
    function updateClock() {
        var now = moment();
        $('#current-datetime').text(now.format('llll'));
    }


    // Run the update tick
    function timedUpdate() {
        updateClock();
        setTimeout(timedUpdate, 1000);
    }


    init();


    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo,
        data: data
    };


    return my;


})(crashcaster, $, d3);



