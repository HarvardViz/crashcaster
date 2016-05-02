crashcaster.forcegraph = (function (cc$, $, d3) {

    var plugin_name = "crashcaster.forcegraph";
    var plugin_version = "0.0.1";
    var READY_STATE = { _current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2 };


    // ANYTHING that needs happen when this plugin/module is initialized
    function init() {
        echo("initialize crashcaster.forcegraph");
        // Start application by loading the data
        loadData();

    }

    // Once the module is ready via init(), anything that needs to be run here
    function run() {
        echo("running crashcaster.forcegraph");
    }

    // Public method: A simple example function, exposed as a public method in the var my = {} object at the bottom
    function echo(v) {
        console.log(v);
    };


    /* MAIN CODE
     *********************************/

    var accidentData = [];
    var filteredData = [];
    var streetFilter = "Massachusetts Ave";
    var filteredObject = {};

    var streetLinks = [];
    var streetNodes = [];


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
        .charge(-450)
        //.gravity(.3)
        .linkDistance(100);




    /*  Street Views */


    var widthStreetImage = 450;
    var heightStreetImage = 150;




    //  html streetview image
    var streetImage1 = d3.selectAll("#streetview1")
        .append("svg")
        .attr("width", widthStreetImage)
        .attr("height", heightStreetImage*2)
        .append("image")
        .attr("width", widthStreetImage)
        .attr("height", heightStreetImage*2);


    //  html streetview image
    var streetImage2 = d3.selectAll("#streetview2")
        .append("svg")
        .attr("width", widthStreetImage)
        .attr("height", heightStreetImage)
        .append("image")
        .attr("width", widthStreetImage)
        .attr("height", heightStreetImage);
    


    /*	---
     Load Data
     ---
     */





    function loadData() {
        d3.json("data/cambridge_accidents_2010-2014.json", function(error, jsonData){
            if(!error){
                accidentData = jsonData;

                //console.log("loadData() - accidentData");
                //console.log(accidentData);

                wrangleData();
            }

            READY_STATE._current = READY_STATE.LOADED;
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
            d.totalAccidents = 0;

            // for each cross street, calculate intersection values
            d.values.forEach(function(v, i) {
                d.totalAccidents += v.values.length;
            });
        });

        // sort array by streets with the most accidents
        accidentDataNested.sort(function(a, b) {
            return b.totalAccidents - a.totalAccidents;
        });


        // filter out accidents that did not occur at intersections
        var filteredAccidentData = accidentDataNested.filter(function(d) {
            return (d.key != "null");
        });
        //console.log(filteredAccidentData);

        // filter out White St due to encoding error in the raw dataset
        var filteredAccidentData = filteredAccidentData.filter(function(d) {
            return (d.key != "White St");
        });

        // keep only the top 30 roads with the most accidents
        var sectionSize = 30;
        filteredAccidentData = filteredAccidentData.slice(0, sectionSize);


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

        // save data to nodes Array for force graph
        streetNodes = filteredAccidentData;

        updateForceGraph();
    }




    /*	---
     Vis functions
     --- */




    function updateForceGraph() {


        // populate streetview image
        streetImage1
            .attr("xlink:href", "img/harvardsquare.JPG")
            .attr("width", widthStreetImage)
            .attr("height", heightStreetImage*2);

        $("#forcegraph-title").text("Currently on " + streetFilter.toUpperCase() + " : " + streetNodes[0].totalAccidents + " total accidents");

        // define place for graph elements corresponding only to selected street
        var filteredLinks = [];
        var filteredNodes = [];


        // ---  function to add/update/remove nodes from graph whenever a new node is selected
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

            // Scale - circle radius - based on # accidents
            var r = d3.scale.linear()
                .range([10, 60])
                .domain([0, d3.max(streetNodes, function (d) {
                    return d.totalAccidents;
                })]);

            // set source/target index values to position in current filtered array
            filteredLinks.forEach(function (l) {
                l.source = searchArrayObjects(filteredNodes, "key", l.sourceName);
                l.target = searchArrayObjects(filteredNodes, "key", l.targetName);

                function searchArrayObjects(array, attr, value) { 	// find matching value, return array index
                    for (var i = 0; i < array.length; i += 1) {
                        if (array[i][attr] == value) {
                            return i;
                        }
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
                .attr("class", "force-link");


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
                .attr("class", "force-node");

            node_update
                .classed("force-selectedNode", function(d) {return d.key == streetFilter; })
                .attr("r", function (d) {
                    return r(d.totalAccidents);
                })
                .on("click", click)
                .on("mouseover", function (d) {
                    d3.select(this)
                        .style("stroke", "black")
                        .style("stroke-width", "3px");
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .style("stroke-width", "0px");
                });


            // define updated node list
            var node_text_update = svgForce.selectAll(".force-text")
                .data(force.nodes(),
                    function (d) {
                        return d.key;
                    }
                );

            node_text_update.enter()
                .append("text")
                .attr("class", "force-text");

            node_text_update
                .text(function (d) {
                    if (d.key != streetFilter) return d.key.toUpperCase();
                });


            // remove old text nodes
            node_text_update.exit()
                .remove();

            // remove old nodes
            node_update.exit()
                .remove();

            // run force simulation
            force.start();

            //	 fast forward through force sim so positions appear fixed  --  NOT USED ---
            //runThroughTicks();
            function runThroughTicks() {
                var n = 100;
                for (var i = n * n; i > 0; --i) force.tick();
            }


            // define tick actions - element positioning functions for simulation
            function tick() {
                var center = {x: 0, y: 0};  // holder for position of center node

                svgForce.selectAll(".force-link")
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                svgForce.selectAll(".force-node")
                    .attr("cx", function (d) {
                        if (d.key == streetFilter) center.x = d.x;
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        if (d.key == streetFilter) center.y = d.y;
                        return d.y;
                    });

                svgForce.selectAll(".force-text")	// adjust text position to be outside nodes
                    .attr("x", function (d) {
                        if (d.x < center.x)
                            return (d.x - r(d.totalAccidents) - this.getComputedTextLength());
                        else return (d.x + r(d.totalAccidents) + 5);
                    })
                    .attr("y", function (d) {
                        if (d.y < center.y)
                            return (d.y - r(d.totalAccidents) - 5);
                        else return (d.y + r(d.totalAccidents) + 15);
                    });

            }
        }


        // on click, update force graph data and elements, restart simulation.
        function click(d) {

            console.log(d);
            if (d.key.toUpperCase() != streetFilter.toUpperCase()) {
                var coords = [];
                var total=0;

                //  run through full node list to locate matching intersections
                //  search both ways streetFilter-d.key  and d.key-streetFilter
                // due to the way the data was originally encoded in the raw dataset

                streetNodes.forEach(function (n) {
                    if (n.key.toUpperCase() == streetFilter.toUpperCase()) {
                        n.values.forEach(function (v) {
                            if (v.key.toUpperCase() == d.key.toUpperCase()) {
                                coords = v.values[0].coordinates;

                                total += v.values.length;
                            }
                        });
                    }
                });

                streetNodes.forEach(function (n) {
                    if (n.key.toUpperCase() == d.key.toUpperCase()) {
                        n.values.forEach(function (v) {
                            if (v.key.toUpperCase() == streetFilter.toUpperCase()) {

                                coords = v.values[0].coordinates;
                                total += v.values.length;
                            }
                        });
                    }
                });



                $("#streetview-title").text("Intersection of " + streetFilter.toUpperCase() + " & " + d.key.toUpperCase());

                if (coords[0]!=0 && coords[1]!=0) showStreetView(coords);
                else $("#streetview-title").text("Sorry, no street view available for this intersection");


                $("#streetview-info").text(total + " total accidents at this intersection (2010-2014)");


                // update graph to new street selection
                streetFilter = d.key;
                $("#forcegraph-title").text("Currently on " + streetFilter.toUpperCase() + " : " + d.totalAccidents + " total accidents");

                start();
            }
        }
    }














    function showStreetView(coords) {

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


        //  reset SVG/image dimensions for street view after showing start image
        d3.selectAll("#streetview1").select("svg")
            .attr("width", widthStreetImage)
            .attr("height", heightStreetImage)


        // populate streetview image
        streetImage1
            .attr("xlink:href", url)
            .attr("width", widthStreetImage)
            .attr("height", heightStreetImage);

        // populate streetview image
        streetImage2
            .attr("xlink:href", url2);

        console.log(url);

    }


    /* END MAIN CODE
     **********************************/


    init();


    // Public variables and methods we want to expose.  Just add the var or function reference here.
    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        READY_STATE: READY_STATE,
        init: init,
        run: run,
        echo: echo
    };


    // Expose the public variables and methods for this module by returning the public object
    return my;


})(crashcaster, $, d3);


