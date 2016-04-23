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
    var timenow = "not available";
    var today = new Date();
    var rad = 20;

    d3.json("http://api.wunderground.com/api/053fc50550431c69/forecast10day/q/MA/Cambridge.json", function(json) {
        Weather = json.forecast.txt_forecast.forecastday[2].fcttext;
        timenow = json.forecast.txt_forecast.date;
        console.log(timenow + " " + Weather);
        document.getElementById("source").innerHTML = "(Source: Weather Underground. Last updated " + timenow + ")";
        document.getElementById("weathertxt").innerHTML = "Today's weather forecast is " + Weather;
        document.getElementById("predict1").innerHTML = "Based on the weather, today there is a higher risk near the Mass Ave intersection";
        document.getElementById("predict2").innerHTML = "Historical data suggests, today there have been 50% higher accidents on a <day>/<month>";
        ;

        // Addded to use the module pattern
        READY_STATE._current = READY_STATE.LOADED;
    });


    function car() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Auto";
        initMap();
    }

    function bike() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Bike";
        initMap();
    }

    function bicycle() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Bicycle";
        initMap();
    }

    function walk() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectTravelType = "Pedestrian";
        initMap();
    }



    function rain() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Rain";
        initMap();
    }

    function snow() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Snow";
        initMap();
    }


    function fog() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Fog";
        initMap();
    }

    function sunny() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Good";
        initMap();
    }

    function overview() {
        Lat1 = 42.373616;
        Long1 = -71.109734;
        zoom1= 13;
        selectWeather = "Good";
        initMap();
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

    d3.csv("data/cambridge_accidents_weather_2010-2014.csv", function(error, csvData){
        if(!error){
            accidentData = csvData;
            accidentData.forEach(function(d) {
                d.Latitude = +d.Latitude;
                d.Longitude = +d.Longitude;
                    travelType.push(d.AccidentType);
                    weatherCat.push(d.Weather_Category);
                    Long01.push(d.Longitude);
                    Lat01.push(d.Latitude);
            });
        }
    });

    //Calculations Crashstistics
    var autoTotal=0;
    var bikeTotal;
    var cycleTotal;
    var walkTotal;
    selectTravelType = "Auto";
    selectWeather = "Good";

    for(var i=0;i<accidentData.length;i++) {
            if(travelType[i]=="Auto") {
                autoTotal=autoTotal+1;
            }
        }

    console.log(autoTotal);

    //Points for Heatmap
    function getPoints() {
        var array = [];
        for(var i=0;i<accidentData.length;i++) {
            if(Lat01[i]>0) {
                if(travelType[i]==selectTravelType) {
                    if(weatherCat[i]==selectWeather) {
                        array.push(new google.maps.LatLng(Lat01[i], Long01[i]));
                    }
                }
            }

        }
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
        sunny: sunny,
        car: car,
        bike: bike,
        bicycle: bicycle,
        walk: walk,
        overview: overview
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;


})(crashcaster, d3);


