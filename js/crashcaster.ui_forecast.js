crashcaster.ui_forecast = (function (cc$, $, d3) {


    var plugin_name = "crashcaster.ui_forecast";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };

    var data = {};

    function init() {
        echo("initialize crashcaster.ui_forecast");
        updateHourlyChart();
        run();

    }

    function run() {
        echo("RUNNING crashcaster.ui_forecast");
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
                console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.auto();

                break;
            case "bike":
                console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.bike();

                break;
            case "cycle":
                console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.cycle();

                break;
            case "walk":
                console.log("Painting a " + travelType + " forecast");
                cc$.heatmap.walk();
                break;
            default:
                console.log("Painting a DEFAULT forecast");
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
                console.log("Painting a " + condition + " forecast");
                cc$.heatmap.clear();

                break;
            case "rain":
                console.log("Painting a " + condition + " forecast");
                cc$.heatmap.rain();


                break;
            case "fog":
                console.log("Painting a " + condition + " forecast");
                cc$.heatmap.fog();

                break;
            case "snow":
                console.log("Painting a " + condition + " forecast");
                cc$.heatmap.snow();

                break;
            default:
                console.log("Painting a DEFAULT forecast");
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


    function updateHourlyChart() {

        
        // Define the data
        var data = [
            {hour: 0, accidents: 190},
            {hour: 1, accidents: 41},
            {hour: 2, accidents: 61},
            {hour: 3, accidents: 23},
            {hour: 4, accidents: 4},
            {hour: 5, accidents: 17},
            {hour: 6, accidents: 73},
            {hour: 7, accidents: 101},
            {hour: 8, accidents: 258},
            {hour: 9, accidents: 249},
            {hour: 10, accidents: 149},
            {hour: 11, accidents: 213},
            {hour: 12, accidents: 265},
            {hour: 13, accidents: 190},
            {hour: 14, accidents: 227},
            {hour: 15, accidents: 258},
            {hour: 16, accidents: 161},
            {hour: 17, accidents: 209},
            {hour: 18, accidents: 229},
            {hour: 19, accidents: 107},
            {hour: 20, accidents: 116},
            {hour: 21, accidents: 118},
            {hour: 22, accidents: 80},
            {hour: 23, accidents: 70}
        ];


        var margin = {top: 5, right: 5, bottom: 5, left: 5},
            width = 960 - margin.left - margin.right,
            height = 70 - margin.top - margin.bottom;

        //var parse = d3.time.format("%b %Y").parse;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            //.tickValues(['1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'])
            .tickSize(-height);

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4)
            .orient("right");

        var area = d3.svg.area()
            .interpolate("monotone")
            .x(function(d) { return x(d.hour); })
            .y0(height)
            .y1(function(d) { return y(d.accidents); });

        var line = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) { return x(d.hour); })
            .y(function(d) { return y(d.accidents); });


        var svg = d3.select("#hourly_graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);


            // Compute the minimum and maximum hour
            x.domain([data[0].hour, data[data.length - 1].hour]);
            y.domain([0, d3.max(data, function(d) { return d.accidents; })]).nice();

            svg
                .datum(data)
                .on("click", click);

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
                .attr("x", width - 6)
                .attr("y", height - 6)
                .style("text-anchor", "end")
                .text("Hourly Accident Prediction");

            // On click, update the x-axis.
            function click() {
                var n = data.length - 1,
                    i = Math.floor(Math.random() * n / 2),
                    j = i + Math.floor(Math.random() * n / 2) + 1;
                x.domain([data[i].hour, data[j].hour]);
                var t = svg.transition().duration(750);
                t.select(".x.axis").call(xAxis);
                t.select(".area").attr("d", area);
                t.select(".line").attr("d", line);
            }

        READY_STATE._current = READY_STATE.LOADED;
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
        setTravelTypeTo: setTravelTypeTo
    };


    return my;


})(crashcaster, $, d3);



