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

_* The Crashcast uses a preliminary predictive model our team developed specifically to underpin the visualization innovations  we wanted to drive toward that enables the combination of weather conditions and modes of travel among many factors to forecast accidents and present the data in various ways.  As such, we believe our predictive model is broadly representative of the historic data and various current conditions -- however, it is an immature model that requires further refinement beyond the scope of our final project._


**Crashboard**


**Weather Impact**


**Crashcalendar**


**Intersections**


**Street Explorer**



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
