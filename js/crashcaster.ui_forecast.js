crashcaster.ui_forecast = (function (cc$, $, d3) {


    var plugin_name = "crashcaster.ui_forecast";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };

    var data = {};

    function init() {
        echo("initialize crashcaster.ui_forecast");
        READY_STATE._current = READY_STATE.LOADED;
    }

    function run() {
        echo("running crashcaster.ui_forecast");
        console.log("Current weather condition is " + cc$.weather.current.current_observation.icon);
        showLocation();
        updateClock();
        timedUpdate();
        updateHourly()
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


    function updateHourly() {


        // Define the data
        var data = [
            {hour: 0, accidents: 2},
            {hour: 1, accidents: 0},
            {hour: 2, accidents: 0},
            {hour: 3, accidents: 1},
            {hour: 4, accidents: 0},
            {hour: 5, accidents: 1},
            {hour: 6, accidents: 3},
            {hour: 7, accidents: 4},
            {hour: 8, accidents: 3},
            {hour: 9, accidents: 3},
            {hour: 10, accidents: 1},
            {hour: 11, accidents: 2},
            {hour: 12, accidents: 5},
            {hour: 13, accidents: 2},
            {hour: 14, accidents: 1},
            {hour: 15, accidents: 1},
            {hour: 16, accidents: 3},
            {hour: 17, accidents: 1},
            {hour: 18, accidents: 4},
            {hour: 19, accidents: 3},
            {hour: 20, accidents: 4},
            {hour: 21, accidents: 2},
            {hour: 22, accidents: 0},
            {hour: 23, accidents: 0}
        ];


        var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 60 - margin.top - margin.bottom;

        //var parse = d3.time.format("%b %Y").parse;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
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



        // Parse numbers
        function type(d) {
            d.hour = +d.hour;
            d.accidents = +d.accidents;
            return d;
        }


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



