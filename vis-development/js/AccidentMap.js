var AccidentMap;

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

AccidentMap = function AccidentMap(elementId, boundary, roads, accidents) {

    var vis = this;

    this.boundary = boundary;
    this.roads = roads;
    this.accidents = accidents;

    // Setup chart.
    this.svg = d3.select('#' + elementId).append('svg')
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

    this.update();
}
AccidentMap.prototype = {

    /**
     * Updates the map. This should be called any time data for the map is updated.
     */
    update: function() {

        var data = this.accidents.all.top(Infinity);

        // Draw the accident data points on the map.
        var points = this.chart.selectAll('circle.accident')
            .data(data, function(d) { return d.id; });
        points.enter().append('circle')//TODO: transition in
            .attr('class', 'accident')
            .attr('cx', function(d) { return projection(d.coordinates)[ 0 ]; })
            .attr('cy', function(d) { return projection(d.coordinates)[ 1 ]; })
            .attr('r', 2);
        points.exit().remove();//TODO: transition out
    }
}

})();
