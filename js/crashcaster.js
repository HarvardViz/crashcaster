var crashcaster = c$ = (function (crashcaster, $, d3, moment) {


    var name = "crashcaster";
    var version = "0.0.1";
    var weather = {};


    crashcaster = {
        name: name,
        version: version,
        weather: weather,
        init: init,
        testCall: testCall,
        updateClock: updateClock,
        showLocation: showLocation,
        getWeather: getWeather
    };


    function testCall(v) {
        console.log(v);
    };


    function init(screen) {

        console.log("screen=" + screen);

        getWeather();

        switch (screen) {
            case "forecast":
                console.log("Forecast screen");
                showLocation();
                updateClock();
                timedUpdate();
                break;
            default:
                console.log("Home screen");
                showLocation();
                updateClock();
                timedUpdate();
        }

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


    // Run the update tick
    function timedUpdate() {
        updateClock();
        setTimeout(timedUpdate, 1000);
    }

    timedUpdate();


    function getWeather() {

        d3.json("http://api.wunderground.com/api/053fc50550431c69/conditions/q/MA/Cambridge.json", function(error, json) {
            if (error) return console.warn(error);

            weather = json;
            console.log(weather);
            console.log("Current condition is " + weather.current_observation.icon);

            /*
            Weather = json.forecast.txt_forecast.forecastday[2].fcttext;
            timenow = json.forecast.txt_forecast.date;
            console.log(timenow + " " + Weather);
            document.getElementById("source").innerHTML = "(Source: Weather Underground. Last updated " + timenow + ")";
            document.getElementById("weathertxt").innerHTML = "Tomorrow's weather forecast is " + Weather;
            document.getElementById("predict1").innerHTML = "Based on the weather, today there is a higher risk near the Mass Ave intersection";
            document.getElementById("predict2").innerHTML = "Historical data suggests, today there have been 50% higher accidents on a <day>/<month>";
            ;
            */
        });

        /*
        d3.json("https://api.forecast.io/forecast/319de9c9f9fab8949fcbf4bb086273b7/42.373611,%20-71.110556", function (error, json) {
            if (error) return console.warn(error);
            weather = json;
            console.log("Current condition is " + weather.currently.icon);

        });
        */
    }




    // Expose the public variables and methods for this module
    return crashcaster;

})(typeof crashcaster !== 'undefined' && crashcaster || this, $, d3, moment);










