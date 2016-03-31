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

    //TODO: relate accidents and neighborhoods
    var _numAccidents = {};
    var _maxAccidents = 0;
    neighborhoods.features.forEach(function(d) {
        var id = d.properties[ 'N_HOOD' ];
        _numAccidents[ id ] = 0;
    });
    var parser = new OpenLayers.Format.GeoJSON();
    var vectors = parser.read(neighborhoods);
    accidents.forEach(function(d) {
        var point = new OpenLayers.Geometry.Point(d.coordinates[ 0 ], d.coordinates[ 1 ]);
        for (var i = 0; i < vectors.length; i++) {
            if (vectors[ i ].geometry.intersects(point)) {
                var id = vectors[ i ].attributes[ 'N_HOOD' ];
                if (++_numAccidents[ id ] > _maxAccidents) {
                    _maxAccidents = _numAccidents[ id ];
                }
                return;
            }
        }
        console.log('accident not in neighborhood');
    });
    this.accidentLevels = {};
    for (var id of Object.keys(_numAccidents)) {
        this.accidentLevels[ id ] = _numAccidents[ id ] / _maxAccidents;
    }
    console.log(this.accidentLevels);

    // Setup chart.
    this.svg = d3.select(elementId).append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 ' + width + ' ' + height);
    this.chart = this.svg.append('g');

    this.init();
};
AccidentChoroplethMap.prototype = {
    /**
     * Initializes the map. This is called only once, when the map is created.
     */
    init: function() {

        // Draw the neighborhoods of the map.
        var neighborhoods = this.chart.selectAll('path.neighborhoods')
            .data(this.data.neighborhoods.features);
        neighborhoods.enter().append('path')
            .attr('class', 'neighborhood')
            .attr('d', path)
            .attr('fill-opacity', function(d) {
                var id = d.properties[ 'N_HOOD' ];
                return this.accidentLevels[ id ];
            }.bind(this));
        neighborhoods.exit().remove();

        // Draw the roads on the map.
        var roads = this.chart.selectAll('path.road')
            .data(this.data.roads.features);
        roads.enter().append('path')
            .attr('class', 'road')
            .attr('d', path);
        roads.exit().remove();
    }
};

})();
