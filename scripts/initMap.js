const delay = ms => new Promise(res => setTimeout(res, ms));
// Before map(s) is(are) being initialized.
var mapsPlaceholder = [];

var isMobileDisplay = L.Browser.mobile;


CustomPolyline = L.Polyline.extend({
    options: {
        // default values, you can override these when constructing a new customPolyline
        duration:0
    }
});

// http://leafletjs.com/reference-1.1.0.html#class-constructor-hooks
L.Map.addInitHook(function () {
    mapsPlaceholder.push(this); // Use whatever global scope variable you like.
});

$(document).ready(function(){
    L.map(
        "map",
        {
            center: [49.21164026, 3.98878814],
            crs: L.CRS.EPSG3857,
            zoom: 7,
            zoomControl: false,
            preferCanvas: false,
            scrollWheelZoom: false
        }
    );

    //Create and shape leaflet map
    var map = mapsPlaceholder[0];

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    var tile_layer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        {"attribution": "\u0026copy; \u003ca href=\"https://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"https://carto.com/attributions\"\u003eCARTO\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
    ).addTo(map);




});
