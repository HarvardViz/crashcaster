var AccidentMap;

(function() {

// Chart size.
var width = 750;
var height = 575;

// Map projection.
var center = [ -71.112, 42.378 ];
var projection = d3.geo.albers()
    .translate([ width / 2, height / 2 ])
    .scale(600000)
    .rotate([ -center[ 0 ], 0 ])
    .center([ 0, center[ 1 ] ]);
var path = d3.geo.path()
    .projection(projection);

var MapView = {
    Accidents: 0,
    Neighborhoods: 1
};

AccidentMap = function AccidentMap(elementId, toggleElementId, boundary, roads, neighborhoods, accidents) {

    var vis = this;

    this.elementId = elementId;
    this.element = d3.select('#' + this.elementId);
    this.toggleElementId = toggleElementId;
    this.toggleElement = d3.select('#' + this.toggleElementId);

    this.boundary = boundary;
    this.roads = roads;
    this.neighborhoods = neighborhoods;
    this.accidents = accidents;

    // Setup toggle controls.
    this._currentView = MapView.Accidents;

    this.label = this.toggleElement.append('div')
        .attr('class', 'filter-label')
        .text('Map View');

    this.mapToggle = this.toggleElement.append('ul');
    this.accidentsToggle = this.mapToggle.append('li')
        .attr('class', 'active')
        .text('Accidents')
        .on('click', function() {
            if (vis._currentView === MapView.Accidents) { return; }
            vis.accidentsToggle.classed('active', true);
            vis.neighborhoodsToggle.classed('active', false);
            vis._currentView = MapView.Accidents;
            vis.update();
        });
    this.neighborhoodsToggle = this.mapToggle.append('li')
        .text('Neighborhoods')
        .on('click', function() {
            if (vis._currentView === MapView.Neighborhoods) { return; }
            vis.accidentsToggle.classed('active', false);
            vis.neighborhoodsToggle.classed('active', true);
            vis._currentView = MapView.Neighborhoods;
            vis.update();
        });
    this.element.append('div')
        .attr('class', 'clearfix');

    // Setup chart.
    this.svg = this.element.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 ' + width + ' ' + height);
    this.chart = this.svg.append('g');

    // Draw the boundary of the map.
    var boundary = this.chart.selectAll('path.boundary')
        .data(this.boundary.features);
    boundary.enter().append('path')
        .attr('class', 'boundary')
        .attr('d', path);

    // Draw the roads on the map.
    var roads = this.chart.selectAll('path.road')
        .data(this.roads.features);
    roads.enter().append('path')
        .attr('class', 'road')
        .attr('d', path);

    // Setup tooltips.
    this.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([ -10, 0 ])
        .html(function(d) {
            return d.properties.NAME;
        });
    this.svg.call(this.tip);

    this.update();
}
AccidentMap.prototype = {

    /**
     * Updates the map. This should be called any time data for the map is updated.
     */
    update: function() {

        var data = this.accidents.all.top(Infinity);

        // Draw the accidents view.
        if (this._currentView === MapView.Accidents) {

            // Delete all existing neighborhoods.
            this.chart.selectAll('path.neighborhood').remove();

            // Draw the accident data points on the map.
            var points = this.chart.selectAll('circle.accident')
                .data(data, function(d) { return d.id; });
            points.enter().append('circle')
                .attr('class', 'accident')
                .attr('cx', function(d) { return projection(d.coordinates)[ 0 ]; })
                .attr('cy', function(d) { return projection(d.coordinates)[ 1 ]; })
                .attr('r', 2);
            points.exit().remove();
        }
        // Draw the neighborhoods view.
        else {

            // Delete all existing accident points.
            this.chart.selectAll('circle.accident').remove();

            // Compute the choropleth values for the data.
            var _numAccidents = {};
            var _maxAccidents = 0;
            this.neighborhoods.features.forEach(function(d) {
                _numAccidents[ d.properties[ 'N_HOOD' ] ] = 0;
            });
            data.forEach(function(d) {
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

            // Draw the neighborhoods on the map.
            var neighborhoods = this.chart.selectAll('path.neighborhood')
                .data(this.neighborhoods.features);
            neighborhoods.enter().append('path')
                .attr('class', 'neighborhood')
                .attr('d', path)
                .on('mouseover', this.tip.show)
                .on('mouseout', this.tip.hide)
            neighborhoods
                .attr('fill-opacity', function(d) {
                    return accidentLevels[ d.properties[ 'N_HOOD' ] ] || 0;
                });
            neighborhoods.exit().remove();
        }
    }
}

})();
