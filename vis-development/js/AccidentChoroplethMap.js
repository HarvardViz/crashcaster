var AccidentChoroplethMap;

(function() {

// Chart size.
var width = 750;
var height = 500;

// Map projection.
var center = [ -71.118275, 42.377 ];
var projection = d3.geo.conicEqualArea()
    .translate([ width / 2, height / 2 ])
    .scale(400000)
    .rotate([ -center[ 0 ], 0 ])
    .center([ 0, center[ 1 ] ]);
var path = d3.geo.path()
    .projection(projection);

AccidentChoroplethMap = function AccidentChoroplethMap(elementId, neighborhoods, roads, accidents) {

    // Process data.
    this.data = {
        neighborhoods: neighborhoods,
        roads: roads,
        accidents: accidents
    };

    // Setup chart.
    this.svg = d3.select('#' + elementId).append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 ' + width + ' ' + height);
    this.chart = this.svg.append('g');

    this.init();
    this.update(this.data.accidents);
};
AccidentChoroplethMap.prototype = {
    /**
     * Initializes the map. This is called only once, when the map is created.
     */
    init: function() {

        // Draw the neighborhoods of the map.
        this.svg_neighborhoods = this.chart.selectAll('path.neighborhoods')
            .data(this.data.neighborhoods.features);
        this.svg_neighborhoods.enter().append('path')
            .attr('class', 'neighborhood')
            .attr('d', path);
        this.svg_neighborhoods.exit().remove();

        // Draw the roads on the map.
        var roads = this.chart.selectAll('path.road')
            .data(this.data.roads.features);
        roads.enter().append('path')
            .attr('class', 'road')
            .attr('d', path);
        roads.exit().remove();
    },
    /**
     * Updates the map. This should be called any time data for the map is updated.
     * @param {Object[]} accidents - The dataset of accidents to display on the map.
     */
    update: function(accidents) {

        // Compute the choropleth data.
        var _numAccidents = {};
        var _maxAccidents = 0;
        this.data.neighborhoods.features.forEach(function(d) {
            _numAccidents[ d.properties[ 'N_HOOD' ] ] = 0;
        });
        accidents.forEach(function(d) {
            if (d.neighborhood !== null) {
                if (++_numAccidents[ d.neighborhood ] > _maxAccidents) {
                    _maxAccidents = _numAccidents[ d.neighborhood ];
                }
            }
        });
        var accidentLevels = {};
        for (var id of Object.keys(_numAccidents)) {
            accidentLevels[ id ] = _numAccidents[ id ] / _maxAccidents;
        }

        // Adjust neighborhood opacities based on accident levels.
        this.svg_neighborhoods
            .attr('fill-opacity', function(d) {
                return accidentLevels[ d.properties[ 'N_HOOD' ] ];
            }.bind(this));
    }
};

})();
