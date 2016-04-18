


/*	TO DOs
	-- ---
	
	Use actual distances for line positioning
	Find a fix for ordering issue for windy roads.
	Enable click on forcegraph node to update linemap

*/



var accidentData = [];
var filteredData = [];
var streetFilter = "Massachusetts Ave";
var filteredObject = {};

var streetLinks = [];
var streetNodes = [];


/* linemap definitions */

// SVG drawing area - linemap
var margin = {top: 30, right: 100, bottom: 30, left: 100};

var width = 1000 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;


var svg = d3.select("#linemap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// street line where circles are placed for intersections
var line = svg.append("line")
	.attr("class", "linemap-line");


// add chart title
var title = svg.append("text")
	.text(streetFilter + " Intersections (Rollover circles for more detail. Click for street views)")
	.attr("transform", "translate(" + 0 + ", " + height + ")")
	.style("text-anchor", "left");

// add directionals
svg.append("text")
	.text("Westbound")
	.attr("x", 0-margin.left/2)
	.attr("y", 4)
	//.attr("transform", "translate(" + (0-margin.left/2) + ", " + 0 + ")")
	.style("text-anchor", "middle")
	.style("vertical-align", "middle");

// add directionals
svg.append("text")
	.text("Eastbound")
	.attr("x", width+margin.right/2)
	.attr("y", 4)
	//.attr("transform", "translate(" + (0-margin.left/2) + ", " + 0 + ")")
	.style("text-anchor", "middle")
	.style("vertical-align", "middle");


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


//  html streetview image
var streetImage2 = d3.selectAll("#streetview")
	.append("svg")
		.attr("width", 600)
		.attr("height", 200)
		.append("image")
			.attr("width", 600)
			.attr("height", 200);


/* Initialize tooltip */
var linemapTip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-10, 0])
	.html(function(d) { return d.key + "<br>Accidents: " + d.values.length; });


/* force graph definitions */


// SVG drawing area - forcegraph
var marginForce = {top: 20, right: 20, bottom: 20, left: 20};

var widthForce = 600 - marginForce.left - marginForce.right,
	heightForce = 400 - marginForce.top - marginForce.bottom;

var svgForce = d3.select("#forcegraph").append("svg")
	.attr("width", widthForce + marginForce.left + marginForce.right)
	.attr("height", heightForce + marginForce.top + marginForce.bottom)
	.append("g")
	.attr("transform", "translate(" + marginForce.left + "," + marginForce.top + ")");


	
// define force layout attributes
var force = d3.layout.force()
	.size([widthForce, heightForce])
	.charge(-1000)
	.gravity(.3)
	.linkDistance(50);

/* Initialize tooltip */
var forceTip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-10, 0])
	.html(function(d) { return d.key + "<br>" + d.numIntersections + " Intersections<br>" + d.totalAccidents + " Accidents"; });


// not needed here??
var	parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;


	 
	 
	 
 /*	---
	Load Data
	---
*/

	 
	 
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


  
  
 /*	---
	Vis functions
	---
*/

function wrangleData(){

    // create nested array with totals of accidents by streetName
    accidentDataNested = d3.nest()
        .key(function(d) { return d.streetName; })  // main key
        .key(function(d) { return d.crossStreet; }) // secondary key
        //.rollup(function(d) { return d.length; })
        .entries(accidentData);


    // add summary data to each street entry
    accidentDataNested.forEach(function(d, i) {
		d.numIntersections = d.values.length;
		d.totalDistance = 0;
		d.totalAccidents = 0;

		var lastCoordinates = [];

		// for each cross street, calculate intersection values
        d.values.forEach(function(v, i) {
            if ((d.key == "null") || (v.key == "null"))	 // if no cross street (accidents on single road)
                v.distance = null;
            else {
                v.coordinates = v.values[0].coordinates;
                v.distanceFromReference = calculateDistance(v.coordinates);
				d.totalAccidents += v.values.length;
			
				if (i == 0)  
					lastCoordinates = v.coordinates; 
				else {
					//console.log(calculateDistance(v.coordinates, lastCoordinates));
					d.totalDistance += calculateDistance(v.coordinates, lastCoordinates);
				}
			}

		});


		// sort by distance to reference to represent order of intersections along road
        d.values.sort(function(a, b) {
            return b.distanceFromReference - a.distanceFromReference;
			//return a.coordinates[0] - b.coordinates[0];
		})
    });

    // sort array by streets with the most accidents
    accidentDataNested.sort(function(a, b) {
        return b.totalAccidents - a.totalAccidents;
    });


	// filter out small roads and accidents that did not occur at intersections
	var minIntersections = 10;
    filteredAccidentData = accidentDataNested.filter(function(d) {
        return ((d.numIntersections >= minIntersections) && (d.key != "null"));
    });


	
	// set up edge array for force graph - establish links
	for (var i=0; i<filteredAccidentData.length; i++) {
		for (var j = 0; j < filteredAccidentData[i].values.length; j++) {
			for (var k = 0; k < filteredAccidentData.length; k++) {
				if (filteredAccidentData[i].values[j].key == filteredAccidentData[k].key) {
					var temp = {};
					temp["source"] = i;
					temp["sourceName"] = filteredAccidentData[i].key;
					temp["target"] = k;
					temp["targetName"] = filteredAccidentData[k].key;
					streetLinks.push(temp);
				}
			}
		}
	}

	// save date to nodes Array for force graph
	streetNodes = filteredAccidentData;

	console.log("wrangleData() - streetLinks");
	console.log(streetLinks);

	console.log("wrangleData() - streetNodes");
	console.log(streetNodes);

	/*
	// populate HTML listbox
    list.selectAll("option")
        .data(filteredAccidentData)
        .enter()
        .append("option")
        .attr("value", function(d) {return d.key;})
        .text(function(d) {
            return d.key; });
	*/

    filterData();

	updateLineMap();
	updateForceGraph();
}




function filterData() {
	
    console.log("filterData() - streetFilter");
	console.log(streetFilter);
	
    var tempArray = [];
	
	// filter out selected road data
	tempArray = filteredAccidentData.filter(function(d) {
		return d.key == streetFilter;
	});

	filteredObject = tempArray[0];  //  Array.filter returns an array.  Save it into an object

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
	
	
    console.log("filterData() - filteredObject");
    console.log(filteredObject);

}



function updateLineMap() {
	
	
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
		
	// Scale - circle radius   --- discontinued ---
	var r = d3.scale.linear()
		.range([2, 9])
	//	.domain([0, d3.max(filteredObject.values, function(d) { return d.values.length; }) ]);
		.domain([0, 25]);
		
	// Scale - circle color
	var c = d3.scale.linear()
		.range(["#fee0d2", "#a50f15"])
		.domain([0, d3.max(filteredObject.values, function(d) { return d.values.length; }) ]);
		//.domain([0, 47]);	// highest accident total = 47.  Mass Ave-Vassar 	
	

	// invoke tooltips
	svg.call(linemapTip);
	

	// draw street line
	line
		.attr("x1", 0)
        .attr("y1", 0)
        //.attr("x2", l(filteredObject.numIntersections))
        .attr("x2", width+10)
        .attr("y2", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "gray");
	
	
    // Enter - add circle elements
    linemap.enter()
        .append("circle")
        .attr("class", "linemap-circle")
		.on("click", function(d) {
			$("#streetview-title").text("Street views of the intersection of " + streetFilter + " and " + d.key)
			showStreetView(d.coordinates);
		})
		.on("mouseover", linemapTip.show)
		.on("mouseout", linemapTip.hide);

	// Update circle colors and defaults
	linemap				
		.style("fill", function(d) { return c(d.values.length); })
        .attr("cy", 0)
        .attr("cx", 0)
        .attr("r", 7);			

	// Position circles along ling
	linemap			
		.transition().duration(300)
        .attr("cx", function(d, i) { return 10 + x(i); });

	// update chart title
	title.text(streetFilter + "'s main intersections (Rollover circles for more detail. Click for street views)");

	// Exit
    linemap.exit().remove();

    getUserInput();
}




function updateForceGraph() {

	$("#forcegraph-title").text("Cambridge's main road connections - select a circle node below to update the linemap above");

	// Scale - circle color - based on # accidents
	var c = d3.scale.linear()
		.range(["#fee0d2", "#a50f15"])
		.domain([0, d3.max(streetNodes, function(d) { return d.totalAccidents; }) ]);

	// Scale - circle radius - based on # intersections
	var r = d3.scale.linear()
		.range([3,30])
		.domain([0, d3.max(streetNodes, function(d) { return d.numIntersections; }) ]);

	// invoke tooltips
	svg.call(forceTip);


	// function to allow manual repositioning of nodes
	var drag = force.drag()
		.on("dragstart", dragstart);


	// start force layout simulation
	force
		.nodes(streetNodes)
		.links(streetLinks)
		.on("tick", tick)
		.start();

	// add force edges to SVG
	var edges = svgForce.selectAll("line")
		.data(streetLinks)
		.enter()
		.append("line")
		.style("stroke", "#ccc")
		.style("stroke-width", 1);

	// add force nodes to SVG
	var nodes = svgForce.selectAll("circle")
		.data(streetNodes)
		.enter()
		.append("circle")
		.call(drag)
		.attr("r", function(d) { return r(d.numIntersections); })
		.style("fill", function(d){ return c(d.totalAccidents); })
		.on("dblclick", dblclick)
		.on("mouseover",function(d){
			forceTip.show(d);
			d3.select(this)
				.style("stroke","black")
				.style("stroke-width", "3px");
		})
		.on("mouseout",function(d){
			forceTip.hide(d);
			d3.select(this)
				.style("stroke-width", "0px");
		});


function mouseover(){
	forceTip.show();

}
		
	// define ticks
	function tick() {
		edges.attr("x1", function(d) { return d.source.x; })
			 .attr("y1", function(d) { return d.source.y; })
			 .attr("x2", function(d) { return d.target.x; })
			 .attr("y2", function(d) { return d.target.y; });
		nodes.attr("cx", function(d) { return d.x; })
			 .attr("cy", function(d) { return d.y; });
	}

			

	// release fixed node position
	function dblclick(d) {
		d3.select(this).classed("fixed", d.fixed = false);
	}

	// set fixed node position
	function dragstart(d) {
		d3.select(this).classed("fixed", d.fixed = true);
	}

	getUserInput();

}







/*	---
	support functions
	---
*/



function getUserInput(){

    // get dropdown menu selection
    list.on("change", function(){
        // set global filter var
        streetFilter = list.property("value");
        filterData();
		updateLineMap();
    });
	
	// on force node click, update linemap
	d3.select("#forcegraph").selectAll("circle").on("click", function(d){
		streetFilter = d.key;
		filterData();
		updateLineMap();
	});
	
/*
	// force node mouseover - show tooltip
	d3.select("#forcegraph").selectAll("circle").on("mouseover", function(d){
		d3.select(this)
			.style("stroke", "black")
			.style("stroke-width", "3px");
	});

	// force node mouseout - hide tooltip	
	d3.select("#forcegraph").selectAll("circle").on("mouseout", function(d){
		d3.select(this).style("stroke-width", "0px");
	});
*/


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
		fov: 180,
		pitch: -10
	};
	
	var api = "AIzaSyD1TPo243iFhDbg5nJswY7cZb8KL9KpD4E";
		
	var url = "https://maps.googleapis.com/maps/api/streetview?size=600x200&location=" + 
	coords[1] + "," + coords[0] + 
	"&fov=" + parameters.fov +
	"&heading=" + parameters.heading + 
	"&pitch=" + parameters.pitch + 
	"&key=" + api; 
		
	var url2 = "https://maps.googleapis.com/maps/api/streetview?size=600x200&location=" + 
	coords[1] + "," + coords[0] + 
	"&fov=" + parameters.fov +
	"&heading=" + parameters.heading+180 + 
	"&pitch=" + parameters.pitch + 
	"&key=" + api; 
	
	
	// populate streetview image
    streetImage
        .attr("xlink:href", url);

	// populate streetview image
    streetImage2
        .attr("xlink:href", url2);
		
	console.log(url);
		
}


