crashcaster.crashboard = (function (cc$, $, queue, d3, crashboard) {
    /* Above:
     * 1. Define the plug-in module name, e.g. `crashcaster.weather` (no `var` is needed since `crashcaster` already exists)
     * 2. The plug-in module name should be named to match, e.g. `crashcaster.weather.js`
     * 3. The function arguments are libraries we want to import for use within the closure (this plug-in module), e.g. $, d3
     *    Note `cc$` is a shortcut to the main `crashcaster` object, you could just as easily use `crashcaster` instead
     *
     *    IMPORTANT:  For async calls like d3.json be sure to set the current READY_STATE in the callback to LOADED or in the
     *    init(), e.g.
     *
     *      READY_STATE._current = READY_STATE.LOADED;
     *
     *  4. Update the last line of the `crashcaster.js` by adding the module name to the module array, e.g.
     *
     *      })(crashcaster || {}, ["crashcaster.weather", "crashcaster.model"], $, d3, moment);
     */


    /* Your plug-in module code here - write simple functions
     * --------------------------------------------------------------------- */

    var plugin_name = "crashcaster.crashboard";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };


    // Add ANYTHING that needs happen when this plugin/module is initialized
    function init() {
        echo("initialize " + plugin_name);
        READY_STATE._current = READY_STATE.LOADED;
        loadData();
    }

    // Once the module is ready via init(), add anything that needs to be run here
    function run() {
        echo("running " + plugin_name);
    }

    // Public method: A simple example function, exposed as a public method in the var my = {} object at the bottom
    function echo(v) {
        console.log(v);
    };

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

    var features = {
        stories: null
    };

    // Private method: fetch the weather data
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

    function createNormalizedDate(dateString) {
        var r = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/.exec(dateString);
        var normalizedDate = new Date(
            parseInt(r[ 1 ], 10),
            parseInt(r[ 2 ], 10) - 1,
            parseInt(r[ 3 ], 10),
            parseInt(r[ 4 ], 10),
            parseInt(r[ 5 ], 10),
            parseInt(r[ 6 ], 10));
        return normalizedDate;
    }

    function processData(err, boundary, neighborhoods, roads, accidents, weather, citations) {

        if (err) { throw err; }

        // Convert date information.
        accidents.forEach(function(d, i) {
            d.id = i;
            d.date = createNormalizedDate(d.date);
        });
        accidents = accidents.filter(function(d) {
            return d.date.getFullYear() >= 2010 && d.date.getFullYear() <= 2014;
        });

        // Create a weather lookup, by date.
        var _weatherLookup = {};
        weather.forEach(function(d) {
            d.date = createNormalizedDate(d.date);
            d.sunrise = createNormalizedDate(d.sunrise);
            d.sunset = createNormalizedDate(d.sunset);
            _weatherLookup[ d3.time.format('%Y-%m-%d')(d.date) ] = d;
        });
        citations.forEach(function(d) {
            d.date = createNormalizedDate(d.date);
        });

        // Initialize cross filtering for accidents.
        accidents = crossfilter(accidents);
        accidents.all           = accidents.dimension(function(d, i) { return i; });
        accidents.accidentType  = accidents.dimension(function(d) { return d.accidentType; });
        accidents.accidentTypes = accidents.accidentType.group();
        accidents.weather       = accidents.dimension(function(d) {
            var weatherData = _weatherLookup[ d3.time.format('%Y-%m-%d')(d.date) ];
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
        filters.accidentTypeFilter = new AccidentTypeFilter('crashboard_accidentTypeFilter', accidents);
        filters.weatherFilter = new WeatherFilter('crashboard_weatherFilter', accidents);
        visualizations.accidentMap = new AccidentMap('crashboard_accidentMap', 'crashboard_mapToggle', boundary, roads, neighborhoods, accidents);
        visualizations.yearChart = new YearChart('crashboard_yearChart', accidents);
        visualizations.monthChart = new MonthChart('crashboard_monthChart', accidents);
        visualizations.dayChart = new DayChart('crashboard_dayChart', accidents);
        visualizations.hourChart = new HourChart('crashboard_hourChart', accidents);
        features.stories = new Stories('crashboard_storiesBar', 'crashboard_storiesContent');

        // Update each visualization when the crossfilter is updated.
        $(document).on('accidents:crossfilter:update', function() {
            visualizations.accidentMap.update();
            visualizations.yearChart.update();
            visualizations.monthChart.update();
            visualizations.dayChart.update();
            visualizations.hourChart.update();
        });


    }

    //----------------------------------------------------------------------------------------------
    // AccidentMap
    //----------------------------------------------------------------------------------------------

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
        this.legend = this.svg.append('g')
            .attr('class', 'accidentMapLegend')
            .attr('transform', 'translate(280, 20)');

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

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            vis.accidentsToggle.classed('active', config.mapView === undefined ? true : config.mapView === MapView.Accidents);
            vis.neighborhoodsToggle.classed('active', config.mapView === undefined ? false : config.mapView === MapView.Neighborhoods);
            vis._currentView = config.mapView === undefined ? MapView.Accidents : config.mapView;
        });

        this.update();
    }
    AccidentMap.prototype = {
        _expoEaseOut: function(t) {
            t = Math.min(Math.max(t, 0), 1);
            return -Math.pow(2, -10 * t) + 1;
        },
        /**
         * Updates the map. This should be called any time data for the map is updated.
         */
        update: function() {

            var data = this.accidents.all.top(Infinity);

            // Draw the accidents view.
            if (this._currentView === MapView.Accidents) {

                var minOpacity = 0.05, maxOpacity = 0.5;
                var dataPointOpacity = maxOpacity - (this._expoEaseOut(data.length / 7813) * (maxOpacity - minOpacity));
                var legendValues = [ 1, 2, 4, 8, 16, 32 ];

                // Delete all existing neighborhoods.
                this.chart.selectAll('path.neighborhood').remove();
                this.legend.selectAll('rect.neighborhoodLegend').remove();
                this.legend.selectAll('text.neighborhoodLabel').remove();

                // Draw the accident data points on the map.
                var points = this.chart.selectAll('circle.accident')
                    .data(data, function(d) { return d.id; });
                points.enter().append('circle')
                    .attr('class', 'accident')
                    .attr('cx', function(d) { return projection(d.coordinates)[ 0 ]; })
                    .attr('cy', function(d) { return projection(d.coordinates)[ 1 ]; })
                    .attr('r', 5);
                points
                    .attr('fill-opacity', dataPointOpacity);
                points.exit().remove();

                // Draw the legend.
                var legend = this.legend.selectAll('circle.accident')
                    .data(legendValues);
                legend.enter().append('circle')
                    .attr('class', 'accident')
                    .attr('cx', function(d, i) { return i * 21; })
                    .attr('cy', 0)
                    .attr('r', 8);
                legend
                    .attr('fill-opacity', function(d) {
                        var calculatedOpacity = dataPointOpacity;
                        for (var j = 0; j < d; j++) {
                            calculatedOpacity = calculatedOpacity + (1 - calculatedOpacity) * dataPointOpacity;
                        }
                        return calculatedOpacity;
                    });
                legend.exit().remove();
                var legendLabels = this.legend.selectAll('text.accidentLabel')
                    .data(legendValues);
                legendLabels.enter().append('text')
                    .attr('class', 'accidentLabel')
                    .attr('x', function(d, i) { return i * 21; })
                    .attr('y', 20)
                    .text(function(d) { return d; })
                    .attr('text-anchor', 'middle');
                legendLabels.exit().remove();
            }
            // Draw the neighborhoods view.
            else {

                var legendValues = [ 0.14, 0.28, 0.42, 0.56, 0.6, 0.74, 0.88, 1.0 ];

                // Delete all existing accident points.
                this.chart.selectAll('circle.accident').remove();
                this.legend.selectAll('circle.accident').remove();
                this.legend.selectAll('text.accidentLabel').remove();

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

                // Draw the legend.
                var legend = this.legend.selectAll('rect.neighborhoodLegend')
                    .data(legendValues);
                legend.enter().append('rect')
                    .attr('class', 'neighborhoodLegend')
                    .attr('x', function(d, i) { return i * 16; })
                    .attr('y', -8)
                    .attr('width', 16)
                    .attr('height', 16);
                legend
                    .attr('fill-opacity', function(d) { return d; });
                legend.exit().remove();
                var legendLabels = this.legend.selectAll('text.neighborhoodLabel')
                    .data([ 0, _maxAccidents ]);
                legendLabels.enter().append('text')
                    .attr('class', 'neighborhoodLabel')
                    .attr('x', function(d, i) { return i === 0 ? 0 : legendValues.length * 16; })
                    .attr('y', 20)
                    .attr('text-anchor', 'middle');
                legendLabels
                    .text(function(d) { return d; });
                legendLabels.exit().remove();
            }
        },
        /*
         * Add an area marker to the map.
         */
        showAreaMarker: function showAreaMarker(coordinates) {

            this.chart.append('circle')
                .attr('class', 'areaMarker')
                .attr('cx', function(d) { return projection(coordinates)[ 0 ]; })
                .attr('cy', function(d) { return projection(coordinates)[ 1 ]; })
                .attr('r', 1)
                .transition()
                .duration(300)
                .attr('r', 60);
        },
        /*
         * Clear all area markers on the map.
         */
        clearAreaMarkers: function clearAreaMarkers() {

            this.chart.selectAll('circle.areaMarker').remove();
        }
    }

    })();

    //----------------------------------------------------------------------------------------------
    // AccidentTypeFilter
    //----------------------------------------------------------------------------------------------

    var AccidentTypeFilter;

    (function() {

    var icons = {
        'Auto'             : 'fa-car',
        'Motorcycle/Moped' : 'fa-motorcycle',
        'Bicycle'          : 'fa-bicycle',
        'Pedestrian'       : 'fa-male',
        'Parked Vehicle'   : 'fa-arrow-circle-down',
        'Fixed Object'     : 'fa-tree',
        'Miscellaneous'    : 'fa-ellipsis-h'
    };

    AccidentTypeFilter = function AccidentTypeFilter(elementId, accidents) {

        var fil = this;

        this.elementId = elementId;
        this.accidents = accidents;

        // All unique accident types.
        var accidentTypes = [ 'Auto', 'Motorcycle/Moped', 'Bicycle', 'Pedestrian', 'Parked Vehicle', 'Fixed Object', 'Miscellaneous' ];

        // Initialize all accident types as selected.
        var _selected = {};
        for (var type of accidentTypes) {
            _selected[ type ] = true;
        }

        // Function to update the crossfilter based on the data here.
        function updateCrossfilter() {
            fil.accidents.accidentType.filter(function(d) {
                return _selected[ d ];
            });
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        }

        // Setup main element and label.
        this.element = d3.select('#' + this.elementId);
        this.label = this.element.append('div')
            .attr('class', 'filter-label')
            .text('Accident Types');

        // Setup filter controls.
        var ul = this.element.append('ul');
        var filterOptions = ul.selectAll('li')
            .data(accidentTypes);
        var listItems = filterOptions.enter().append('li')
            .attr('class', 'active')
            .attr('title', function(d) { return d; })
            .on('click', function(d) {
                _selected[ d ] = !_selected[ d ];
                this.classList[ _selected[ d ] ? 'add' : 'remove' ]('active');
                updateCrossfilter();
            });
        listItems.append('i')
            .attr('class', function(d) { return 'fa ' + icons[ d ]; });
        var resetButton = ul.append('li')
            .attr('class', 'reset')
            .on('click', function() {
                filterOptions.attr('class', 'active');
                for (var event of Object.keys(_selected)) {
                    _selected[ event ] = true;
                }
                updateCrossfilter();
            });
        resetButton.append('i')
            .attr('class', 'fa fa-refresh');
        this.element.append('div')
            .attr('class', 'clearfix');

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            for (var type of accidentTypes) {
                _selected[ type ] = !config.accidentTypes ? true : config.accidentTypes.indexOf(type) !== -1;
            }
            filterOptions
                .attr('class', function(d) { return _selected[ d ] ? 'active' : ''; });
            fil.accidents.accidentType.filter(function(d) {
                return _selected[ d ];
            });
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        });
    };

    }());

    //----------------------------------------------------------------------------------------------
    // WeatherFilter
    //----------------------------------------------------------------------------------------------

    var WeatherFilter;

    (function() {

    var icons = {
        'Fog'          : 'wi-fog',
        'Rain'         : 'wi-rain',
        'Thunderstorm' : 'wi-thunderstorm',
        'Snow'         : 'wi-snow',
        'Hail'         : 'wi-hail',
        'None'         : 'wi-day-sunny'
    };

    WeatherFilter = function WeatherFilter(elementId, accidents) {

        var fil = this;

        this.elementId = elementId;
        this.accidents = accidents;

        // All unique weather events.
        var weatherEvents = [ 'Fog', 'Rain', 'Thunderstorm', 'Snow', 'Hail', 'None' ];

        // Initialize all accident types as selected.
        var _selected = {};
        for (var event of weatherEvents) {
            _selected[ event ] = true;
        }

        // Function to update the crossfilter based on the data here.
        function updateCrossfilter() {
            fil.accidents.weather.filter(function(d) {
                for (var event of Object.keys(_selected)) {
                    if (_selected[ event ] && (event === 'None' ? d === '' : d.indexOf(event) !== -1)) {
                        return true;
                    }
                }
                return false;
            });
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        }

        // Setup main element and label.
        this.element = d3.select('#' + this.elementId);
        this.label = this.element.append('div')
            .attr('class', 'filter-label')
            .text('Weather');

        // Setup filter controls.
        var ul = this.element.append('ul');
        var filterOptions = ul.selectAll('li')
            .data(weatherEvents);
        var listItems = filterOptions.enter().append('li')
            .attr('class', 'active')
            .attr('title', function(d) { return d; })
            .on('click', function(d) {
                _selected[ d ] = !_selected[ d ];
                this.classList[ _selected[ d ] ? 'add' : 'remove' ]('active');
                updateCrossfilter();
            });
        listItems.append('i')
            .attr('class', function(d) { return 'wi ' + icons[ d ]; });
        var resetButton = ul.append('li')
            .attr('class', 'reset')
            .on('click', function() {
                filterOptions.attr('class', 'active');
                for (var event of Object.keys(_selected)) {
                    _selected[ event ] = true;
                }
                updateCrossfilter();
            });
        resetButton.append('i')
            .attr('class', 'fa fa-refresh');
        this.element.append('div')
            .attr('class', 'clearfix');

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            for (var event of weatherEvents) {
                _selected[ event ] = !config.weatherEvents ? true : config.weatherEvents.indexOf(event) !== -1;
            }
            filterOptions
                .attr('class', function(d) { return _selected[ d ] ? 'active' : ''; });
            fil.accidents.weather.filter(function(d) {
                for (var event of Object.keys(_selected)) {
                    if (_selected[ event ] && (event === 'None' ? d === '' : d.indexOf(event) !== -1)) {
                        return true;
                    }
                }
                return false;
            });
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        });
    };

    }());

    //----------------------------------------------------------------------------------------------
    // YearChart
    //----------------------------------------------------------------------------------------------

    var YearChart;

    (function() {

    // Chart size.
    var margin = { top: 15, right: 0, bottom: 15, left: 30 };
    var width = 450 - margin.left - margin.right;
    var height = 65 - margin.top - margin.bottom;

    var xDateFormatter = d3.time.format('%Y');

    YearChart = function YearChart(elementId, accidents) {

        var vis = this;

        this.elementId = elementId;
        this.accidents = accidents;

        this.startDate = new Date(2010, 0, 1);
        this.endDate = new Date(2015, 0, 0, 0, 0, -1);

        // Setup chart.
        this.svg = d3.select('#' + this.elementId).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom));

        this.title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('transform', 'translate(' + margin.left + ', 10)')
            .text('Year');

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
            .ticks(d3.time.years)
            .innerTickSize(-height)
            .tickFormat(xDateFormatter);

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
                    var d0 = d3.time.year.round(extent0[ 0 ]);
                    var d1 = d3.time.year.offset(d0, Math.round((extent0[ 1 ] - extent0[ 0 ]) / 31536000000));
                    extent1 = [ d0, d1 ];
                }
                // If resizing, round both dates.
                else {
                    extent1 = extent0.map(d3.time.year.round);
                }
                // Apply the new extent to the brush and clip path.
                d3.select(this)
                    .call(vis.brush.extent(extent1));
                d3.select('#' + vis.elementId + '-brush-clip rect')
                    .attr('x', vis.x(extent1[ 0 ]))
                    .attr('width', vis.x(extent1[ 1 ]) - vis.x(extent1[ 0 ]));
                // Apply the new extent to the crossfilter.
                vis.accidents.year.filterRange(extent1);
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
                    vis.accidents.year.filterAll();
                }
                // Issue an event informing all visualizations that the crossfilter has been updated.
                $.event.trigger({ type: 'accidents:crossfilter:update' });
            });

        var brushElement = this.chart.append('g')
            .attr('class', 'brush')
            .call(this.brush);
        brushElement.selectAll('rect')
                .attr('height', height);

        this.brushClip = this.chart.append('clipPath')
                .attr('id', this.elementId + '-brush-clip')
            .append('rect')
                .attr('width', width)
                .attr('height', height);

        // Draw axes and axis labels.
        this.xAxis_g = this.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + height + ')')
            .call(this.xAxis);
        // Center the day labels.
        var ticks = this.xAxis.scale().ticks(this.xAxis.ticks()[ 0 ]);
        var tickSize = this.x(ticks[ 1 ]) - this.x(ticks[ 0 ]);
        this.xAxis_g.selectAll('.tick text')
            .style('text-anchor', 'middle')
            .attr('x', tickSize / 2);

        this.yAxis_g = this.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', 'translate(0, 0)');

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            if (!config.yearRange) {
                vis.brush.clear();
            }
            else {
                vis.brush.extent(config.yearRange);
            }
            vis.brush.event(brushElement);
        });

        this.update();
    }
    YearChart.prototype = {

        /**
         * Updates the chart. This should be called any time data for the chart is updated.
         */
        update: function() {

            // Get the data from the crossfilter group.
            var data = this.accidents.years.all();

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

    //----------------------------------------------------------------------------------------------
    // MonthChart
    //----------------------------------------------------------------------------------------------

    var MonthChart;

    (function() {

    // Chart size.
    var margin = { top: 15, right: 0, bottom: 15, left: 30 };
    var width = 450 - margin.left - margin.right;
    var height = 65 - margin.top - margin.bottom;

    var xDateFormatter = d3.time.format('%b');

    MonthChart = function MonthChart(elementId, accidents) {

        var vis = this;

        this.elementId = elementId;
        this.accidents = accidents;

        this.startDate = new Date(2014, 0, 1);
        this.endDate = new Date(2015, 0, 0, 0, 0, -1);

        // Setup chart.
        this.svg = d3.select('#' + this.elementId).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom));

        this.title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('transform', 'translate(' + margin.left + ', 10)')
            .text('Month');

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
            .ticks(d3.time.months)
            .innerTickSize(-height)
            .tickFormat(xDateFormatter);

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
                    var d0 = d3.time.month.round(extent0[ 0 ]);
                    var d1 = d3.time.month.offset(d0, Math.round((extent0[ 1 ] - extent0[ 0 ]) / 2592000000));
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
                // Apply the new extent to the crossfilter.
                vis.accidents.month.filterRange(extent1);
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
                    vis.accidents.month.filterAll();
                }
                // Issue an event informing all visualizations that the crossfilter has been updated.
                $.event.trigger({ type: 'accidents:crossfilter:update' });
            });

        var brushElement = this.chart.append('g')
            .attr('class', 'brush')
            .call(this.brush);
        brushElement.selectAll('rect')
                .attr('height', height);

        this.brushClip = this.chart.append('clipPath')
                .attr('id', this.elementId + '-brush-clip')
            .append('rect')
                .attr('width', width)
                .attr('height', height);

        // Draw axes and axis labels.
        this.xAxis_g = this.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + height + ')')
            .call(this.xAxis);
        // Center the day labels.
        var ticks = this.xAxis.scale().ticks(this.xAxis.ticks()[ 0 ]);
        var tickSize = this.x(ticks[ 1 ]) - this.x(ticks[ 0 ]);
        this.xAxis_g.selectAll('.tick text')
            .style('text-anchor', 'middle')
            .attr('x', tickSize / 2);

        this.yAxis_g = this.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', 'translate(0, 0)');

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            if (!config.monthRange) {
                vis.brush.clear();
            }
            else {
                vis.brush.extent(config.monthRange);
            }
            vis.brush.event(brushElement);
        });

        this.update();
    }
    MonthChart.prototype = {

        /**
         * Updates the chart. This should be called any time data for the chart is updated.
         */
        update: function() {

            // Get the data from the crossfilter group.
            var data = this.accidents.months.all();

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

    //----------------------------------------------------------------------------------------------
    // DayChart
    //----------------------------------------------------------------------------------------------

    var DayChart;

    (function() {

    // Chart size.
    var margin = { top: 15, right: 0, bottom: 15, left: 30 };
    var width = 450 - margin.left - margin.right;
    var height = 65 - margin.top - margin.bottom;

    var xDateFormatter = d3.time.format('%a');

    DayChart = function DayChart(elementId, accidents) {

        var vis = this;

        this.elementId = elementId;
        this.accidents = accidents;

        this.startDate = new Date(2014, 0, 5);
        this.endDate = new Date(2014, 0, 12, 0, 0, 0, -1);

        // Setup chart.
        this.svg = d3.select('#' + this.elementId).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom));

        this.title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('transform', 'translate(' + margin.left + ', 10)')
            .text('Day of Week');

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
            .ticks(d3.time.days)
            .innerTickSize(-height)
            .tickFormat(xDateFormatter);

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
                    var d0 = d3.time.day.round(extent0[ 0 ]);
                    var d1 = d3.time.day.offset(d0, Math.round((extent0[ 1 ] - extent0[ 0 ]) / 86400000));
                    extent1 = [ d0, d1 ];
                }
                // If resizing, round both dates.
                else {
                    extent1 = extent0.map(d3.time.day.round);
                }
                // Apply the new extent to the brush and clip path.
                d3.select(this)
                    .call(vis.brush.extent(extent1));
                d3.select('#' + vis.elementId + '-brush-clip rect')
                    .attr('x', vis.x(extent1[ 0 ]))
                    .attr('width', vis.x(extent1[ 1 ]) - vis.x(extent1[ 0 ]));
                // Apply the new extent to the crossfilter.
                vis.accidents.day.filterRange(extent1);
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
                    vis.accidents.day.filterAll();
                }
                // Issue an event informing all visualizations that the crossfilter has been updated.
                $.event.trigger({ type: 'accidents:crossfilter:update' });
            });

        var brushElement = this.chart.append('g')
            .attr('class', 'brush')
            .call(this.brush);
        brushElement.selectAll('rect')
                .attr('height', height);

        this.brushClip = this.chart.append('clipPath')
                .attr('id', this.elementId + '-brush-clip')
            .append('rect')
                .attr('width', width)
                .attr('height', height);

        // Draw axes and axis labels.
        this.xAxis_g = this.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', 'translate(0, ' + height + ')')
            .call(this.xAxis);
        // Center the day labels.
        var ticks = this.xAxis.scale().ticks(this.xAxis.ticks()[ 0 ]);
        var tickSize = this.x(ticks[ 1 ]) - this.x(ticks[ 0 ]);
        this.xAxis_g.selectAll('.tick text')
            .style('text-anchor', 'middle')
            .attr('x', tickSize / 2);

        this.yAxis_g = this.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', 'translate(0, 0)');

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            if (!config.dayRange) {
                vis.brush.clear();
            }
            else {
                vis.brush.extent(config.dayRange);
            }
            vis.brush.event(brushElement);
        });

        this.update();
    }
    DayChart.prototype = {

        /**
         * Updates the chart. This should be called any time data for the chart is updated.
         */
        update: function() {

            // Get the data from the crossfilter group.
            var data = this.accidents.days.all();

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

    //----------------------------------------------------------------------------------------------
    // HourChart
    //----------------------------------------------------------------------------------------------

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

        var brushElement = this.chart.append('g')
            .attr('class', 'brush')
            .call(this.brush);
        brushElement.selectAll('rect')
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

        // Event to set the crossfilter settings.
        $(document).on('accidents:crossfilter:set', function(e, config) {
            if (!config.hourRange) {
                vis.brush.clear();
            }
            else {
                vis.brush.extent(config.hourRange);
            }
            vis.brush.event(brushElement);
        });

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

    //----------------------------------------------------------------------------------------------
    // Stories
    //----------------------------------------------------------------------------------------------

    var Stories;

    (function() {

    Stories = function Stories(barElementId, contentElementId) {

        var feat = this;

        this.barElementId = barElementId;
        this.contentElementId = contentElementId;

        this._currentStory = null;

        var stories = [{
            config: {
                accidentTypes: [ 'Auto' ],
                mapView: 0
            },
            coordinates: [ [ -71.145674, 42.3752872 ], [ -71.119163, 42.375191 ], [ -71.094914, 42.360155 ] ],
            title: 'Dangerous Intersections',
            content: '<p>Some of the most dangerous areas in Cambridge (for cars) are the intersection of <strong>Brattle St & Aberdeen Ave</strong>, the <strong>Harvard Square area</strong>, and the intersection of <strong>Mass Ave & Vassar St</strong>.</p><p>Explore the weather conditions and see how the data points change depending on the weather.</p>'
        }, {
            config: {
                accidentTypes: [ 'Bicycle' ],
                mapView: 1
            },
            coordinates: [ [ -71.096440, 42.365583 ] ],
            title: 'Bikers Beware',
            content: '<p>There are a lot of bikers in Cambridge, and one of the most dangerous areas in Cambridge for bikers is the Mass Ave area heading down towards MIT, centered on <strong>The Port</strong>. Notice how accident counts go up during commute times.</p><p>Switch to the Accidents view and see how the bike accidents are distributed throughout the area.</p>'
        }, {
            config: {
                accidentTypes: [ 'Pedestrian' ],
                mapView: 0,
                weatherEvents: [ 'Fog', 'Rain', 'Thunderstorm', 'Snow', 'Hail' ]
            },
            coordinates: [ [ -71.119163, 42.375191 ], [ -71.104067, 42.365415 ] ],
            title: 'Inclement Walking Conditions',
            content: '<p>Being a pedestrian on the streets of Cambridge can be dangerous, as well. Walking around <strong>Harvard Square</strong> and <strong>Central Square</strong> in bad weather can be especially dangerous, especially in the middle of the week.</p>'
        }, {
            config: {
                accidentTypes: [ 'Pedestrian' ],
                mapView: 0,
                weatherEvents: [ 'None' ],
                monthRange: [ new Date(2014, 5, 1), new Date(2014, 8, 0, 0, 0, -1) ],
                hourRange: [ new Date(2014, 0, 1, 12), new Date(2014, 0, 1, 18) ]
            },
            coordinates: [ [ -71.119163, 42.375191 ] ],
            title: 'A Summer Afternoon Stroll',
            content: '<p>There aren\'t many pedestrian accidents during summer afternoons, and the ones that do occur happen around the typically dangerous areas, such as <strong>Harvard Square</strong>.</p>'
        }];

        // Setup bar element and label.
        this.barElement = d3.select('#' + this.barElementId);
        this.label = this.barElement.append('div')
            .attr('class', 'filter-label')
            .text('Highlights');

        // Setup story buttons.
        var ul = this.barElement.append('ul');
        var storyButtons = ul.selectAll('li')
            .data(stories);
        var listItems = storyButtons.enter().append('li')
            .attr('class', 'active')
            .attr('title', function(d) { return d.title; })
            .text(function(d, i) { return i + 1; })
            .on('click', function(d, i) {
                storyButtons.classed('selectedStory', false);
                this.classList.add('selectedStory');
                openStory(i);
            });
        var closeButton = ul.append('li')
            .attr('class', 'reset')
            .on('click', function() { closeStory(); });
        closeButton.append('i')
            .attr('class', 'fa fa-times');
        this.barElement.append('div')
            .attr('class', 'clearfix');

        // Setup content element.
        this.contentElement = d3.select('#' + this.contentElementId);

        // Function to open the story at the given index.
        function openStory(i) {

            var story = stories[ i ];
            var html = '<h3>' + story.title + '</h3>' + story.content;

            // Add the HTML to the element and show it.
            feat.contentElement.html(html);
            feat.contentElement.style('opacity', 1);

            // Set the crossfilter.
            $.event.trigger('accidents:crossfilter:set', story.config || {});

            // Mark areas on the map if necessary.
            visualizations.accidentMap.clearAreaMarkers();
            if (story.coordinates) {
                for (c of story.coordinates) {
                    visualizations.accidentMap.showAreaMarker(c);
                }
            }
        }

        // Function to close the story content area.
        function closeStory() {

            // Clear the HTML from the element and hide it.
            feat.contentElement.html('');
            feat.contentElement.style('opacity', 0);

            // Clear the crossfilter.
            $.event.trigger('accidents:crossfilter:set', {});

            // Clear the area markers on the map.
            visualizations.accidentMap.clearAreaMarkers();

            // Unstyle the story buttons.
            storyButtons.classed('selectedStory', false);
        }
    };

    })();

    // Call the initialization function by default for this module or call it from elsewhere, e.g.
    //      crashcaster.module_template_copy_me.init();
    init();

    // Public variables and methods we want to expose.  Just add the var or function reference here.
    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo,
        filters: filters,
        visualizations: visualizations,
        features: features
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;

})(crashcaster, $, queue, d3, crossfilter);
