var crashcast = c$ = (function (crashcast, $, moment) {

    var crashcast = {
        version: "0.0.1",
        testCall: testCall,
        updateScreen: updateScreen,
        updateClock: updateClock,
        showLocation: showLocation
    };

    var now = moment();
    $('#current-datetime').text(now.format('llll'));


    function testCall(v) {
        console.log(v);
    };


    function updateScreen(screen) {

        console.log("screen=" + screen);

        switch (screen) {
            case "forecast":
                showLocation();
                updateClock();
                testCall('inner');
                timedUpdate();

                console.log("Forecast screen");
                break;
            default:
                console.log("Default screen");
        }

        showLocation();
        testCall('inner');
        //showTimeDate()

    }

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


    // Run the 
    function timedUpdate() {
        updateClock();
        setTimeout(timedUpdate, 1000);
    }

    timedUpdate();


    return crashcast;

})(typeof crashcast !== 'undefined' && crashcast || this, $, moment);










