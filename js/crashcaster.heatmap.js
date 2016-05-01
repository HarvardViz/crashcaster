crashcaster.heatmap = (function (cc$, d3) {

    //Reference[1]: https://developers.google.com/maps/documentation/javascript/examples/layer-heatmap
    //Reference[2]: W3 Schools

    var plugin_name = "crashcaster.heatmap";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };


    // Add ANYTHING that needs happen when this plugin/module is initialized
    function init(origin) {
        echo("initialize crashcaster.heatmap" + ((origin)? " FROM " + origin:""));


        //For Production comment while testing
        var url = "https://maps.googleapis.com/maps/api/js?key=AIzaSyByBr_9yXPbMOYg3HbL31yOVRAxEXvbtGM&libraries=visualization&callback=crashcaster.heatmap.initMap";
        //For Testing on local PC - comment for Production
        //var url = "https://maps.googleapis.com/maps/api/js?&libraries=visualization&callback=crashcaster.heatmap.initMap";
        var callback = runFromGoogleMaps;
        cc$.loadScript(url, callback);
    }

    // Just for tracking the call to run from Google Maps
    function runFromGoogleMaps() {
        run("googlemaps");
    }

    // Once the module is ready via init(), add anything that needs to be run here
    function run(origin) {
        echo("RUNNING crashcaster.heatmap" + ((origin)? " FROM " + origin:""));
        updatePrediction();

        cc$.ui_forecast.setTravelTypeTo("auto");
        cc$.ui_forecast.setWeatherConditionsTo(cc$.weather.current.current_observation.icon, true);
        cc$.ui_forecast.run("heatmap.run");

        READY_STATE._current = READY_STATE.LOADED;
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
    var rad = 0;
    var weekday = new Array(7);
    weekday[0]=  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var todaysDay = weekday[today.getDay()];
    //console.log(todaysDay);
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
    var factorWeather =  modelGood;
    var factorDay = modelSunday;
    var txtWeather = "lower";
    var txtDay;
    var forecastAccidents;
    //Calculations Crashstistics
    var selectTravelType = "Auto";
    var selectWeather = "Good";
    var crashtisticsText;
    var todaysWeather;
    var filterTotal;

    function updatePrediction() {

        d3.json("http://api.wunderground.com/api/053fc50550431c69/forecast10day/q/MA/Cambridge.json", function (json) {
            Weather = json.forecast.txt_forecast.forecastday[1].fcttext;


            //Generate Forecast text
            if (Weather.indexOf("rain") > -1) {
                WeatherCategory = "Rain";
                factorWeather = modelRain;
                txtWeather = "higher";
            }
            if (Weather.indexOf("Rain") > -1) {
                WeatherCategory = "Rain";
                factorWeather = modelRain;
                txtWeather = "higher";
            }
            if (Weather.indexOf("hail") > -1) {
                WeatherCategory = "Rain";
                factorWeather = modelRain;
                txtWeather = "higher";
            }
            if (Weather.indexOf("Hail") > -1) {
                WeatherCategory = "Rain";
                factorWeather = modelRain;
                txtWeather = "higher";
            }
            if (Weather.indexOf("thunderstorm") > -1) {
                WeatherCategory = "Rain";
                factorWeather = modelRain;
                txtWeather = "higher";
            }
            if (Weather.indexOf("Thunderstorm") > -1) {
                WeatherCategory = "Rain";
                factorWeather = modelRain;
                txtWeather = "higher";
            }
            if (Weather.indexOf("snow") > -1) {
                WeatherCategory = "Snow";
                factorWeather = modelSnow;
                txtWeather = "higher";
            }
            if (Weather.indexOf("Snow") > -1) {
                WeatherCategory = "Snow";
                factorWeather = modelSnow;
                txtWeather = "higher";
            }
            if (Weather.indexOf("fog") > -1) {
                WeatherCategory = "Fog";
                factorWeather = modelFog;
                txtWeather = "higher";
            }  //Assumed Fog is the worst as it imapcts visibility
            if (Weather.indexOf("Fog") > -1) {
                WeatherCategory = "Fog";
                factorWeather = modelFog;
                txtWeather = "higher";
            }
            if (todaysDay == "Sunday") {
                factorDay = modelSunday;
                txtDay = "fewer"
            }
            if (todaysDay == "Monday") {
                factorDay = modelMonday;
                txtDay = "fewer"
            }
            if (todaysDay == "Tuesday") {
                factorDay = modelTuesday;
                txtDay = "more"
            }
            if (todaysDay == "Wednesday") {
                factorDay = modelWednesday;
                txtDay = "more"
            }
            if (todaysDay == "Thursday") {
                factorDay = modelThursday;
                txtDay = "more"
            }
            if (todaysDay == "Friday") {
                factorDay = modelFriday;
                txtDay = "more"
            }
            if (todaysDay == "Saturday") {
                factorDay = modelSaturday;
                txtDay = "fewer"
            }
            timenow = json.forecast.txt_forecast.date;
            //console.log(WeatherCategory);
            document.getElementById("source").innerHTML = "<br><sup class='citation'>1</sup> (Source: Weather Underground. Last updated " + timenow + ")";
            document.getElementById("weathertxt").innerHTML = "";
            document.getElementById("predict1").innerHTML = "Based on today's weather <sup class='citation'>1</sup> alone, there is a " + Math.abs(factorWeather) * 100 + "% " + txtWeather + "  risk of accidents.  ";
            document.getElementById("predict2").innerHTML = "Historical data suggests, there have been " + Math.abs(factorDay) * 100 + "% " + txtDay + " accidents on a " + todaysDay + ".";

            updateAccidentData();


        });

    };


    function auto() {
        heatmap.setMap(null);
        selectTravelType = "Auto";
        heatmap = new google.maps.visualization.HeatmapLayer({
                data: getPoints(),
                map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function bike() {
        heatmap.setMap(null);
        selectTravelType = "Bike";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function cycle() {
        heatmap.setMap(null);
        selectTravelType = "Bicycle";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
       document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function walk() {
        heatmap.setMap(null);
        selectTravelType = "Pedestrian";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }



    function rain() {
        heatmap.setMap(null);
        selectWeather = "Rain";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function snow() {
        heatmap.setMap(null);
        selectWeather = "Snow";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }


    function fog() {
        heatmap.setMap(null);
        selectWeather = "Fog";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function clear() {
        heatmap.setMap(null);
        selectWeather = "Good";
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
        document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }

    function overview() {
        heatmap.setMap(null);
        selectTravelType = "Auto"; //Default is Auto accidents
        selectWeather = WeatherCategory; //Default is today's weather
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });
       document.getElementById("crashtxt").innerHTML = crashtisticsText;
    }





    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: zoom1,
            maxZoom: 20,
            minZoom: 13,
            center: {lat: Lat1, lng: Long1},
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true
        });

       story(42.360154,-71.094882,"Most dangerous intersection",
            '<div>'+
            '<h5>Most dangerous intersection</h5>'+
            '<div>This intersection can be one of the most dangerous for those ' +
            'unfamiliar with the area to do poor signal timing and a confusing configuration. ' +
            'Watch out for MBTA buses making a U-turn from Aberdeen Ave, as they will cross ' +
            'over other lanes in order to make the wide circle necessary to avoid power lines.  ' +
            'Driver frustration due to long wait times is known ' +
            'to be a factor in accidents here. </br> Read Next Story <i class="fa fa-arrow-circle-right" aria-hidden="true"></i></div>'+
            '</div>');


        story(42.375274,-71.14584,"High Traffic and poor visibility",
            '<div>'+
            '<h5>High Traffic and poor visibility</h5>'+
            '<div>High traffic volume and poor visibility contribute ' +
            'to this intersection being the most dangerous in Cambridge and ranked as one of ' +
            'the worst in Massachusetts. Use extra caution and follow ' +
            'traffic rules if you are travelling through this intersection by bike, as a high number of ' +
            'bicycle accidents tend to occur here due to poor visibility and cyclists ' +
            'ignoring traffic rules.</div>'+
            '</div>');

        function story(latStory, longStory, titleText, contentString)
        {
            var storyLoc = {lat: latStory, lng: longStory};

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            var marker = new google.maps.Marker({
                position: storyLoc,
                map: map,
                title: titleText
            });
            marker.addListener('click', function() {
                infowindow.open(map, marker);
                map.setZoom(15);
                map.setCenter(marker.getPosition());

            });

            infowindow.addListener('closeclick', function() {
                map.setZoom(zoom1);
                map.setCenter({lat: Lat1, lng: Long1});


            });

        }

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: getPoints(),
            map: map
        });

        heatmap.set('radius',rad);

        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        var styles = [ {
            "featureType": "road.local",
            "stylers":
                [ { "gamma": 2.29 },
                { "weight": 1 },
                { "saturation": -88 },
                { "lightness": -18 },
                { "visibility": "simplified" } ] }
        ];

        map.setOptions({styles: styles});



    }



        var accidentData = [];
        var Lat01 = [];
        var Long01 = [];
        var travelType = [];
        var weatherCat = [];
        var dayoftheWeek = [];
        var datesofAccident = [];
        var dataHours = [];

    function updateAccidentData() {

        d3.csv("data/cambridge_accidents_weather_2010-2014.csv", function (error, csvData) {
            if (!error) {
                accidentData = csvData;
                accidentData.forEach(function (d) {
                    d.Latitude = +d.Latitude;
                    d.Longitude = +d.Longitude;
                    d.accidentHour = parseInt(d.accidentHour);

                    dayoftheWeek.push(d['Day Of Week']);
                    datesofAccident.push(d.Dates);
                    travelType.push(d.AccidentType);
                    weatherCat.push(d.Weather_Category);
                    Long01.push(d.Longitude);
                    Lat01.push(d.Latitude);
                    dataHours.push(d.accidentHour);


                });

            }

        });

    }


    var accidentsHourly;
    var calcAuto=0;
    var calcWalk=0;
    var calcBike=0;
    var calcCycle=0;
    var filterTotal=0;
    var allAccidents=0;

    //Points for Heatmap
    function getPoints() {
        var array = [];
        filterTotal=0;
        allAccidents=0;
        calcAuto=0;
        calcWalk=0;
        calcBike=0;
        calcCycle=0;
        accidentsHourly =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for(var i=0;i<accidentData.length;i++) {
                if(weatherCat[i]==selectWeather) {
                    if(travelType[i]=="Auto") {calcAuto = calcAuto+1;};
                    if(travelType[i]=="Bike") {calcBike = calcBike+1;};
                    if(travelType[i]=="Bicycle") {calcCycle = calcCycle+1;};
                    if(travelType[i]=="Pedestrian") {calcWalk = calcWalk+1;};
                    allAccidents = allAccidents + 1;

                    if(travelType[i]==selectTravelType) {
                        filterTotal = filterTotal + 1;
                        accidentsHourly[dataHours[i]]++;
                        if(Lat01[i]>0) {
                        array.push(new google.maps.LatLng(Lat01[i], Long01[i]));
                        }

                    }
                }
        };


        crashtisticsText = "Historically, there have been " + Math.round(filterTotal/5) + " " + selectTravelType.toLowerCase() + " accidents in "+selectWeather.toLowerCase();
        console.log(selectTravelType);
        if (selectWeather=='Good') {crashtisticsText = crashtisticsText + " weather"};

        //drawdonut(calcAuto,  calcBike, calcCycle, calcWalk);
        render();
        //console.log("var accidentsHourly");
        //console.log(accidentsHourly);
        return array;
    }

    var accidentsDailyAvg=4.31; //based on calculations in data/cambridge_forecast_calculations_2010-2014.xlsx




    forecastAccidents = Math.ceil(accidentsDailyAvg*(1+factorWeather)*(1+factorDay));
    document.getElementById("forecast-count").innerHTML = forecastAccidents;
    console.log(forecastAccidents);

    /* END KARTIK'S HEATMAP CODE */

    /* START Donut chart Reference: Adaptive Pie Chart Scaling by Jon Sadka URL http://bl.ocks.org/jonsadka/fa05f8d53d4e8b5f262e */

     var width = 100,
         height = 100;

     var color = ["#d9534f","#fff"];//d3.scale.category20();

// draw and append the container
     var svg = d3.select("#crashgraph").append("svg")
         .attr("width", width).attr("height", height);

// set the thickness of the inner and outer radii
     var min = Math.min(width, height);
     var oRadius = min / 2 * 0.9;
     var iRadius = min / 2 * 0.6;

// construct default pie laoyut
     var pie = d3.layout.pie().value(function (d) {
         return d;
     }).sort(null);

// construct arc generator
     var arc = d3.svg.arc()
         .outerRadius(oRadius)
         .innerRadius(iRadius);

// creates the pie chart container
     var g = svg.append('g')
     var g = svg.append('g')
         .attr('transform', function () {
             if (window.innerWidth >= 960) var shiftWidth = width / 2;
             if (window.innerWidth < 960) var shiftWidth = width / 3;
             return 'translate(' + shiftWidth + ',' + height / 2 + ')';
         })

// generate random data
     var data = [filterTotal, calcAuto+calcBike+calcCycle+calcWalk-filterTotal];

// enter data and draw pie chart
     var path = g.datum(data).selectAll("path")
         .data(pie)
         .enter().append("path")
         .attr("class", "piechart")
         .attr("fill", function (d, i) {
             return color[i];
         })
         .attr("d", arc)
         .attr("opacity",0.9)
         .each(function (d) {
             this._current = d;
         });

     function render() {
         // generate new random data
         data = [filterTotal, calcAuto+calcBike+calcCycle+calcWalk-filterTotal];
         // add transition to new path
         g.datum(data).selectAll("path").data(pie).transition().duration(1000).attrTween("d", arcTween);

         // add any new paths
         g.datum(data).selectAll("path")
             .data(pie)
             .enter().append("path")
             .attr("class", "piechart")
             .attr("fill", function (d, i) {
                 return color[i];
             })
             .attr("opacity",0.9)
             .attr("d", arc)
             .each(function (d) {
                 this._current = d;
             });

         // remove data not being used
         g.datum(data).selectAll("path")
             .data(pie).exit().remove();
     }

     //render();
     setInterval(render, 2000);


// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
     function arcTween(a) {
         var i = d3.interpolate(this._current, a);
         this._current = i(0);
         return function (t) {
             return arc(i(t));
         };
     }


    /* END Donut chart Reference: Adaptive Pie Chart Scaling by Jon Sadka URL http://bl.ocks.org/jonsadka/fa05f8d53d4e8b5f262e */


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
        overview: overview,
        accidentsDailyAvg: accidentsDailyAvg,
        accidentsHourly: accidentsHourly
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;


})(crashcaster, d3);


