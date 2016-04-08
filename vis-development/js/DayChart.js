var DayChart;

(function() {

// Chart size.
var margin = { top: 10, right: 0, bottom: 25, left: 25 };
var width = 750 - margin.left - margin.right;
var height = 100 - margin.top - margin.bottom;

var dateHashFormatter = d3.time.format('%A_%H');
var xDateFormatter = d3.time.format('%a');

DayChart = function DayChart(elementId, accidents) {

    var vis = this;

    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - this.startDate.getDay());
    this.startDate.setHours(0, 0, 0, 0);
    this.endDate = new Date();
    this.endDate.setDate(this.startDate.getDate() + 6);
    this.endDate.setHours(23, 59, 59, 999);

    // Process data.
    var daysHash = {};
    for (var i = 0; i < accidents.length; i++) {
        var key = dateHashFormatter(accidents[ i ].date);
        daysHash[ key ] = (daysHash[ key ] || 0) + 1;
    }
    this.data = d3.time.hours(this.startDate, this.endDate).map(function(d) {
        return {
            date: d,
            accidentCount: daysHash[ dateHashFormatter(d) ] || 0
        };
    });

    // Setup chart.
    this.svg = d3.select(elementId).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom));

    this.chart = this.svg.append('g')
        .attr('transform',  'translate(' + margin.left + ',' + margin.top + ')');

    // Create groups for
    this.brushClip = this.chart.append('clipPath')
            .attr('id', 'brush-clip')
        .append('rect')
            .attr('width', width)
            .attr('height', height);

    this.bg_chart = this.chart.append('g')
        .attr('class', 'background');

    this.fg_chart = this.chart.append('g')
        .attr('class', 'foreground')
        .attr('clip-path', 'url(#brush-clip)');

//TODO: make group for both charts (disabled and active)

    // Setup scales.
    this.x = d3.time.scale()
        .domain([ this.startDate, this.endDate ])
        .range([ 0, width ]);

    this.y = d3.scale.linear()
        .domain([ 0, d3.max(this.data, function(d) { return d.accidentCount; }) ])
        .range([ height, 0 ]);

    // Setup axes.
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .ticks(d3.time.days)
        .innerTickSize(-height)
        .tickFormat(xDateFormatter);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .ticks(4);

    // SVG generators.
    this.area = d3.svg.area()
        .x(function(d) { return vis.x(d.date); })
        .y0(height)
        .y1(function(d) { return vis.y(d.accidentCount); })
        .interpolate('step-after');

    this.line = d3.svg.line()
        .x(function(d) { return vis.x(d.date); })
        .y(function(d) { return vis.y(d.accidentCount); })
        .interpolate('step-after');

    //https://github.com/square/crossfilter/blob/gh-pages/index.html
// reference for brush clipping (two charts over each other)

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
                // If empty after rounding, use floor and ceiling instead.
                //if (extent1[ 0 ] >= extent1[ 1 ]) {
                    //extent1[ 0 ] = d3.time.hour.floor(extent0[ 0 ]);
                    //extent1[ 1 ] = d3.time.hour.ceil(extent0[ 1 ]);
                    //vis.brush.clear();
                //}
            }
            // Apply the new extent to the brush and clip path.
            d3.select(this)
                .call(vis.brush.extent(extent1));
            d3.select('#brush-clip rect')
                .attr('x', vis.x(extent1[ 0 ]))
                .attr('width', vis.x(extent1[ 1 ]) - vis.x(extent1[ 0 ]));
        })
        .on('brushend', function() {
            if (vis.brush.empty()) {
                // Reset the clip path.
                d3.select('#brush-clip rect')
                    .attr('x', 0)
                    .attr('width', width);
            }
        });

    this.chart.append('g')
        .attr('class', 'brush')
        .call(this.brush)
        .selectAll('rect')
            .attr('height', height);

    // Draw foreground and back area and line charts.
//TODO: combine these, they should do the same thing
    this.bg_area_path = this.bg_chart.append('path')
        .attr('class', 'area');

    this.bg_line_path = this.bg_chart.append('path')
        .attr('class', 'line');

    this.fg_area_path = this.fg_chart.append('path')
        .attr('class', 'area');

    this.fg_line_path = this.fg_chart.append('path')
        .attr('class', 'line');

    // Draw axes and axis labels.
    this.xAxis_g = this.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(this.xAxis);
    // Center the month labels.
    var ticks = this.xAxis.scale().ticks(this.xAxis.ticks()[ 0 ]);
    var tickSize = this.x(ticks[ 1 ]) - this.x(ticks[ 0 ]);
    this.xAxis_g.selectAll('.tick text')
        .style('text-anchor', 'middle')
        .attr('x', tickSize / 2);

    this.yAxis_g = this.chart.append('g')
        .attr('class', 'axis y-axis')
        .attr('transform', 'translate(0, 0)')
        .call(this.yAxis);

    this.update();
}
DayChart.prototype = {
    /**
     * Updates the chart. This should be called any time data for the chart is updated.
     */
    update: function() {
//TODO: combine these, they should do the same thing
        this.bg_area_path
            .datum(this.data)
            //TODO:transition
            .attr('d', this.area);

        this.bg_line_path
            .datum(this.data)
            //TODO:transition
            .attr('d', this.line);

        this.fg_area_path
            .datum(this.data)
            //TODO:transition
            .attr('d', this.area);

        this.fg_line_path
            .datum(this.data)
            //TODO:transition
            .attr('d', this.line);
    }
}

})();
