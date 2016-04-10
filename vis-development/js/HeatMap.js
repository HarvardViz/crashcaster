
var accidentData = [];

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

            console.log(accidentData);

            createVis();
        }
    });
  }


function createVis(){

    var calData = {};

    // create array with totals of accidents by date
    var accidentDataNested = d3.nest()
        .key(function(d) { return d.date.toDateString(); }) // create date as key (without time)
        .rollup(function(d) { return d.length; })           // sum of accidents
        .entries(accidentData);
    console.log(accidentDataNested);


    accidentDataNested.forEach(function(d) {
        calData[parseInt(Date.parse(d.key)/1000)] = d.values;  // convert date to timestamp and change from milliseconds to seconds
    });

    console.log(calData);


    //  render cal-heatmaps for each year
    for (var year= 2010; year<=2014; year++) {

        var cal = new CalHeatMap();
        cal.init({
            data: calData,
            dataType: "json",
            start: new Date(year, 0, 1),
            id: "cal-heatmap",
            itemName: ["Accident", "Accidents"],
            domain: "month",
            subDomain: "x_day",
            range: 12,
            weekStartOnMonday: false,
            domainDynamicDimension: false,
            domainGutter: 10,
            domainLabelFormat: "%b-%Y",
            considerMissingDataAsZero: true,
            tooltip: true,
            label: {
                position: "top",
                width: 60
            },
            legend: [3, 6, 9, 12, 15, 18, 21],     // levels for color scale
            displayLegend: false
        });
    }

}

