crashcaster.crashcalendar = (function (cc$, $, d3) {


    var plugin_name = "crashcaster.crashcalendar";
    var plugin_version = "0.0.1";
    var READY_STATE = {_current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2};


    function init() {
        echo("initialize crashcaster.crashcalendar");
        loadData();
    }


    function run() {
        echo("running crashcaster.crashcalendar");
    }


    function echo(v) {
        console.log(v);
    };


    /* CRASHCALENDAR
     *************************/


    var accidentData = [];
    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

    // svg areas
    var cal2010 = new CalHeatMap();
    var cal2011 = new CalHeatMap();
    var cal2012 = new CalHeatMap();
    var cal2013 = new CalHeatMap();
    var cal2014 = new CalHeatMap();

    // data for cal-heatmap
    var calData = {};
    var calDataAuto = {};
    var calDataBike = {};
    var calDataPedestrian = {};
    var calDataParked = {};


    // arrays to hold dates on which various accident types occurred - for button clicks
    var highlightNone = [new Date(2000, 1, 1)];  // highlight requires some input.  giving it a date out of display range.
    var highlightAuto = [];
    var highlightBicycle = [];
    var highlightPedestrian = [];
    var highlightParked = [];

    // define modal actions for storytelling buttons

    // STORY 1
    // when story buttons clicked, popup story modal box
    $("#cal-btn_story1").leanModal({ top: 100, overlay: 0.4, closeButton: ".modal_close" })
        .click(function (e) {
            // highlight featured month
            $(".y_2011.m_1 .domain-background").css("fill-opacity", .2);
    });
    $('.modal_close').click(function() {
        // remove featured month highlighting
        $(".y_2011.m_1 .domain-background").css("fill-opacity", 0.0); });


    // STORY 2
    // when story buttons clicked, popup story modal box
    $("#cal-btn_story2").leanModal({ top: 100, overlay: 0.4, closeButton: ".modal_close" })
        .click(function (e) {
            // highlight featured month
            $(".y_2012.m_11 .domain-background").css("fill-opacity", .2);
        });
    $('.modal_close').click(function() {
        // remove featured month highlighting
        $(".y_2012.m_11 .domain-background").css("fill-opacity", 0.0); });

    // STORY 3
    // when story buttons clicked, popup story modal box
    $("#cal-btn_story3").leanModal({ top: 100, overlay: 0.4, closeButton: ".modal_close" })
        .click(function (e) {
            // highlight featured month
            $(".y_2010.m_10 .domain-background").css("fill-opacity", .2);
            $(".y_2011.m_10 .domain-background").css("fill-opacity", .2);
            $(".y_2012.m_10 .domain-background").css("fill-opacity", .2);
            $(".y_2013.m_10 .domain-background").css("fill-opacity", .2);
            $(".y_2014.m_10 .domain-background").css("fill-opacity", .2);
        });
    $('.modal_close').click(function() {
        // remove featured month highlighting
        $(".y_2010.m_10 .domain-background").css("fill-opacity", 0);
        $(".y_2011.m_10 .domain-background").css("fill-opacity", 0);
        $(".y_2012.m_10 .domain-background").css("fill-opacity", 0);
        $(".y_2013.m_10 .domain-background").css("fill-opacity", 0);
        $(".y_2014.m_10 .domain-background").css("fill-opacity", 0);
    });

    /*
    // STORY 4
    // when story buttons clicked, popup story modal box
    $("#cal-btn_story4").leanModal({ top: 100, overlay: 0.4, closeButton: ".modal_close" })
        .click(function (e) {
            // highlight featured month
            $(".y_2011.m_2 .domain-background").css("fill-opacity", .2);
        });
    $('.modal_close').click(function() {
        // remove featured month highlighting
        $(".y_2011.m_2 .domain-background").css("fill-opacity", 0.0); });

     */

    // define accident type highlight actions
    $('#cal-btn_auto').click(function() { highlight(highlightAuto); });
    $('#cal-btn_bicycle').click(function() { highlight(highlightBicycle); });
    $('#cal-btn_pedestrian').click(function() { highlight(highlightPedestrian); });
    $('#cal-btn_parked').click(function() { highlight(highlightParked); });
    $('#cal-btn_refresh').click(function() { highlight(highlightNone); });



    function loadData() {
        d3.json("data/cambridge_accidents_2010-2014.json", function(error, jsonData){
            if(!error){
                accidentData = jsonData;

                accidentData.forEach(function(d) {
                    d.date = parseDate(d.date);         // extract date from string
                });

                console.log(accidentData);
                console.log(Date.now());

                newWrangleData();
            }

            READY_STATE._current = READY_STATE.LOADING;

        });
    }




    function newWrangleData(){

        // identify dates with each accident type... save for highlighting
        accidentData.forEach(function (d) {
            if (d.accidentType == "Auto") highlightAuto.push(d.date);
            if (d.accidentType == "Bicycle") highlightBicycle.push(d.date);
            if (d.accidentType == "Pedestrian") highlightPedestrian.push(d.date);
            if (d.accidentType == "Parked Vehicle") highlightParked.push(d.date);
        });


        // create array with totals of accidents by date
        var accidentDataNested = d3.nest()
            .key(function(d) { return d.date.toDateString(); }) // create date as key (without time)
            .rollup(function(d) { return d.length; })           // sum of accidents
            .entries(accidentData);


        // convert data to object structure for cal-heatmap
        // convert date to timestamp and change from milliseconds to seconds
        accidentDataNested.forEach(function(d) {
            calData[parseInt(Date.parse(d.key)/1000)] = d.values;
        });


        // draw 2010-2014 calendar visualizations
        initVis(cal2010, 2010);
        initVis(cal2011, 2011);
        initVis(cal2012, 2012);
        initVis(cal2013, 2013);
        initVis(cal2014, 2014);

        }


    // draw calendar heatmaps for specified year and SVGs
    function initVis(vis, year) {

        idTag = "#cal-heatmap-" + year;

        if (year < 2014) {  // do not show legend unless it is the last calendar year
            // see cal-heatmap.com for library reference
            vis.init({
                data: calData,
                dataType: "json",
                start: new Date(year, 0, 1),
                itemSelector: idTag,
                itemName: ["Accident", "Accidents"],
                domain: "month",
                subDomain: "x_day",
                range: 12,
                weekStartOnMonday: false,
                domainDynamicDimension: false,
                domainGutter: 10,
                domainLabelFormat: "%b-%Y",
                considerMissingDataAsZero: true,
                tooltip: true,
                label: {
                    position: "top",
                    width: 60
                },
                legend: [1, 4, 8, 12, 16],     // levels for color scale
                displayLegend: false
            });
        }
        else {
            // see cal-heatmap.com for library reference
            vis.init({
                data: calData,
                dataType: "json",
                start: new Date(year, 0, 1),
                itemSelector: idTag,
                itemName: ["Accident", "Accidents"],
                domain: "month",
                subDomain: "x_day",
                range: 12,
                weekStartOnMonday: false,
                domainDynamicDimension: false,
                domainGutter: 10,
                domainLabelFormat: "%b-%Y",
                considerMissingDataAsZero: true,
                tooltip: true,
                label: {
                    position: "top",
                    width: 60
                },
                legend: [1, 4, 8, 12, 16],     // levels for color scale
                displayLegend: true
            });
        }
    }


    //  highlight specified dates requested by accident type buttons
    function highlight (list){

        cal2010.highlight(list);
        cal2011.highlight(list);
        cal2012.highlight(list);
        cal2013.highlight(list);
        cal2014.highlight(list);
    }



    /* END CRASHCALENDAR
     *************************/

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

})(crashcaster, $, d3);


