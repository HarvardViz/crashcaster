
var accidentData = [];
var filteredData = [];
var streetFilter = "Massachusetts Ave";
var filteredObject= {};


// SVG drawing area
var margin = {top: 30, right: 30, bottom: 30, left: 30};

var width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var svg = d3.select("#linemap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var line = svg.append("line")
	.attr("class", "line");


var	parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

//  html listbox
var list = d3.select("#list").append("select");



/* Initialize tooltip */
var tip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-15, 0])
	.html(function(d) { return d.key + "<br>Accidents: " + d.values.length; });
 
	 
	 
	 
	 
	 

// Start application by loading the data
loadData();

function loadData() {
    d3.json("data/cambridge_accidents_2010-2014.json", function(error, jsonData){
        if(!error){
            accidentData = jsonData;

            accidentData.forEach(function(d) {
                d.date = parseDate(d.date);         // extract date from string
            });

	    console.log("loadData() - accidentData");
            console.log(accidentData);

            wrangleData();
        }
    });
  }


function wrangleData(){

    console.log("wrangleData() - accidentData");
    console.log(accidentData);
    
    // create nested array with totals of accidents by streetName
    var accidentDataNested = d3.nest()
        .key(function(d) { return d.streetName; })  // main key
        .key(function(d) { return d.crossStreet; }) // secondary key
        //.rollup(function(d) { return d.length; })
        .entries(accidentData);


    console.log("wrangleData() - accidentDataNested");
    console.log(accidentDataNested);
    
    
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
    
    
    console.log("wrangleData() - accidentDataNested");
    console.log(accidentDataNested);
    

    // sort array by streets with the most intersections
    accidentDataNested.sort(function(a, b) {
        return b.numIntersections - a.numIntersections;
    });

    console.log("wrangleData() - accidentDataNested");
    console.log(accidentDataNested);

	// filter out small roads and accidents that did not occur at intersections
    filteredData = accidentDataNested.filter(function(d) {
        return ((d.numIntersections >=10) && (d.key != "null"));
    });
	
    console.log("wrangleData() - filteredData");
    console.log(filteredData);


    // populate HTML listbox
    list.selectAll("option")
        .data(filteredData)
        .enter()
        .append("option")
        .attr("value", function(d) {return d.key;})
        .text(function(d) {
            return d.key; });

    filterData();
}



function getUserInput(){

    // filter event listener starts callback function
    list.on("change", function(){
        // set global filter var
        streetFilter = list.property("value");

        filterData();
    });
}


function filterData() {
	
    console.log("filterData() - streetFilter");
	console.log(streetFilter);
	
    console.log("filterData() - filteredObject");
    console.log(filteredObject);
	
    var tempArray = [];

	tempArray = filteredData.filter(function(d) {
		return d.key == streetFilter;
	});

	filteredObject = tempArray[0];

	// filter out accidents that did not occur at intersections
    filteredObject.values = filteredObject.values.filter(function(d){
        return (d.key != "null");
    });
	
	// filter out intersections with low number of accidents on big roads
    if (filteredObject.numIntersections >50)
		filteredObject.values = filteredObject.values.filter(function(d){
			return (d.values.length >=  5);
		});
	
	// recalculate numIntersections
    filteredObject.numIntersections = filteredObject.values.length;
	
	
    console.log("filterData() - filteredObject (after more filters)");
    console.log(filteredObject);
	
	updateVis();

}



function updateVis() {
	
    // Data-join
    var linemap = svg.selectAll("circle")
        .data(filteredObject.values);

    // define scales

	/*
	// Scale - line length
	var l = d3.scale.linear()
		.range([100, width])
		.domain([1, 150]);
	*/

		
	// Scale - circle position along line
	var x = d3.scale.linear()
		.range([0, width])
		.domain([0, filteredObject.numIntersections]);
		
	// Scale - circle radius
	var r = d3.scale.linear()
		.range([2, 9])
	//	.domain([0, d3.max(filteredObject.values, function(d) { return d.values.length; }) ]);
		.domain([0, 25]);
		

	
//	r.domain([0, d3.max(filteredObject.values, function(d) { return d.values.length; }) ]);
	r.domain([0, 25]);
	
	// invoke tooltips
	svg.call(tip);
	

	// draw street line
	line
		.attr("x1", 0)
        .attr("y1", 0)
        //.attr("x2", l(filteredObject.numIntersections))
        .attr("x2", width)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "gray");
	
	
    // Enter
    linemap.enter()
        .append("circle")
        .attr("class", "circle")
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);

		
	// Update
	linemap				
        .attr("r", function(d, i) { 
			//console.log("length: " + d.values.length); 
			return r(d.values.length);
		})
        .attr("cy", 0)
        .attr("cx", function(d, i) { return x(i); })		
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





