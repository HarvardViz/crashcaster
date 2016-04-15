var AccidentTypeFilter;

(function() {

AccidentTypeFilter = function AccidentTypeFilter(elementId, accidents) {

    var fil = this;

    this.elementId = elementId;
    this.accidents = accidents;

    // Get all unique accient types from the data set.
    var accidentTypes = this.accidents.accidentTypes.all();

    // Initialize all accident types as selected.
    var _selected = {};
    for (var type of accidentTypes) {
        _selected[ type.key ] = true;
    }

    // Setup filter controls.
    this.element = d3.select('#' + this.elementId).append('ul');
    this.filterOptions = this.element.selectAll('li')
        .data(accidentTypes);
    var listItems = this.filterOptions.enter().append('li');
    listItems.append('input')
        .attr('type', 'checkbox')
        .attr('name', function(d) { return d.key; })
        .attr('checked', 'checked')
        .on('change', function() {
            _selected[ this.name ] = this.checked;
            console.log(_selected);
            fil.accidents.accidentType.filter(function(d) {
                return _selected[ d ];
            });
            $.event.trigger({ type: 'accidents:crossfilter:update' });
        });
    listItems.append('label')
        .attr('for', function(d) { return d.key; })
        .text(function(d) { return d.key; });
};

}());
