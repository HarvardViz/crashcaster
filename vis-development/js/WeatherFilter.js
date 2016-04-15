var WeatherFilter;

(function() {

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

    // Setup filter controls.
    this.element = d3.select('#' + this.elementId).append('ul');
    this.filterOptions = this.element.selectAll('li')
        .data(weatherEvents);
    var listItems = this.filterOptions.enter().append('li');
    listItems.append('input')
        .attr('type', 'checkbox')
        .attr('name', function(d) { return d; })
        .attr('checked', 'checked')
        .on('change', function() {
            _selected[ this.name ] = this.checked;
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
    listItems.append('label')
        .attr('for', function(d) { return d; })
        .text(function(d) { return d; });
};

}());
