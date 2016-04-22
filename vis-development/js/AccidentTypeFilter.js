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
};

}());
