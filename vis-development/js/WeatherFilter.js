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
};

}());
