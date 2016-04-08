var visualizations = {
    accidentChoroplethMap: null,
    accidentMap: null,
    yearChart: null,
    weekChart: null
};

loadData();

function loadData() {

    queue()
        .defer(d3.json, 'data/BOUNDARY_CityBoundary.geojson')
        .defer(d3.json, 'data/BOUNDARY_Neighborhoods.geojson')
        .defer(d3.json, 'data/BASEMAP_Roads.geojson')
        .defer(d3.json, 'data/cambridge_accidents_2010-2014.json')
        .defer(d3.json, 'data/cambridge_weather_2010-2014.json')
        .defer(d3.json, 'data/cambridge_citations_2010-2014.json')
        .await(processData);
}

function processData(err, boundary, neighborhoods, roads, accidents, weather, citations) {

    if (err) { throw err; }

    // Convert date information.
    accidents.forEach(function(d) {
        d.date = new Date(d.date);
    });
    weather.forEach(function(d) {
        d.date = new Date(d.date);
        d.sunrise = new Date(d.sunrise);
        d.sunset = new Date(d.sunset);
    });
    citations.forEach(function(d) {
        d.date = new Date(d.date);
    });

    // Initialize cross filtering for accidents.
//    accidents = crossfilter(accidents);
    //TODO accidents.accidentType =
    //TODO accidents.weatherEvent =
//    accidents.hour  = accidents.dimension(function(d) { return d.date.getHours();    });
//    accidents.day   = accidents.dimension(function(d) { return d.date.getDay();      });
//    accidents.month = accidents.dimension(function(d) { return d.date.getMonth();    });
//    accidents.year  = accidents.dimension(function(d) { return d.date.getFullYear(); });

    // accidents.hour.filterRange(extent); on brush move
    // accidents.hour.filterAll(); on brush reset (all)
    // accidents.groupAll(); to get all filtered accidents
    // accidents.hour.groupAll(); to get all filtered accidents (ignoring dimension's filter)

    // Create visualizations.
    //visualizations.accidentChoroplethMap = new AccidentChoroplethMap('accidentChoroplethMap', neighborhoods, roads, accidents);
    //visualizations.accidentMap = new AccidentMap('accidentMap', boundary, roads, accidents);
    //visualizations.monthChart = new MonthChart('monthChart', accidents);
    visualizations.dayChart = new DayChart('dayChart', accidents);
}
