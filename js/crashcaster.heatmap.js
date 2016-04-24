crashcaster.heatmap = (function (cc$, d3) {


    var plugin_name = "crashcaster.heatmap";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };


    // Add ANYTHING that needs happen when this plugin/module is initialized
    function init() {
        echo("initialize crashcaster.heatmap");

        //For Production comment while testing
        var url = "https://maps.googleapis.com/maps/api/js?key=AIzaSyByBr_9yXPbMOYg3HbL31yOVRAxEXvbtGM&libraries=visualization&callback=crashcaster.heatmap.initMap";
        //For Testing on local PC - comment for Production
        //var url = "https://maps.googleapis.com/maps/api/js?&libraries=visualization&callback=crashcaster.heatmap.initMap";
        var callback = run;
        cc$.loadScript(url, callback);
    }

    // Once the module is ready via init(), add anything that needs to be run here
    function run() {
        echo("running crashcaster.heatmap");

    }

    function echo(s) {
        console.log(s);
    }


    /* KARTIK'S HEATMAP CODE */


    /**
     * Created by ktrasi on 4/17/2016.
     */


// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">
    var map, heatmap;
    var Lat1 = 42.373616;
    var Long1 = -71.109734;
    var zoom1 = 13;
    var Weather = "not available";
    var WeatherCategory = "Good";  // Rain/Snow/Fog/Good - By default is is good weather unless bad weather is detected
    var timenow = "not available";
    var today = new Date();
    var rad = 20;
    var weekday = new Array(7);
    weekday[0]=  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var todaysDay = weekday[today.getDay()];
    console.log(todaysDay);
    //Forecasting model (based on calculations in data/cambridge_forecast_calculations_2010-2014.xlsx)
    var modelSunday = -0.31;
    var modelMonday = -0.01;
    var modelTuesday = 0.06;
    var modelWednesday = 0.09;
    var modelThursday = 0.14;
    var modelFriday = 0.16;
    var modelSaturday = -0.13;
    var modelFog = 0.11;
    var modelGood  = -0.05;
    var modelRain = 0.06;
    var modelSnow = 0.05;
    var factorWeather =  -0.05;
    var factorDay = 0;
    var txtWeather = "lower";
    var txtDay;
    var forecastAccidents;


    d3.json("http://api.wunderground.com/api/053fc50550431c69/forecast10day/q/MA/Cambridge.json", function(json) {
        Weather = json.forecast.txt_forecast.forecastday[1].fcttext;


        //Generate Forecast text
        if(Weather.indexOf("rain") > -1) {WeatherCategory = "Rain"; factorWeather = modelRain; txtWeather = "higher";}
        if(Weather.indexOf("Rain") > -1) {WeatherCategory = "Rain"; factorWeather = modelRain; txtWeather = "higher";}
        if(Weather.indexOf("hail") > -1) {WeatherCategory = "Rain"; factorWeather = modelRain; txtWeather = "higher";}
        if(Weather.indexOf("Hail") > -1) {WeatherCategory = "Rain"; factorWeather = modelRain; txtWeather = "higher";}
        if(Weather.indexOf("thunderstorm") > -1) {WeatherCategory = "Rain"; factorWeather = modelRain; txtWeather = "higher";}
        if(Weather.indexOf("Thunderstorm") > -1) {WeatherCategory = "Rain"; factorWeather = modelRain; txtWeather = "higher";}
        if(Weather.indexOf("snow") > -1) {WeatherCategory = "Snow"; factorWeather = modelSnow; txtWeather = "higher";}
        if(Weather.indexOf("Snow") > -1) {WeatherCategory = "Snow"; factorWeather = modelSnow; txtWeather = "higher";}
        if(Weather.indexOf("fog") > -1) {WeatherCategory = "Fog";factorWeather = modelFog; txtWeather = "higher";}  //Assumed Fog is the worst as it imapcts visibility
        if(Weather.indexOf("Fog") > -1) {WeatherCategory = "Fog";factorWeather = modelFog; txtWeather = "higher";}
        if(todaysDay=="Sunday") {factorDay = modelSunday; txtDay = "fewer"}
        if(todaysDay=="Monday") {factorDay = modelMonday; txtDay = "fewer"}
        if(todaysDay=="Tuesday") {factorDay = modelTuesday; txtDay = "more"}
        if(todaysDay=="Wednesday") {factorDay = modelWednesday; txtDay = "more"}
        if(todaysDay=="Thursday") {factorDay = modelThursday; txtDay = "more"}
        if(todaysDay=="Friday") {factorDay = modelFriday; txtDay = "more"}
        if(todaysDay=="Saturday") {factorDay = modelSaturday; txtDay = "fewer"}
        timenow = json.forecast.txt_forecast.date;
        console.log(WeatherCategory);
        document.getElementById("source").innerHTML = "<br><sup class='citation'>1</sup> (Source: Weather Underground. Last updated " + timenow + ")";
        document.getElementById("weathertxt").innerHTML = "Today's weather forecast is " + WeatherCategory + "<sup class='citation'>1</sup>.  ";
        document.getElementById("predict1").innerHTML = "Based on today's weather alone, there is a " + Math.abs(factorWeather)*100 + "% "+ txtWeather + "  risk of accidents.  ";
        document.getElementById("predict2").innerHTML = "Historical data suggests, there have been " + Math.abs(factorDay)*100 + "% "+ txtDay +" accidents on a "+todaysDay+".";
        forecastAccidents = Math.round(accidentsDailyAvg*(1+factorWeather)*(1+factorDay));
        document.getElementById("forecast-count").innerHTML = forecastAccidents;
        console.log(forecastAccidents);

        // Addded to use the module pattern
        READY_STATE._current = READY_STATE.LOADED;
    });


    function auto() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Auto";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;

    }

    function bike() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Bike";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
        //console.log(accidentsDailyAvg);
    }

    function cycle() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Bicycle";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function walk() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Pedestrian";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }



    function rain() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Rain";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function snow() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Snow";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }


    function fog() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Fog";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function clear() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Good";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function overview() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Good";
        initMap();
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }


    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: zoom1,
            maxZoom: 20,
            minZoom: 0,
            center: {lat: Lat1, lng: Long1},
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true

        });

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });

        heatmap.set('radius',rad);

        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        var styles = [
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [
                    { lightness: 100 },
                    { visibility: "off" }
                ]
            },{
                featureType: "road",
                elementType: "labels",
                stylers: [
                    { visibility: "on" }
                ]
            }
        ];

        map.setOptions({styles: styles});
    }


    function loadData() {

    }


    var accidentData=[];
    var Lat01 = [];
    var Long01 =[];
    var travelType = [];
    var weatherCat = [];
    var dayoftheWeek = [];
    var datesofAccident = [];

    d3.csv("data/cambridge_accidents_weather_2010-2014.csv", function(error, csvData){
        if(!error){
            accidentData = csvData;
            accidentData.forEach(function(d) {
                d.Latitude = +d.Latitude;
                d.Longitude = +d.Longitude;
                    dayoftheWeek.push(d['Day Of Week']);
                    datesofAccident.push(d.Dates);
                    travelType.push(d.AccidentType);
                    weatherCat.push(d.Weather_Category);
                    Long01.push(d.Longitude);
                    Lat01.push(d.Latitude);
            });
        }
    });

    //Calculations Crashstistics
    var selectTravelType = "Auto";
    var selectWeather = "Good";
    var crashtisticsText = "...";
    var todaysWeather = "Good";
    var filterTotal;
    var accidentsDailyAvg;




    for(var i=0;i<accidentData.length;i++) {

    };

    //Number of accidents in Today's Weather
    for(var i=0;i<accidentData.length;i++) {
                if(weatherCat[i]==todaysWeather) {
                    if(travelType[i]==selectTravelType) {
                    }
                }
    };


    //Points for Heatmap
    function getPoints() {
        var array = [];
        filterTotal=0;
        //Average accidents
        accidentsDailyAvg = accidentData.length/(4*365); //since we have data for 2010-2014
        for(var i=0;i<accidentData.length;i++) {
                if(travelType[i]==selectTravelType) {
                    if(weatherCat[i]==selectWeather) {
                        filterTotal = filterTotal + 1;
                        if(Lat01[i]>0) {
                        array.push(new google.maps.LatLng(Lat01[i], Long01[i]));
                        }

                    }
                }
        };
        crashtisticsText = "Accident Type: " + selectTravelType + ", Weather: " + selectWeather + ", Accidents/year: "+filterTotal/5;

        return array;
    }

    /* END KARTIK'S HEATMAP CODE */




    // Call the initialization function by default for this module or call it from elsewhere, e.g.
    //      crashcaster.heatmap.init();
    init();


    // Public variables and methods we want to expose.  Just add the var or function reference here.
    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo,
        initMap: initMap,
        rain: rain,
        snow: snow,
        fog: fog,
        clear: clear,
        auto: auto,
        bike: bike,
        cycle: cycle,
        walk: walk,
        overview: overview
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;


})(crashcaster, d3);


