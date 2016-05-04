crashcaster.linemap = (function (cc$, $, d3, LatLon) {


    var plugin_name = "crashcaster.linemap";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };


    // Add ANYTHING that needs happen when this plugin/module is initialized
    function init() {
        echo("initialize crashcaster.linemap");
        loadData();

    }

    // Once the module is ready via init(), add anything that needs to be run here
    function run() {
        echo("running crashcaster.linemap");
    }


    // Public method: A simple example function, exposed as a public method in the var my = {} object at the bottom
    function echo(v) {
        console.log(v);
    };


    /* LINEMAP CODE
     ******************************/






    var accidentData = [];
    var filteredAccidentData = [];
    var streetFilter = "Massachusetts Ave";
    var filteredObject = {};



    /* linemap definitions */

    // SVG drawing area - linemap
    var marginLinemap = {top: 50, right: 100, bottom: 30, left: 100};

    var widthLinemap = 900 - marginLinemap.left - marginLinemap.right,
        heightLinemap = 100 - marginLinemap.top - marginLinemap.bottom;


    var svgLinemap = d3.select("#linemap").append("svg")
        .attr("width", widthLinemap + marginLinemap.left + marginLinemap.right)
        .attr("height", heightLinemap + marginLinemap.top + marginLinemap.bottom)
        .append("g")
        .attr("transform", "translate(" + marginLinemap.left + "," + marginLinemap.top + ")");


    // street line where circles are placed for intersections
    var line = svgLinemap.append("line")
        .attr("class", "linemap-line");


    // add chart title
    var titleLinemap = svgLinemap.append("text")
        .attr("class", "linemap-title")
        .text(streetFilter.toUpperCase() + "'s most dangerous intersections")
        .attr("x", widthLinemap/2)
        .attr("y", -20)
        .style("text-anchor", "middle");


    // add directionals
    svgLinemap.append("text")
        .text("Westbound")
        .attr("class", "linemap-directional")
        .attr("x", 0 - marginLinemap.left/2)
        .attr("y", 4)
        .style("text-anchor", "middle")
        .style("vertical-align", "middle");

    // add directionals
    svgLinemap.append("text")
        .text("Eastbound")
        .attr("class", "linemap-directional")
        .attr("x", widthLinemap + marginLinemap.right/2)
        .attr("y", 4)
        .style("text-anchor", "middle")
        .style("vertical-align", "middle");


    /* Initialize tooltip */
    var linemapTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([+10, 0])
        .html(function(d) { return d.key + "<br>Accidents: " + d.values.length; });

    linemapTip.direction("s");


    var svgLinemapLegend = d3.select("#linemap-legend").append("svg")
        .attr("width", 220)
        .attr("height", 40);






    /* barchart definitions */

    // SVG drawing area - barchart
    var marginBarchart = {top: 20, right: 100, bottom: 150, left: 100};

    var widthBarChart = 900 - marginBarchart.left - marginBarchart.right,
        heightBarChart = 350 - marginBarchart.top - marginBarchart.bottom;

    var svgBarChart = d3.select("#barchart").append("svg")
        .attr("width", widthBarChart + marginBarchart.left + marginBarchart.right)
        .attr("height", heightBarChart + marginBarchart.top + marginBarchart.bottom)
        .append("g")
        .attr("transform", "translate(" + marginBarchart.left + "," + marginBarchart.top + ")");


    var xBar = d3.scale.ordinal()
        .rangeRoundBands([0, widthBarChart], .2);

    var xBarAxis = d3.svg.axis()
        .scale(xBar)
        .orient("bottom");

    var yBar = d3.scale.linear()
        .range([heightBarChart, 0]);

    var yBarAxis = d3.svg.axis()
        .scale(yBar)
        .orient("left")
        .ticks(5);

    svgBarChart.append("g")
        .attr("class", "barchart-xAxis")
        .attr("transform", "translate(0," + heightBarChart + ")");

    svgBarChart.append("g")
        .attr("class", "barchart-yAxis");


    // add chart title
    svgBarChart.append("text")
        .attr("class", "barchart-yAxis-title")
        .text("Total Accidents 2010-2014")
        .attr("transform", "rotate(-90)")
        //.attr("y", 10)
        .attr("y", -marginBarchart.left *.5)
        .attr("x", -heightBarChart *.05)
        .style("text-anchor", "end");

    /* Initialize tooltip */
    var barchartTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) { return d.key.toUpperCase() + "<br>" + d.totalAccidents + " Accidents"; });



    // define modal actions for storytelling buttons

    // STORY 1
    // when story buttons clicked, popup story modal box
    $("#linemap-btn_story1").leanModal({ top: 20, overlay: 0.4, closeButton: ".modal_close" });

    // STORY 2
    // when story buttons clicked, popup story modal box
    $("#linemap-btn_story2").leanModal({ top: 20, overlay: 0.4, closeButton: ".modal_close" });

    // STORY 3
    // when story buttons clicked, popup story modal box
    $("#linemap-btn_story3").leanModal({ top: 20, overlay: 0.4, closeButton: ".modal_close" });

    // STORY 3
    // when story buttons clicked, popup story modal box
    $("#linemap-btn_info").leanModal({ top: 100, overlay: 0.4, closeButton: ".modal_close" });




    /*	---
     Load Data
     ---
     */



    // Start application by loading the data


    function loadData() {
        d3.json("data/cambridge_accidents_2010-2014.json", function(error, jsonData){
            if(!error){
                accidentData = jsonData;

                //console.log("loadData() - accidentData");
                //console.log(accidentData);

                wrangleData();
            }
        });
    }




    /*	---
     Data prep functions
     --- */

    function wrangleData(){

        // create nested array with totals of accidents by streetName
        accidentDataNested = d3.nest()
            .key(function(d) { return d.streetName; })  // main key
            .key(function(d) { return d.crossStreet; }) // secondary key
            .entries(accidentData);


        // add summary data to each street entry
        accidentDataNested.forEach(function(d, i) {
            d.numIntersections = d.values.length;
            d.totalDistance = 0;
            d.totalAccidents = 0;

            // for each cross street, calculate intersection values
            d.values.forEach(function(v, i) {
                if ((d.key == "null") || (v.key == "null"))	 // if no cross street (accidents on single road)
                    v.distance = null;
                else {
                    v.coordinates = v.values[0].coordinates;
                    v.distanceFromReference = calculateDistance(v.coordinates);
                    d.totalAccidents += v.values.length;
                }
            });


            // sort by distance to reference to represent order of intersections along road
            d.values.sort(function(a, b) {
                return a.distanceFromReference - b.distanceFromReference;
            })
        });

        // sort array by streets with the most accidents
        accidentDataNested.sort(function(a, b) {
            return b.totalAccidents - a.totalAccidents;
        });



        // filter out accidents that did not occur at intersections
        filteredAccidentData = accidentDataNested.filter(function(d) {
            return (d.key != "null");
        });


        // keep only the top ## roads with the most accidents
        var sectionSize = 30;
        filteredAccidentData = filteredAccidentData.slice(0, sectionSize);

        filterLinemapData();

        updateBarChart();
        updateLineMap();
    }




    function filterLinemapData() {

        //console.log("filterData() - streetFilter");
        //console.log(streetFilter);

        var tempArray = [];	// placeholder for array returned by filter

        // filter out only the data for the selected street
        tempArray = filteredAccidentData.filter(function (d) {
            return d.key == streetFilter;
        });

        filteredObject = tempArray[0];  //  Array.filter returns an array.  Save it into an object

        // filter out accidents that did not occur at intersections
        filteredObject.values = filteredObject.values.filter(function (d) {
            return (d.key != "null");
        });


        // filter out intersections with low number of accidents on big roads
        if (filteredObject.numIntersections > 50)
            filteredObject.values = filteredObject.values.filter(function (d) {
                return (d.values.length >= 5);
            });

    }



    /*	---
     Vis functions
     --- */


    function updateLineMap() {

        var legendList = [];

        var max = d3.max(filteredObject.values, function(d) { return d.values.length; });

        for (var i=0; i<5; i++) {
            legendList[i] = max/(i+1);
        }


        // Data-join
        var linemap = svgLinemap.selectAll("circle")
            .data(filteredObject.values);

        // define scales

        // Scale - circle position along line
        var x = d3.scale.linear()
            .range([0, widthLinemap])
            .domain([0, filteredObject.values.length]);

        // Scale - circle color
        var c = d3.scale.linear()
            .range(["#ffffff", "#a50f15"])
            .domain([0, max]);


        // invoke tooltips
        svgLinemap.call(linemapTip);


        // draw street line
        line
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", widthLinemap)
            .attr("y2", 0)
            .style("stroke", "#333")
            .style("stroke-width", 1);


        // Enter - add circle elements
        linemap.enter()
            .append("circle")
            .attr("class", "linemap-circle")
            .on("mouseover", linemapTip.show)
            .on("mouseout", linemapTip.hide);

        // Update circle colors and defaults
        linemap
            .style("fill", function(d) { return c(d.values.length); })
            .attr("cy", 0)
            .attr("cx", 0)
            .attr("r", 7)
            .style("stroke", "black")
            .style("stroke-width", 2);

        // Position circles along ling
        linemap
            .transition().duration(300)
            .attr("cx", function(d, i) { return 15 + x(i); });

        // update chart title
        titleLinemap.text(streetFilter.toUpperCase() + "'s most dangerous intersections");

        // Exit
        linemap.exit().remove();




        //  add legend

        // round calculated legend values
        var legendFormat = d3.format(".0f");

        // add legend colored circles
        var legendItem = svgLinemapLegend.selectAll("circle").data(legendList);
        legendItem.exit().remove();

        var legendItemEnter = legendItem
            .enter().append("circle")
            .attr("cx", function(d, i) { return 70+ i*30; })
            .attr("cy", 27)
            .attr("r", 5)
            .style("stroke", "black")
            .style("stroke-width", 2);

        // update color of circle based on scale
        legendItem
            .style("fill", function(d) { return c(d); });


        // add legend text
        var legendText = svgLinemapLegend.selectAll("text").data(legendList);
        legendText.exit().remove();

        var legendTextEnter = legendText.enter().append("text")
            .attr("y", 16)
            .style("text-align", "right");

        // update legend label value
        legendText
            .attr("x", function(d, i) { if(d<10) { return  66 + i*30; } else { return 63 + i*30; }  })
            .text(function(d){ return legendFormat(d); });



        getUserInput();
    }





    function updateBarChart(){

        //console.log("initBarChart() - filteredAccidentData");
        //console.log(filteredAccidentData);

        // format all street names to be uppercase instead of mismatched cases
        filteredAccidentData.forEach(function(d) {d.key = d.key.toUpperCase(); });

        // define scale input domains
        xBar.domain(filteredAccidentData.map(function(d) { return d.key; }));
        yBar.domain([0, d3.max(filteredAccidentData, function(d) { return d.totalAccidents * 1.10; })]);

        // invoke tooltips
        svgBarChart.call(barchartTip);

        // draw bars
        bars = svgBarChart.selectAll(".barchart-bar")
            .data(filteredAccidentData)
            .enter()
            .append("rect")
            .attr("class", "barchart-bar");

        bars
            .attr("x", function(d) { return xBar(d.key); })
            .attr("y", function(d) { return yBar(d.totalAccidents); })
            .attr("width", xBar.rangeBand())
            .attr("height", function(d) { return heightBarChart - yBar(d.totalAccidents); })
            .classed("barchart-selectedBar", function(d) { return d.key.toUpperCase() == streetFilter.toUpperCase(); })
            .on("mouseover", barchartTip.show)
            .on("mouseout", barchartTip.hide);

        // call xAxis an define labels
        svgBarChart.select(".barchart-xAxis")
            .transition(300).duration(300)
            .call(xBarAxis)
            .selectAll("text")
            .attr("y", 5)
            .attr("x", -8)
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // call yAxis
        svgBarChart.select(".barchart-yAxis")
            .transition(300).duration(300)
            .call(yBarAxis);



    }








    /*	---
     support functions
     --- */



    function getUserInput(){

        // on barchart bar click, update linemap
        d3.select("#barchart").selectAll("rect")
            .on("click", function(d){
                d3.select("#barchart").selectAll("rect").classed("barchart-selectedBar", false);
                d3.select(this).classed("barchart-selectedBar", true);
                streetFilter = d.key;
                filterLinemapData();
                updateLineMap();
            });


    }


    // calculates distance of coordinates from a fixed reference point northwest of cambridge
    // this allows approximation of order of intersections along most roads
    // not quite accurate on non-straight roads
    function calculateDistance(point1, point2) {

        // some spot far away
        var referenceCoordinates = [0, 0];

        if (typeof point2 === 'undefined') { point2 = referenceCoordinates; }

        var p1 = new LatLon(point1[0], point1[1]);
        var p2 = new LatLon(point2[0], point2[1]);

        var d = p1.distanceTo(p2);

        return d;
    }





    /* END LINEMAP CODE
     ******************************/


    init();


    // Public variables and methods we want to expose.  Just add the var or function reference here.
    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;


})(crashcaster, $, d3, LatLon);


