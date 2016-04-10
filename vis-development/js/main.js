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
    accidents.forEach(function(d, i) {
        d.id = i;
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
    accidents = crossfilter(accidents);
    accidents.all    = accidents.dimension(function(d, i) { return i; });
    accidents.year   = accidents.dimension(function(d) { return new Date(d.date.getFullYear(), d.date.getMonth(), 0); });
    accidents.years  = accidents.year.group();
    accidents.month  = accidents.dimension(function(d) { return new Date(2014, d.date.getMonth(), d.date.getDate()); });
    accidents.months = accidents.month.group();
    accidents.day    = accidents.dimension(function(d) { return new Date(2014, 0, 5 + d.date.getDay(), d.date.getHours()); });
    accidents.days   = accidents.day.group();
    accidents.hour   = accidents.dimension(function(d) { return new Date(2014, 0, 1, d.date.getHours()); });
    accidents.hours  = accidents.hour.group();

    // Create visualizations.
    //visualizations.accidentChoroplethMap = new AccidentChoroplethMap('accidentChoroplethMap', neighborhoods, roads, accidents);
    visualizations.accidentMap = new AccidentMap('accidentMap', boundary, roads, accidents);
    visualizations.yearChart = new YearChart('yearChart', accidents);
    visualizations.monthChart = new MonthChart('monthChart', accidents);
    visualizations.dayChart = new DayChart('dayChart', accidents);
    visualizations.hourChart = new HourChart('hourChart', accidents);

    // Update each visualization when the crossfilter is updated.
    $(document).on('accidents:crossfilter:update', function() {
        visualizations.accidentMap.update();
        visualizations.yearChart.update();
        visualizations.monthChart.update();
        visualizations.dayChart.update();
        visualizations.hourChart.update();
    });
}
