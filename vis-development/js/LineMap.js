


/*	TO DOs
	-- ---
	
	Use actual distances for line positioning
	Find a fix for ordering issue for windy roads.

*/



var accidentData = [];
var filteredData = [];
var streetFilter = "Massachusetts Ave";
var filteredObject = {};

var streetLinks = [];
var streetNodes = [];


/* linemap definitions */

// SVG drawing area - linemap
var marginLinemap = {top: 30, right: 100, bottom: 30, left: 100};

var widthLinemap = 1000 - marginLinemap.left - marginLinemap.right,
    heightLinemap = 100 - marginLinemap.top - marginLinemap.bottom;


var svgLinemap = d3.select("#linemap").append("svg")
    .attr("width", widthLinemap + marginLinemap.left + marginLinemap.right)
    .attr("height", heightLinemap + marginLinemap.top + marginLinemap.bottom)
    .append("g")
    .attr("transform", "translate(" + marginLinemap.left + "," + marginLinemap.top + ")");


// street line where circles are placed for intersections
var line = svgLinemap.append("line")
	.attr("class", "linemap-line");


// add chart title
var titleLinemap = svgLinemap.append("text")
	.text(streetFilter + " Intersections (Rollover circles for more detail. Click for street views)")
	.attr("transform", "translate(" + 0 + ", " + heightLinemap + ")")
	.style("text-anchor", "left");

// add directionals
svgLinemap.append("text")
	.text("Westbound")
	.attr("x", 0 - marginLinemap.left/2)
	.attr("y", 4)
	//.attr("transform", "translate(" + (0-margin.left/2) + ", " + 0 + ")")
	.style("text-anchor", "middle")
	.style("vertical-align", "middle");

// add directionals
svgLinemap.append("text")
	.text("Eastbound")
	.attr("x", widthLinemap + marginLinemap.right/2)
	.attr("y", 4)
	//.attr("transform", "translate(" + (0-margin.left/2) + ", " + 0 + ")")
	.style("text-anchor", "middle")
	.style("vertical-align", "middle");




/*  Street Views */


var widthStreetImage = 400;
var heightStreetImage = 125;


//  html streetview image
var streetImage = d3.selectAll("#streetview")
	.append("svg")
		.attr("width", widthStreetImage)
		.attr("height", heightStreetImage)
		.attr("transform", "translate(" + marginLinemap.left + ", " + 0 + ")")
		.append("image")
			.attr("width", widthStreetImage)
			.attr("height", heightStreetImage);


//  html streetview image
var streetImage2 = d3.selectAll("#streetview")
	.append("svg")
		.attr("width", widthStreetImage)
		.attr("height", heightStreetImage)
		.attr("transform", "translate(" + marginLinemap.left +  widthStreetImage + ", " + 0 + ")")
		.append("image")
			.attr("width", widthStreetImage)
			.attr("height", heightStreetImage);


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
	.charge(-100)
	//.gravity(.3)
	.linkDistance(75);

/* Initialize tooltip */
var forceTip = d3.tip()
	.attr("class", "d3-tip")
	.offset([-10, 0])
	.html(function(d) { return d.key + "<br>" + d.numIntersections + " Intersections<br>" + d.totalAccidents + " Accidents"; });

	

	
	
	
/* barchart definitions */

// SVG drawing area - barchart
var marginBarchart = {top: 50, right: 30, bottom: 30, left: 150};

var widthBarChart = 500 - marginBarchart.left - marginBarchart.right,
    heightBarChart = 600 - marginBarchart.top - marginBarchart.bottom;

var svgBarChart = d3.select("#barchart").append("svg")
    .attr("width", widthBarChart + marginBarchart.left + marginBarchart.right)
    .attr("height", heightBarChart + marginBarchart.top + marginBarchart.bottom)
    .append("g")
    .attr("transform", "translate(" + marginBarchart.left + "," + marginBarchart.top + ")");


var xBar = d3.scale.linear()
	.range([0, widthBarChart]);
	
var xBarAxis = d3.svg.axis()
	.scale(xBar)
	.orient("top")
	.ticks(5);
	
var yBar = d3.scale.ordinal()
	.rangeRoundBands([0, heightBarChart], .4);

var yBarAxis = d3.svg.axis()
	.scale(yBar)
	.orient("left");
	
	
	
	
	
	

	
	 
	 
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

		    console.log("loadData() - accidentData");
            console.log(accidentData);

            wrangleData();
        }
    });
  }


  
  
 /*	---
	Data prep functions
	--- */

function wrangleData(){

    // create nested array with totals of accidents by streetName
    accidentDataNested = d3.nest()
        .key(function(d) { return d.streetName; })  // main key
        .key(function(d) { return d.crossStreet; }) // secondary key
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



	// filter out accidents that did not occur at intersections
    filteredAccidentData = accidentDataNested.filter(function(d) {
        return (d.key != "null");
    });


	// keep only the top 30 roads with the most accidents
	var sectionSize = 30;
	filteredAccidentData = accidentDataNested.slice(0, sectionSize);


	// set up edge array for force graph - establish links
	for (var i=0; i<filteredAccidentData.length; i++) {
		for (var j = 0; j < filteredAccidentData[i].values.length; j++) {
			for (var k = 0; k < filteredAccidentData.length; k++) {
				if (filteredAccidentData[i].values[j].key == filteredAccidentData[k].key) {
					var temp = {};
					//temp["source"] = i;
					temp["sourceName"] = filteredAccidentData[i].key;
					//temp["target"] = k;
					temp["targetName"] = filteredAccidentData[k].key;
					streetLinks.push(temp);
				}
			}
		}
	}

	// save date to nodes Array for force graph
	streetNodes = filteredAccidentData;

    filterLinemapData();

	initBarChart();
	updateLineMap();
	updateForceGraph();
}




function filterLinemapData() {
	
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

}





/*	---
	Vis functions
	--- */


function updateLineMap() {

    // Data-join
    var linemap = svgLinemap.selectAll("circle")
        .data(filteredObject.values);

    // define scales

	// Scale - circle position along line
	var x = d3.scale.linear()
		.range([0, widthLinemap])
		.domain([0, filteredObject.values.length]);
		
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
	svgLinemap.call(linemapTip);
	

	// draw street line
	line
		.attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", widthLinemap+10)
        .attr("y2", 0)
        .attr("linemap-stroke-width", 1)
        .attr("linemap-stroke", "#000");
	
	
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
	titleLinemap.text(streetFilter + "'s main intersections (Rollover circles for more detail. Click for street views)");

	// Exit
    linemap.exit().remove();

    getUserInput();
}




function updateForceGraph() {

	console.log("----------------updateForceGraph()-------------------");


	$("#forcegraph-title").text("Cambridge's main road connections - select a circle node below to update the linemap above");

	// Scale - circle color - based on # accidents
	var c = d3.scale.linear()
		.range(["#fee0d2", "#a50f15"])
		.domain([0, d3.max(streetNodes, function(d) { return d.totalAccidents; }) ]);

	// Scale - circle radius - based on # intersections
	var r = d3.scale.linear()
		.range([5,30])
		.domain([0, d3.max(streetNodes, function(d) { return d.numIntersections; }) ]);

	// Scale - circle radius - based on # intersections
	var w = d3.scale.linear()
		.range([1,5])
		.domain([0, d3.max(streetNodes, function(d) { return d.totalAccidents; }) ]);


	// invoke tooltips
	svgForce.call(forceTip);

	/*	--- PHASED OUT ----
	// function to allow manual repositioning of nodes
	var drag = force.drag()
		.on("dragstart", dragstart);
	*/

	// define place for graph elements corresponding only to selected street
	var filteredLinks = [];
	var filteredNodes = [];


	function mouseover(){
		forceTip.show();
	}

	start();

	function start() {

		// set array of links to streets that intersect to the selected street
		filteredLinks = streetLinks.filter(function (d) {
			return (d.sourceName == streetFilter);
		});

		// set array of nodes for streets that intersect to the selected street
		filteredNodes = streetNodes.filter(function (d) {
			var match = false;
			filteredLinks.forEach(function (s) {
				if ((d.key == s.sourceName) || (d.key == s.targetName)) match = true;
			});
			return match;
		});


		// set source/target index values to position in current filtered array
		filteredLinks.forEach(function (l) {
			l.source = searchArrayObjects(filteredNodes, "key", l.sourceName);
			l.target = searchArrayObjects(filteredNodes, "key", l.targetName);

			function searchArrayObjects(array, attr, value) { 	// find matching value, return array index
				for (var i = 0; i < array.length; i += 1) {
					if (array[i][attr] == value) { return i; 	}
				}
			}
		});

		// filter out any links to streets which have been previously filtered out (too few accidents)
		filteredLinks.filter(function (d) {
			return (typeof d.target === "number");
		});


		// define force layout
		force
			.links(filteredLinks)
			.nodes(filteredNodes)
			.on("tick", tick);


		// define updated link list for selected street/node
		var link_update = svgForce.selectAll(".force-link")
			.data(force.links(),
				function (d) {
					return (d.source + "-" + d.target);
				}
			);

		// define new link properties for selected street/node
		link_update.enter()
			.insert("line")
			.attr("class", "force-link")
			.style("stroke", "#888")
			.style("stroke-width", 1);


		link_update.exit()
			.remove();

		// define updated node list
		var node_update = svgForce.selectAll(".force-node")
			.data(force.nodes(),
				function (d) {
					return d.key;
				}
			);

		// update node attributes for new circles
		node_update.enter()
			.append("circle")
			.attr("class", "force-node")
			//.call(drag)
			.transition().duration(1000).attr("r", function (d) {
				return r(d.numIntersections);
			});

		node_update
			.style("fill", function (d) {
				return c(d.totalAccidents);
			})
			.on("click", click)
			//.on("dblclick", dblclick)
			.on("mouseover", function (d) {
				forceTip.show(d);
				d3.select(this)
					.style("stroke", "black")
					.style("stroke-width", "3px");
			})
			.on("mouseout", function (d) {
				forceTip.hide(d);
				d3.select(this)
					.style("stroke-width", "0px");
			});
/*
		node_update.enter()
			.append("text")
			.attr("class", "force-text")
			.text(function(d){ return d.key; })
			.attr("x", function(d) {
				if (d.x < widthForce) {
					return d.x - 10;
				} else return d.x + 10;
			})
			.attr("y", function(d) {
				if (d.y < heightForce) {
					return d.y - 10;
				} else return d.y + 10;
			});
			*/


		// remove old nodes
		node_update.exit()
			.remove();

		force.start();


		//	 fast forward through force sim so positions appear fixed
		//runThroughTicks();
		function runThroughTicks() {
			var n = 100;
			for (var i = n * n; i > 0; --i) force.tick();
		}


	}


	// define ticks
	function tick() {
		svgForce.selectAll(".force-link")
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });


		svgForce.selectAll(".force-node")
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
/*
		svgForce.selectAll(".force-text")
			.attr("x", function(d) {
				if (d.x < widthForce)
					return d.x - 10;
				else return d.x + 10;
			})
			.attr("y", function(d) {

				console.log(d.y);
				if (d.y < heightForce)
					return d.y - 10;
				else return d.y + 10;
			});
*/
	}


	function click(d) {
		streetFilter = d.key;
		//d3.select(this).classed("fixed", d.fixed = true);
		updateForceGraph();
	}


	/*   --- PHASED OUT -----
	// release fixed node position
	function dblclick(d) {
		d3.select(this).classed("fixed", d.fixed = false);
	}

	// set fixed node position
	function dragstart(d) {
		d3.select(this).classed("fixed", d.fixed = true);
	}
	*/


	getUserInput();



}



function initBarChart(){
	
	console.log("initBarChart() - filteredAccidentData");
	console.log(filteredAccidentData);
	
	
	xBar.domain([0, d3.max(filteredAccidentData, function(d) { return d.totalAccidents; })]);
	yBar.domain(filteredAccidentData.map(function(d) { return d.key; }));
	
	
	svgBarChart.append("g")
		.attr("class", "barchart-xAxis")
		.call(xBarAxis);
		
	svgBarChart.append("g")
		.attr("class", "barchart-yAxis")
		.call(yBarAxis);
	
	svgBarChart.selectAll(".barchart-bar")
		.data(filteredAccidentData)
		.enter()
		.append("rect")
			.attr("class", "barchart-bar")
			.attr("x", 0)
			.attr("width", function(d) { return xBar(d.totalAccidents); })
			.attr("y", function(d) { return yBar(d.key); })
			.attr("height", yBar.rangeBand());
		

	
}








/*	---
	support functions
	--- */



function getUserInput(){

/*
	// on force node click, update linemap
	d3.select("#forcegraph").selectAll("circle").on("click", function(d){
		streetFilter = d.key;
	 	filterLinemapData();
		updateLineMap();
	});
*/
	// on barchart bar click, update linemap
	d3.select("#barchart").selectAll("rect").on("click", function(d){
		streetFilter = d.key;
		filterLinemapData();
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
		width: widthStreetImage,
		height: heightStreetImage,
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


