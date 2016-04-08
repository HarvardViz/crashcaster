var MonthChart;

(function() {

// Chart size.
var margin = { top: 10, right: 0, bottom: 25, left: 25 };
var width = 750 - margin.left - margin.right;
var height = 100 - margin.top - margin.bottom;

var dateHashFormatter = d3.time.format('%Y_%m_%d');
var xDateFormatter = d3.time.format('%b');

MonthChart = function MonthChart(elementId, accidents) {

    this.startDate = new Date(2014, 0, 1);
    this.endDate = new Date(2015, 0, -1);

    // Process data.
    var daysHash = {};
    for (var i = 0; i < accidents.length; i++) {
        var key = dateHashFormatter(accidents[ i ].date);
        daysHash[ key ] = (daysHash[ key ] || 0) + 1;
    }
    this.data = d3.time.days(this.startDate, this.endDate).map(function(d) {
        return {
            date: d,
            accidentCount: daysHash[ dateHashFormatter(d) ] || 0
        };
    });

    // Setup chart.
    this.svg = d3.select('#' + elementId).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom));

    this.chart = this.svg.append('g')
        .attr('transform',  'translate(' + margin.left + ',' + margin.top + ')');

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
        .ticks(d3.time.months)
        .innerTickSize(-height)
        .tickFormat(xDateFormatter);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .ticks(4);

    // SVG generators.
    this.area = d3.svg.area()
        .x(function(d) { return this.x(d.date); }.bind(this))
        .y0(height)
        .y1(function(d) { return this.y(d.accidentCount); }.bind(this))
        .interpolate('step-after');

    this.line = d3.svg.line()
        .x(function(d) { return this.x(d.date); }.bind(this))
        .y(function(d) { return this.y(d.accidentCount); }.bind(this))
        .interpolate('step-after');

    // Setup brush.
    this.brush = d3.svg.brush()
        .x(this.x)
        .on('brush', function() {
            var extent0 = vis.brush.extent();
            var extent1;
            // If dragging, preserve the width of the extent.
            if (d3.event.mode === 'move') {
                var d0 = d3.time.month.round(extent0[ 0 ]);
                var d1 = d3.time.month.offset(d0, Math.round((extent0[ 1 ] - extent0[ 0 ]) / 86400000));
                extent1 = [ d0, d1 ];
            }
            // If resizing, round both dates.
            else {
                extent1 = extent0.map(d3.time.month.round);
            }
            // Apply the new extent to the brush and clip path.
            d3.select(this)
                .call(vis.brush.extent(extent1));
            d3.select('#' + vis.elementId + '-brush-clip rect')
                .attr('x', vis.x(extent1[ 0 ]))
                .attr('width', vis.x(extent1[ 1 ]) - vis.x(extent1[ 0 ]));
        })
        .on('brushend', function() {
            if (vis.brush.empty()) {
                // Reset the clip path.
                d3.select('#' + vis.elementId + '-brush-clip rect')
                    .attr('x', 0)
                    .attr('width', width);
            }
            var extent = vis.brush.extent();
            var dayRange = [
                extent[ 0 ].getDay(),
                extent[ 1 ].getDay() - 1
            ];
            //TODO: comment
            $.event.trigger({
                type: 'accidentMap:filter:update:dayRange',
                dayRange: dayRange
            });
        });

    this.chart.append('g')
        .attr('class', 'brush')
        .call(this.brush)
        .selectAll('rect')
            .attr('height', height);

    //TODO

    this.init();
    this.update();
}
MonthChart.prototype = {
    /**
     * Initializes the chart. This is called only once, when the chart is created.
     */
    init: function() {

        this.area_path = this.chart.append('path')
            .attr('class', 'area');

        this.line_path = this.chart.append('path')
            .attr('class', 'line');

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
    },
    /**
     * Updates the chart. This should be called any time data for the chart is updated.
     */
    update: function() {

        this.area_path
            .datum(this.data)
            //TODO:transition
            .attr('d', this.area);

        this.line_path
            .datum(this.data)
            //TODO:transition
            .attr('d', this.line);
    }
}

})();
