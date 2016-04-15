var filters = {
    accidentTypeFilter: null,
    weatherFilter: null
};

var visualizations = {
    accidentMap: null,
    yearChart: null,
    monthChart: null,
    dayChart: null,
    hourChart: null
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
    // Create a weather lookup, by date.
    var _weatherLookup = {};
    weather.forEach(function(d) {
        d.date = new Date(d.date);
        d.sunrise = new Date(d.sunrise);
        d.sunset = new Date(d.sunset);
        _weatherLookup[ d3.time.format("%Y-%m-%d")(d.date) ] = d;
    });
    citations.forEach(function(d) {
        d.date = new Date(d.date);
    });

    // Initialize cross filtering for accidents.
    accidents = crossfilter(accidents);
    accidents.all           = accidents.dimension(function(d, i) { return i; });
    accidents.accidentType  = accidents.dimension(function(d) { return d.accidentType; });
    accidents.accidentTypes = accidents.accidentType.group();
    accidents.weather       = accidents.dimension(function(d) {
        var weatherData = _weatherLookup[ d3.time.format("%Y-%m-%d")(d.date) ];
        var result = [];
        if (weatherData.events.fog) { result.push('Fog'); }
        if (weatherData.events.rain) { result.push('Rain'); }
        if (weatherData.events.thunderstorm) { result.push('Thunderstorm'); }
        if (weatherData.events.snow) { result.push('Snow'); }
        if (weatherData.events.hail) { result.push('Hail'); }
        return result.join('-');
    });
    accidents.year          = accidents.dimension(function(d) { return new Date(d.date.getFullYear(), d.date.getMonth(), 0); });
    accidents.years         = accidents.year.group();
    accidents.month         = accidents.dimension(function(d) { return new Date(2014, d.date.getMonth(), d.date.getDate()); });
    accidents.months        = accidents.month.group();
    accidents.day           = accidents.dimension(function(d) { return new Date(2014, 0, 5 + d.date.getDay(), d.date.getHours()); });
    accidents.days          = accidents.day.group();
    accidents.hour          = accidents.dimension(function(d) { return new Date(2014, 0, 1, d.date.getHours()); });
    accidents.hours         = accidents.hour.group();

    // Create visualizations.
    filters.accidentTypeFilter = new AccidentTypeFilter('accidentTypeFilter', accidents);
    filters.weatherFilter = new WeatherFilter('weatherFilter', accidents);
    visualizations.accidentMap = new AccidentMap('accidentMap', boundary, roads, neighborhoods, accidents);
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
