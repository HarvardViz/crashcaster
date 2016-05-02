crashcaster.ui_forecast = (function (cc$, $, d3) {


    var plugin_name = "crashcaster.ui_forecast";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };

    var data = {};

    function init(origin) {
        echo("initialize crashcaster.ui_forecast" + ((origin)? " FROM " + origin:""));
        updateHourlyChart();
        //run();

        READY_STATE._current = READY_STATE.LOADED;
    }

    function run(origin) {
        echo("RUNNING crashcaster.ui_forecast" + ((origin)? " FROM " + origin:""));
        console.log("Current weather condition is " + cc$.weather.current.current_observation.icon);

        showLocation();
        updateClock();
        setTravelTypeTo("auto");
        setWeatherConditionsTo(cc$.weather.current.current_observation.icon, true);

        timedUpdate();

    }

    function echo(v) {
        console.log(v);
    };

    function setTravelTypeTo(travelType) {

        var travelTypes = ["auto", "bike", "cycle", "walk"];

        // Reset the button states
        travelTypes.forEach(resetButtonState);
        var btn_id = '#btn_' + travelType;
        $(btn_id).addClass('btn-danger');

        switch(travelType) {
            case "auto":
                //console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.auto();

                break;
            case "bike":
                //console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.bike();

                break;
            case "cycle":
                //console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.cycle();

                break;
            case "walk":
                //console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.walk();
                break;
            default:
                //console.log("Painting a DEFAULT forecast");
                cc$.heatmap.auto();
        }

    }

    function setWeatherConditionsTo(condition, useActualCondition) {

        //console.log("WU_CONDITION=" + condition);
        var condition = getWuMappedCondition(condition);
        //console.log("MAPPED CONDITION=" + condition);

        var conditions = ["clear", "rain", "fog", "snow"];

        // Setup the current conditions
        var actualCondition = icon = heatmap = cc$.weather.current.current_observation.icon;
        var label = cc$.weather.current.current_observation.weather;
        var buttonHtml = '<button onclick="cc$.ui_forecast.setWeatherConditionsTo(\''+ heatmap + '\', true)" id="btn_current_weather" type="button" class="btn btn-lg btn-info"><p class="wi wi-wu-' + icon + ' btn-type-weather-current"></p><p class="weather-current">' + label + '</p></button>'

        // Set the current conditions big button to use for resetting the crashcast
        d3.select("#current-weather").html(buttonHtml);

        // Reset the button states
        conditions.forEach(resetButtonState);
        var btn_id = '#btn_' + condition;
        $(btn_id).addClass('btn-danger');

        if(useActualCondition){
            setBackgroundImage(actualCondition);
        } else {
            setBackgroundImage(condition);
        }


        switch(condition) {
            case "clear":
                //console.log("Painting a " + condition + " forecast");
                cc$.heatmap.clear();

                break;
            case "rain":
                //console.log("Painting a " + condition + " forecast");
                cc$.heatmap.rain();


                break;
            case "fog":
                //console.log("Painting a " + condition + " forecast");
                cc$.heatmap.fog();

                break;
            case "snow":
                //console.log("Painting a " + condition + " forecast");
                cc$.heatmap.snow();

                break;
            default:
                //console.log("Painting a DEFAULT forecast");
                cc$.heatmap.clear();
        }

    }

    function setBackgroundImage(condition) {

        var daytime = true;
        var now = moment();
        var hour = now.format('HH');
        if(hour < 6 && hour > 18){
            daytime = false;
        }

        //console.log(condition);
        var imageList = getImageList(cc$.model.weatherImages[condition], daytime);
        var image = getRandomImage(imageList);
        
        //console.log("image.url=" + image.url);
        //console.log("image.cite=" + image.cite);

        var imageUrl = image.url;  // "img/weather-rain-day-0.jpg";
        var imageCite = image.cite;

        $('#section0').css('background-image', 'url(' + imageUrl + ')');
        $('#section0').css('background-size', 'cover');

        // TODO: Must add citation for each image to model `image.cite`
        $('#citation').text("Image source: " + imageCite);

    }

    function getImageList(images, daytime) {

        var imageList = [];

        for(var image in images) {

            // console.log("images." + image + " = " + images[image]);
            if(images[image].daytime == daytime) {
                //console.log("Image add " + images[image]);
                imageList.push(images[image]);
            }
        }

        //console.log("imageList");
        //console.log(imageList);

        return imageList;
    }

    function getRandomImage(imageList) {
        var num = Math.floor(Math.random() * imageList.length);
        var image = imageList[num];

        //console.log("IMAGE=");
        //console.log(image);

        return image;
    }

    // Map the Weather Underground Conditions to our basic types
    function getWuMappedCondition(c) {

        var condition = "";

        if (c=="clear" || c=="sunny" || c=="unknown" || c=="partlysunny" || c=="partlycloudy" || c=="mostlysunny" || c=="mostlycloudy" || c=="cloudy") {
            condition = "clear";
        }else if(c=="tstorms" || c=="rain" || c=="chancetstorms" || c=="chancerain"){
            condition = "rain";
        } else if(c=="fog" || c=="hazy") {
            condition = "fog";
        } else if(c=="snow" || c=="sleat" || c=="flurries" || c=="chancesnow" || c=="chancesleat" || c=="chanceflurries") {
            condition = "snow";
        } else {
            condition = "sunny";
        }

        return condition;

    }

    function resetButtonState(element, index, array) {

        //console.log('e[' + index + '] = ' + element);

        var btn_id = '#btn_' + element;

        if( $(btn_id).hasClass('btn-danger') ) {
            $(btn_id).removeClass('btn-danger');
            $(btn_id).addClass('btn_secondary');
        }
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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



    // Build the basic graph

    var margin = {top: 5, right: 50, bottom: 25, left: 20},
        width = 1090 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    var hours = ['12PM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];

    //var x = d3.scale.linear()
    //    .range([0, width]);

    var x = d3.scale.ordinal()
        .domain(hours)
        .rangePoints([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(-height)
        .orient("bottom")
        .ticks(24);

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(4)
        .orient("right");

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d,i) { return x(i); })
        .y0(height)
        .y1(function(d) { return y(d); });

    var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d,i) { return x(i); })
        .y(function(d) { return y(d); });


    var svg = d3.select("#hourly_graph").append("svg")
        .attr("class", "hourly_graph_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);



    function updateHourlyChart(accidentsHourly) {

        // console.log("ACCIDENTS HOURLY");
        // console.log(accidentsHourly);

        if(!accidentsHourly) {
            return;
        }

        var data = accidentsHourly; //[190, 41, 61, 23, 4, 17, 73, 101, 258, 249, 149, 213, 265, 190, 227, 258, 161, 209, 229, 107, 116, 118, 80, 70];

        $(".hourly_graph_svg").remove();

        svg = d3.select("#hourly_graph").append("svg")
            .attr("class", "hourly_graph_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        var areaGraph = svg.selectAll(".area").attr("d", area);
        var lineGraph = svg.selectAll(".line").attr("d", line);

            // Compute the minimum and maximum hour
            x.domain(d3.range(0, 24));
            y.domain([0, d3.max(data, function(d) { return d; })]).nice();


            svg.datum(data);


            svg.append("path")
                .attr("class", "area")
                .attr("clip-path", "url(#clip)")
                .attr("d", area);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis);

            svg.append("path")
                .attr("class", "line")
                .attr("clip-path", "url(#clip)")
                .attr("d", line);

            svg.append("text")
                .attr("x", 155)
                .attr("y", 10)
                .attr("class", "textbox-heading")
                .style("text-anchor", "end")
                .style("stroke", "#fff")
                //.style("font-size", "13px")
                //.style("font-weight", "100")
                .text("Hourly Probability forecast);




        svg.selectAll(".x.axis text")
                .text(function(d,i) { return hours[i]; });



    }


    init();


    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo,
        data: data,
        setWeatherConditionsTo: setWeatherConditionsTo,
        setTravelTypeTo: setTravelTypeTo,
        updateHourlyChart: updateHourlyChart
    };


    return my;


})(crashcaster, $, d3);



