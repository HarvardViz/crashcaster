
var accidentData = [];
var filteredData = [];
var streetFilter;
var filteredObject= {};


// SVG drawing area
var margin = {top: 10, right: 10, bottom: 10, left: 10};

var width = 400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var svg = d3.select("#linemap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    /*
    .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height)
        .attr("stroke-width", 3)
        .attr("stroke", "black");
*/

// Scale - line position
var y = d3.scale.linear()
    .range([0, height]);

// Scale - circle radius
var r = d3.scale.linear()
    .range([1, 10]);





var	parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

//  html listbox
var list = d3.select("#list").append("select");



// Start application by loading the data
loadData();

function loadData() {
    d3.json("data/cambridge_accidents_2010-2014.json", function(error, jsonData){
        if(!error){
            accidentData = jsonData;

            accidentData.forEach(function(d) {
                d.date = parseDate(d.date);         // extract date from string
            });

            console.log(accidentData);

            wrangleData();
        }
    });
  }


function wrangleData(){

    var intersectionData = {};

    // create nested array with totals of accidents by streetName
    accidentDataNested = d3.nest()
        .key(function(d) { return d.streetName; })  // main key
        .key(function(d) { return d.crossStreet; }) // secondary key
        //.rollup(function(d) { return d.length; })
        .entries(accidentData);


    // add total number of intersections to each street entry
    /* add distance to reference coordinates for each intersection
           for calculating order of intersections on street
     */
    accidentDataNested.forEach(function(d) {
        d.numIntersections = d.values.length;

        d.values.forEach(function(v) {
            if ((d.key == "null") || (v.key == "null"))
                v.distance = null;
            else
                v.distance = calculateDistance(v.values[0].coordinates);
        });

        d.values.sort(function(a, b) {
            return b.distance - a.distance;
        })
    });

    // sort array by streets with the most intersections
    accidentDataNested.sort(function(a, b) {
        return b.numIntersections - a.numIntersections;
    });

    console.log(accidentDataNested);


    filteredData = accidentDataNested.filter(function(d) {
        return ((d.numIntersections >=5) && (d.key != "null"));
    });

    console.log(filteredData);


    // populate HTML listbox
    list.selectAll("option")
        .data(filteredData)
        .enter()
        .append("option")
        .attr("value", function(d) {return d.key;})
        .text(function(d) {
            return d.key; });


    updateVis();
}



function updateVis() {

    console.log(filteredObject);

    filteredObject.values = filteredObject.values.filter(function(d){
        return (d.key != "null");
    });

    // Data-join
    var linemap = svg.selectAll("circle")
        .data(filteredObject.values);

    // update scale range
    y.domain([0, filteredObject.numIntersections]);


    // Enter
    linemap.enter()
        .append("circle")
        .attr("class", "circle")
        .attr("r", function(d) { console.log("length: " + d.values.length); return 2; })
        .attr("cx", 0)
        .attr("cy", function(d, i) { console.log(y(i)); return y(i); })
        .style("fill", "red");


    // Exit
    linemap.exit().remove();


    getUserInput();

}






function calculateDistance(point) {


    var p1 = new LatLon(42.444757, -71.177811); // reference point NW of Cambridge, MA.
    var p2 = new LatLon(point[0], point[1]);
    var d = p1.distanceTo(p2);

    return d;
}





function getUserInput(){

    var tempArray = [];

    // filter event listener starts callback function
    list.on("change", function(){
        // set global filter var
        streetFilter = list.property("value");

        tempArray = filteredData.filter(function(d) {
            return d.key == streetFilter;
        });

        filteredObject = tempArray[0];

        updateVis();

    });
}

