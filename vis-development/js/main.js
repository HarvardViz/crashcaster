var visualizations = {
    accidentChoroplethMap: null,
    accidentMap: null,
    yearChart: null,
    weekChart: null
}

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

    visualizations.accidentChoroplethMap = new AccidentChoroplethMap('#accidentChoroplethMap', neighborhoods, roads, accidents);
    visualizations.accidentMap = new AccidentMap('#accidentMap', boundary, roads, accidents);
    visualizations.yearChart = new YearChart('#yearChart', accidents);
    visualizations.weekChart = new WeekChart('#weekChart', accidents);
}
