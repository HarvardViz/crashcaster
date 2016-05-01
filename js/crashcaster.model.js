crashcaster.model = (function () {

    var plugin_name = "crashcaster.model";
    var plugin_version = "0.0.1";
    var READY_STATE = {_current: -1, NOT_STARTED: 0, LOADING: 1, LOADED: 2};


    function init() {
        echo("initialize crashcaster.model");

        // Nothing to wait for set the READY_STATE
        READY_STATE._current = READY_STATE.LOADED;
    };

    // Public method: A simple example function, exposed as a public method
    function echo(v) {
        console.log(v);
    };


    /*
     weather-partlycloudy-0.jpg*/

    var weatherImages =  [];

    // Clear variations
    weatherImages["clear"] = [
        {daytime: true, url: "img/weather-clear-day-0.jpg", cite: ""},
        {daytime: true, url: "img/weather-clear-day-1.jpg", cite: ""},
        {daytime: true, url: "img/weather-clear-day-2.jpg", cite: ""},
        {daytime: true, url: "img/weather-clear-day-3.jpg", cite: ""},
        {daytime: true, url: "img/weather-clear-day-4.jpg", cite: "7-themes -- 7039003-summer-road"},
        {daytime: false, url: "img/weather-clear-night-0.jpg", cite: ""},
        {daytime: false, url: "img/weather-clear-night-1.jpg", cite: ""},
        {daytime: false, url: "img/weather-clear-night-2.jpg", cite: ""},
        {daytime: false, url: "img/weather-clear-night-3.jpg", cite: ""},
        {daytime: false, url: "img/weather-clear-night-4.jpg", cite: "all4desktop.com - #336754"}];

    weatherImages["sunny"] = weatherImages["clear"];
    weatherImages["mostlysunny"] = weatherImages["clear"];
    weatherImages["unknown"] = weatherImages["clear"];

    // Cloudy
    weatherImages["cloudy"] = [
        {daytime: true, url: "img/weather-cloudy-day-0.jpg", cite: "artsfon.com -- #54830"},
        {daytime: true, url: "img/weather-cloudy-day-1.jpg", cite: "artsfon.com -- #45646"},
        {daytime: true, url: "img/weather-cloudy-day-1.jpg", cite: "artsfon.com -- #97853"},
        {daytime: true, url: "img/weather-cloudy-day-2.jpg", cite: "7-themes.com -- #6830458"},
        {daytime: false, url: "img/weather-cloudy-night-0.jpg", cite: "7-themes.com -- #6850701"},];

    weatherImages["mostlycloudy"] = weatherImages["cloudy"];
    weatherImages["partlycloudy"] = weatherImages["cloudy"];
    weatherImages["partlysunny"] = weatherImages["cloudy"];

    // Rain variations
    weatherImages["rain"] = [
        {daytime: true, url: "img/weather-rain-day-0.jpg", cite: "wallpaperscraft.com -- #47424"},
        {daytime: true, url: "img/weather-rain-day-1.jpg", cite: "onehdwallpaper.com -- Rainy-Night-Desktop-Wallpapers"},
        {daytime: true, url: "img/weather-rain-day-2.jpg", cite: "wallpaperscraft.com -- #45625"},
        {daytime: true, url: "img/weather-rain-day-3.jpg", cite: "wallpaperscraft.com -- #48342"},
        {daytime: false, url: "img/weather-rain-night-0.jpg", cite: "wallpapercomputer.com -- rain-wallpaper-desktop-windows-hd"},
        {daytime: false, url: "img/weather-rain-night-1.jpg", cite: "livehdwallpaper.com -- Abstract-Rainy-Night-Wallpaper"},
        {daytime: false, url: "img/weather-rain-night-2.jpg", cite: "newtopwallpapers.com -- Rainy-Night-Desktop-Free-Wallpaper"},
        {daytime: false, url: "img/weather-rain-night-3.jpg", cite: "artsfon.com -- #48302"}];

    weatherImages["chancerain"] = weatherImages["rain"];

    weatherImages["tstorms"] = [
        {daytime: true, url: "img/weather-tstorms-day-0.jpg", cite: "Lighting-Thunder-Wallpaper-Laptop-Backgrounds-54812"},
        {daytime: false, url: "img/weather-tstorms-night-0.jpg", cite: "wallpaperscraft.com -- #48426"},
        {daytime: false, url: "img/weather-tstorms-night-1.jpg", cite: "hdwallpaperfun.com -- Thunder Weather Wallpaper"}];

    weatherImages["chancetstorms"] = weatherImages["tstorms"];


    // Snow variations
    weatherImages["snow"] = [
        {daytime: true, url: "img/weather-snow-day-0.jpg", cite: "7-themes -- #7041083"},
        {daytime: true, url: "img/weather-snow-day-1.jpg", cite: "7-themes -- #7040593"},
        {daytime: false, url: "img/weather-snow-night-0.jpg", cite: "7-themes -- #6994228"}];

    weatherImages["flurries"] = weatherImages["snow"];
    weatherImages["chanceflurries"] = weatherImages["snow"];
    weatherImages["chancesnow"] = weatherImages["snow"];
    weatherImages["sleat"] = weatherImages["snow"];
    weatherImages["chancesleat"] = weatherImages["snow"];

    // Fog variations
    weatherImages["hazy"] = [
        {daytime: true, url: "img/weather-fog-day-0.jpg", cite: "1freewallpapers.com -- road-leading-to-the-fog"},
        {daytime: false, url: "img/weather-fog-night-0.jpg", cite: "hdwallpapers.im -- foggy_night_in_a_palace_courtyard"}];

    weatherImages["fog"] = weatherImages["hazy"];


    function color(opacity) {
        var opacity = (opacity == undefined) ? 1.0 : parseFloat(opacity);
        return {
            'LIGHT_AQUA': 'rgba(204, 255, 221, ' + opacity + ')',
            'AQUA': 'rgba(48, 145, 112, ' + opacity + ')',
            'BLACK': 'rgba(0, 0, 0, ' + opacity + ')',
            'WHITE': 'rgba(255, 255, 255, ' + opacity + ')',
            'GRAY': 'rgba(128, 128, 128, ' + opacity + ')',
            'RED': 'rgba(255, 0, 0, ' + opacity + ')',
            'CYAN': 'rgba(0, 255, 255, ' + opacity + ')',
            'YELLOW': 'rgba(255, 255, 0, ' + opacity + ')',
            'ORANGE': 'rgba(255, 128, 0, ' + opacity + ')',
            'BLUE': 'rgba(0, 0, 255, ' + opacity + ')',
            'PURPLE': 'rgba(128, 0, 128, ' + opacity + ')',
            'GREEN': 'rgba(0, 255, 0, ' + opacity + ')',
            'LIGHT_GREEN': 'rgba(168, 210, 0, ' + opacity + ')',
            'BABY_BLUE': 'rgba(59, 194, 234, ' + opacity + ')',
            'REDDISH': 'rgba(255, 93, 85, ' + opacity + ')',
            'MUSTARD': 'rgba(255, 198, 65, ' + opacity + ')',
            'GRAPE': 'rgba(186, 127, 214, ' + opacity + ')'
        };
    }

    // Call the initialization function by default
    init();

    var my = {
        plugin_name: plugin_name,
        plugin_version: plugin_version,
        //READY_STATE: READY_STATE,
        init: init,
        echo: echo,
        color: color,
        weatherImages: weatherImages
    };

    return my;
}());