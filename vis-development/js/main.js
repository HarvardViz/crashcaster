var visualizations = {
    accidentChoroplethMap: null,
    accidentMap: null,
    yearChart: null,
    weekChart: null
}

var accidentDateFormatter = d3.time.format('%m/%d/%Y %H:%M:%S %p');

loadData();

function loadData() {

    queue()
        .defer(d3.json, 'data/cambridgegis_data/Boundary/City_Boundary/BOUNDARY_CityBoundary.geojson')
        .defer(d3.json, 'data/cambridgegis_data/Boundary/CDD_Neighborhoods/BOUNDARY_CDDNeighborhoods.geojson')
        .defer(d3.json, 'data/cambridgegis_data/Basemap/Roads/BASEMAP_Roads.geojson')
        .defer(d3.csv, 'data/ACCIDENT_2014.csv')
        .await(processData);
}

function processData(err, boundary, neighborhoods, roads, accidents) {

    if (err) { throw err; }

    accidents = accidents.map(function(d) {
        return {
            coordinates: [ parseFloat(d[ 'Longitude' ]), parseFloat(d[ 'Latitude' ]) ],
            location: d[ 'LOCATION' ],
            object1: d[ 'Object 1' ],
            object2: d[ 'Object 2' ],
            date: accidentDateFormatter.parse(d[ 'Date Time' ]),
            day: d[ 'Day of Week' ]
        };
    });

    visualizations.accidentChoroplethMap = new AccidentChoroplethMap('#accidentChoroplethMap', neighborhoods, roads, accidents);
    visualizations.accidentMap = new AccidentMap('#accidentMap', boundary, roads, accidents);
    visualizations.yearChart = new YearChart('#yearChart', accidents);
    visualizations.weekChart = new WeekChart('#weekChart', accidents);
}
