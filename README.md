# Crashcaster
 

**What can we do to save more lives in Cambridge?**

That was the motivating question for our CS171 Visualization project, Crashcaster.  We found ourselves deeply interested in using innovation, particularly in visualization, to improve society beyond the bounds of our final project, well into the future.

The truth is that traffic accidents are one of the leading killers of Americans -- right up there with heart disease and cancer. 

Crashcaster is about the collisions between strangers’ lives, the impacts upon them, where they happen most often, and how to avoid finding yourself at a serious, life-altering intersection on the streets of Cambridge.

Using visualizations to create engagement and understanding we thought could help with our goal. We start our story in the future with our forecast, "Crashcaster". We then invite you to explore the historic data we used to create our predictive model via our dashboard, "Crashboard". Finally, we unravel the stories in the data that we found interesting while enabling you to explore for yourself in what we hope are novel ways.
 
_Stay safe on the streets of Cambridge!_
Kyle Maguire, Rick Farmer, Kartik Trasi and Adam DiChiara


_Please visit [crashcaster.com](http://crashcaster.com) for the live site or check out our code at [https://github.com/HarvardViz/crashcaster](https://github.com/HarvardViz/crashcaster)._


## What are we handing in?

1. Project website: [crashcaster.com](http://crashcaster.com)
1. [Project code](https://github.com/HarvardViz/crashcaster).  See the `gh-pages` branch for our code.
1. [Final Screencast](http://crashcaster.com/index.html#screencast)
1. [Process book](http://crashcaster.com/index.html#processbook), direct link [ProcessBook.pdf](http://crashcaster.com/docs/ProcessBook.pdf)
1. [Project Planning & Execution](https://www.pivotaltracker.com/n/projects/1554113)
1. [Proposal](http://crashcaster.com/docs/project-proposal.pdf) an explanation of the initial goals for this project.
1. [Project Plan](http://crashcaster.com/docs/ProjectPlan.pdf)
1. [Data Sources](http://crashcaster.com/docs/DataVariable-SourceOutline.pdf)
1. [Initial Presentation Deck](http://crashcaster.com/docs/Initial-Projection-Plan-Screencast-Presentation-Deck.pdf)
1. [Initial Project Presentation Screencast](https://www.youtube.com/watch?v=L33ZCXyVEVo)
1. [Team Expectations Agreement](http://crashcaster.com/docs/TeamExpectationAgreement.pdf)
1. [Project Redesign](http://crashcaster.com/docs/ProjectRedesign.pdf)
1. [Google Drive (all project documents)](https://drive.google.com/folderview?id=0B2F6XwBEDUW-bV9rTUVIUktlTzQ&usp=sharing_eid&ts=56f292cb)


## Crashcaster Features

Crashcaster.com has the following screens with several features that may be non-obvious.  While our UI design is meant to encourage user exploration via clear UX _affordances_ these may not be obvious at first:

**Crashcaster (Home)**

The Crashcaster Crashcast is our "Accident Forecast" and serves as the home page.  One of our major design goals was to make Crashcaster useful on a daily basis ongoing to the people of Cambridge, _long after_ our Visualization project is turned in.  We were strongly compelled by our formative question **"What can we do to save more lives in Cambridge?"** to make something that actually forecasts the accidents we could expect under **current conditions** given the mode of travel while accounting for the day of week, week of the year, time of day, traffic, events occurring, etc.  Ultimately we wanted to be intuitive, engaging and *actionably* informative to our users via good visualization practices:

1. Which hours of the day are the most dangerous to travel and which are the safest?
2. Which intersections represent the most and least danger given *current traffic* conditions?
3. How many accidents do we expect to see today given the current conditions that are our predictive model uses based on the historic data from 2010-2015?
4. Much like a weather forecast, what is today's forecast for accidents?  Is it 6% higher given the *current live weather conditions* or 31% when combined with the historic data for Sundays?
4. Maybe you are not traveling by automobile, what will the forecast be if you are walking, riding a motorbike, or bicycle?
5. Beyond the current weather, we added a "What if..." selection so that our users could visualize what the Crashcast looks like if it were to rain, snow, fog, or it was sunny and clear?
6. We have markers dropped on the Crashcast map that describes some the most dangerous places we've found, please click on those to get the full story.
7. The map is fully zoomable via clicking and moveable via dragging as one would expect from the Google Maps underlay.
8. The heat map overlay shows the most dangerous places to be under the current conditions or, if selected, "What if..." conditions.  Feel free to zoom in to really examine the street names, traffic conditions and let the heat map guide you away from particularly troubling spots as you travel Cambridge.
9. Clicking on the question mark in the top navigation will open a "drawer" pulldown that details the Crashcaster project for our users.

_* The Crashcast uses a preliminary predictive model our team developed specifically to underpin the visualization innovations  we wanted to drive toward that enables the combination of weather conditions and modes of travel among many factors to forecast accidents and present the data in various ways.  As such, we believe our predictive model is broadly representative of the historic data and various current conditions -- however, it is a primitive model that requires further refinement beyond the scope of our final project._


**Crashboard**

**Weather Impact**

To understand the impact of weather, we have taken correlated data from daily weather underground with the day the accident took place. The data was normalized by taking ratio of accidents and the duration of the weather to get the normalized value of accidents for that weather condition. Although, this algorithm may be primitive and does not account for the fact that the accidents could have been due to negligence or any other aspect other than weather; this still gives us something to think about.

1. Sankey chart shows the correlation between weather and accidents (normalized) 
2. User can explore by clicking on the stories and draw their own conclusions 

**Crashcalendar**

Our Crash Calendar is a calendar heatmap of accident totals using small multiples of months with contrast encoding.  The design for this visualization was intended to represent the entire date range of our dataset in a way that is intuitive and revealing.  The features of this visualization allow the user to:

1. Visually compare accident patterns across months, years, days of the week, and weeks within months, by vertically and horizontally aligning the month represnentations.    
2. Quickly identify high accident days to research for specific causes.
3. View differences between when various types of accidents occurred, by using buttons to enable highlighting.  
4. Hover on dates to reveal total accident details. 

Some story features are included as a starting point for exploration, showcasing the background on some dates with high accident totals which this visualization lead us to research.  


**Intersections**

The Intersections screen reveals another dimension of *where* accidents occur, along with the CrashBoard.  The major roads in Cambridge for accidents are represented here, starting with Massachusetts Ave which has the most accidents by far.  Taking this one step deeper, we wanted to show where along each street the accidents occur.  We used a novel prepresentation for this, representing each street's intersections as circles along a line, with darker red circles representing higher accidents.  This is similar to a subway style map representing stations without geographic accuracy. This visualization:

1.  Clearly shows at a high level which streets in Cambridge experience the most accidents
2.  Indicates where along each street the most accidents occur
3.  Allows the user to select streets in the bar chart to update the intersection visualization.
4.  Allows hovering on any element to reveal specific details.


**Street Explorer**

The Street View Explorer is an interactive way to navigate through Cambridge's most dangerous roads.  We designed this as a novel way to encourage high user engagement in representing a network; in this case, the network of Cambridge's roads.  The graph represents the user's location *within* Cambridge on a specific road, with several intersections to other roads, and uses circle size to represent the total accidents that have occured on each road.  By selecting any available connecting road, the user is shown a street view image of that intersection and is then located in the network on this new road they selected.  In this way the user has the freedom to navigate where they choose throughout Cambridge, and examine the street views and accompaning data that represent each intersection.  We feel this gives a personal and engaging element to the representing this data, by allowing the user to connect with the locations on a direct and exploratory level.  




## Code Overview

We wrote a modular plug-in system specifically for our project.  This enabled our team members to work independently as needed without worrying about complex merges.
This also enabled us to control the loading of the modules to maximize the performance of the system when loading and interacting.

Our approach was to use a one-page responsive design.  While we are not completely, handheld-ready, we are close.  But, for now we recommend a modern desktop browser or a larger-screen device such as an iPad.  

This one page is `index.html` at the root the project.

The JavaScript code we have written is contained in the root of the /js directory and is well documented, while the external libraries we used are isolated to /js/lib

The `crashcaster.js` is the module root and loader that handles loading all the `crashcaster.<module name>.js` modules as efficiently as possible to keep performance high.

Our code is:

```
/js
    /crashcaster.crashboard.js
    /crashcaster.crashcalendar.js
    /crashcaster.forcegraph.js
    /crashcaster.heatmap.js
    /crashcaster.js
    /crashcaster.linemap.js
    /crashcaster.model.js
    /crashcaster.module_template_copy_me.js
    /crashcaster.ui_forecast.js
    /crashcaster.ui_sankey.js
    /crashcaster.weather.js
```

The libraries we used are:

```
/js/lib
    /bootstrap.min.js
    /cal-heatmap.js
    /colorbrewer.js
    /crossfilter.js
    /d3.js
    /d3.tip.js
    /dc.js
    /dms.js
    /jquery.bootstrap-autohidingnavbar.js
    /jquery.fullPage.min.js
    /jquery.leanModal.min.js
    /latlon-spherical.js
    /lightbox-2.6.min.js
    /moment.min.js
    /queue.js
    /tether.min.js
```


## Thank You!

We would like to thank the excellent team that [Dr. Hanspeter Pfister](https://www.seas.harvard.edu/directory/pfister) put together for our [Harvard CS171 Visualization](http://www.cs171.org/2016/) class that lead to this project.

Our team has enjoyed the learning process and embraced the challenges that drive the visualization process.  We are thankful for this experience.
 
With gratitude,

_Team HarvardViz (Kyle Maguire, Rick Farmer, Kartik Trasi and Adam DiChiara)_
