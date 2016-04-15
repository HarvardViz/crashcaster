
var accidentData = [];
var filteredData = [];
var streetFilter = "Massachusetts Ave";
var filteredObject= {};


// SVG drawing area
var margin = {top: 30, right: 30, bottom: 30, left: 30};

var width = 900 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;


var svg = d3.select("#linemap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
var line = svg.append("line")
	.attr("class", "line");


//  html listbox
var list = d3.select("#list").append("select");

//  html streetview image
var streetImage = d3.selectAll("#streetview")
	.append("svg")
		.attr("width", 600)
		.attr("height", 200)
		.append("image")
			.attr("width", 600)
			.attr("height", 200);
	

	
/* Initialize tooltip */
var tip = d3.tip()
	.attr("class", "d3-tip")
	//.offset([0, 0])
	.html(function(d) { return d.key + "<br>Accidents: " + d.values.length; });
 
 
	 
var	parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

	 
	 

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

		d.totalDistance = 0;
		d.totalAccidents = 0;
		var lastCoordinates = [];
		
        d.values.forEach(function(v, i) {
            if ((d.key == "null") || (v.key == "null"))
                v.distance = null;
            else {
                v.coordinates = v.values[0].coordinates;
                v.distanceFromReference = calculateDistance(v.coordinates);
				d.totalAccidents += v.values.length;
			
				if (i == 0)  
					lastCoordinates = v.coordinates; 
				else {
					console.log(calculateDistance(v.coordinates, lastCoordinates));
					d.totalDistance += calculateDistance(v.coordinates, lastCoordinates);
				}
			}

		});

		// sort by distance to reference to represent order of intersections along road
        d.values.sort(function(a, b) {
            return b.distanceFromReference - a.distanceFromReference;
        })
    });

    // sort array by streets with the most accidents
    accidentDataNested.sort(function(a, b) {
        return b.totalAccidents - a.totalAccidents;
    });

    console.log("wrangleData() - accidentDataNested");
    console.log(accidentDataNested);

	
	// filter out small roads and accidents that did not occur at intersections
    filteredData = accidentDataNested.filter(function(d) {
        return ((d.numIntersections >=10) && (d.key != "null"));
    });
	
	
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
		
	// Scale - circle color
	var c = d3.scale.linear()
		.range(["#fee0d2", "#a50f15"])
		.domain([0, d3.max(filteredObject.values, function(d) { return d.values.length; }) ]);
				
		
	
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
		.on("click", function(d) { showStreetView(d.coordinates); })
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);

/*
	// Update
	linemap				
		.style("fill", "red")
        .attr("cy", 0)
        .attr("cx", 0);		
				
				
	// Update
	linemap			
		.transition().duration(300)
        .attr("cx", function(d, i) { return x(i); })
        .attr("r", function(d, i) { 
			//console.log("length: " + d.values.length); 
			return r(d.values.length);
		});
		
*/


	// Update
	linemap				
		.style("fill", function(d) { return c(d.values.length); })
        .attr("cy", 0)
        .attr("cx", 0)
        .attr("r", 7);			
				
				
	// Update
	linemap			
		.transition().duration(300)
        .attr("cx", function(d, i) { return x(i); });
		

    // Exit
    linemap.exit().remove();


    getUserInput();

}






function calculateDistance(point1, point2) {

	var referenceCoordinates = [42.444757, -71.177811];
	
	if (typeof point2 === 'undefined') { point2 = referenceCoordinates; }
	
    var p1 = new LatLon(point1[0], point1[1]);
    var p2 = new LatLon(point2[0], point2[1]);
	
    var d = p1.distanceTo(p2);

    return d;
}


function showStreetView(coords) {
	
	console.log("streetview");
	console.log(coords);
	
	var parameters = {
		width: 600,
		height: 200,
		heading: 0,
		fov: 90,
		pitch: -10
	};
	
	var api = "AIzaSyD1TPo243iFhDbg5nJswY7cZb8KL9KpD4E";
		
	var url = "https://maps.googleapis.com/maps/api/streetview?size=600x200&location=" + 
	coords[1] + "," + coords[0] + 
	"&fov=" + parameters.fov +
	"&heading=" + parameters.heading + 
	"&pitch=" + parameters.pitch + 
	"&key=" + api; 
		
	// populate streetview image
    streetImage
        .attr("xlink:href", url);

	console.log(url);
		
}

