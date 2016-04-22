var HourChart;

(function() {

// Chart size.
var margin = { top: 15, right: 0, bottom: 15, left: 30 };
var width = 450 - margin.left - margin.right;
var height = 65 - margin.top - margin.bottom;

var xDateFormatter = d3.time.format('%-I%p');

HourChart = function HourChart(elementId, accidents) {

    var vis = this;

    this.elementId = elementId;
    this.accidents = accidents;

    this.startDate = new Date(2014, 0, 1);
    this.endDate = new Date(2014, 0, 2);

    // Setup chart.
    this.svg = d3.select('#' + this.elementId).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom));

    this.title = this.svg.append('text')
        .attr('class', 'chart-title')
        .attr('transform', 'translate(' + margin.left + ', 10)')
        .text('Time of Day');

    this.chart = this.svg.append('g')
        .attr('transform',  'translate(' + margin.left + ',' + margin.top + ')');

    // Setup scales.
    this.x = d3.time.scale()
        .domain([ this.startDate, this.endDate ])
        .range([ 0, width ]);

    this.y = d3.scale.linear()
        .range([ height, 0 ]);

    // Setup axes.
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .ticks(d3.time.hours, 2)
        .innerTickSize(-height)
        .tickFormat(function(d) { return xDateFormatter(d).replace('AM', 'am').replace('PM', 'pm'); });

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .ticks(2);

    // SVG generators.
    this.area = d3.svg.area()
        .x(function(d) { return vis.x(d.key); })
        .y0(height)
        .y1(function(d) { return vis.y(d.value); })
        .interpolate('step-after');

    this.line = d3.svg.line()
        .x(function(d) { return vis.x(d.key); })
        .y(function(d) { return vis.y(d.value); })
        .interpolate('step-after');

    // Create the foreground and background chart groups / paths.
    for (var name of [ 'bg', 'fg' ]) {
        this[ name + '_chart' ] = this.chart.append('g')
            .attr('class', name);
        this[ name + '_area_path' ] = this[ name + '_chart' ].append('path')
            .attr('class', 'area');
        this[ name + '_line_path' ] = this[ name + '_chart' ].append('path')
            .attr('class', 'line');
    }
    this.fg_chart
        .attr('clip-path', 'url(#' + this.elementId + '-brush-clip)');

    // Setup brush.
    this.brush = d3.svg.brush()
        .x(this.x)
        .on('brush', function() {
            var extent0 = vis.brush.extent();
            var extent1;
            // If dragging, preserve the width of the extent.
            if (d3.event.mode === 'move') {
                var d0 = d3.time.hour.round(extent0[ 0 ]);
                var d1 = d3.time.hour.offset(d0, Math.round((extent0[ 1 ] - extent0[ 0 ]) / 3600000));
                extent1 = [ d0, d1 ];
            }
            // If resizing, round both dates.
            else {
                extent1 = extent0.map(d3.time.hour.round);
            }
            // Apply the new extent to the brush and clip path.
            d3.select(this)
                .call(vis.brush.extent(extent1));
            d3.select('#' + vis.elementId + '-brush-clip rect')
                .attr('x', vis.x(extent1[ 0 ]))
                .attr('width', vis.x(extent1[ 1 ]) - vis.x(extent1[ 0 ]));
            // Apply the new extent to the crossfilter.
            vis.accidents.hour.filterRange(extent1);
            // Issue an event informing all visualizations that the crossfilter has been updated.
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        })
        .on('brushend', function() {
            if (vis.brush.empty()) {
                // Reset the clip path.
                d3.select('#' + vis.elementId + '-brush-clip rect')
                    .attr('x', 0)
                    .attr('width', width);
                // Reset the crossfilter.
                vis.accidents.hour.filterAll();
            }
            // Issue an event informing all visualizations that the crossfilter has been updated.
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        });

    this.chart.append('g')
        .attr('class', 'brush')
        .call(this.brush)
        .selectAll('rect')
            .attr('height', height);

    this.brushClip = this.chart.append('clipPath')
            .attr('id', this.elementId + '-brush-clip')
        .append('rect')
            .attr('width', width)
            .attr('height', height);

    // Draw axes and axis labels.
    this.xAxis_g = this.chart.append('g')
        .attr('class', 'axis x-axis')
        .style('text-anchor', 'middle')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(this.xAxis);

    this.yAxis_g = this.chart.append('g')
        .attr('class', 'axis y-axis')
        .attr('transform', 'translate(0, 0)');

    this.update();
}
HourChart.prototype = {

    /**
     * Updates the chart. This should be called any time data for the chart is updated.
     */
    update: function() {

        // Get the data from the crossfilter group.
        var data = this.accidents.hours.all();

        // Set the y domain and update the y axis.
        this.y
            .domain([ 0, d3.max(data, function(d) { return d.value; }) ]);
        this.yAxis_g
            .transition()
            .delay(50)
            .duration(300)
            .call(this.yAxis);

        // Draw the background and foreground charts.
        for (var name of [ 'bg', 'fg']) {
            this[ name + '_area_path' ]
                .datum(data)
                .transition()
                .delay(50)
                .duration(300)
                .attr('d', this.area);
            this[ name + '_line_path' ]
                .datum(data)
                .transition()
                .delay(50)
                .duration(300)
                .attr('d', this.line);
        }
    }
}

})();
