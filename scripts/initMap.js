/**
 *
 * File containing methods to set up map general organization
 *
 * @summary set up main display
 * @author Makitsu 
 *
 */
// Before map is being initialized.
var mapsPlaceholder = [];
//Define custom leaflet line object
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
//Define layer:
// -markerLayer (containing markers and global information)
// -tripLayer (containing trip suggestions)
// -localBarLayer (containing bar data locally set on map)
// -localTrainLayer (containing train data locally set on map)
// -localPointLayer (containing other points of interests locally set on map)
var markerLayer = L.featureGroup();
var tripLayer = L.featureGroup();
var localBarLayer = L.featureGroup();
var localTrainLayer = L.featureGroup();
var localPointLayer = L.featureGroup();

//DOCUMENT ON LOAD
$(document).ready(function(){

    var tile_layer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        {"attribution": "\u0026copy; \u003ca href=\"https://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"https://carto.com/attributions\"\u003eCARTO\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
    );

    //Create a map
    L.map(
        "map",
        {
            center: [49.21164026, 3.98878814],
            crs: L.CRS.EPSG3857,
            zoom: 7,
            zoomControl: false,
            preferCanvas: false,
            scrollWheelZoom: false,
            layers:[tile_layer,markerLayer]
        }
    );

    
    //Shape leaflet map
    var map = mapsPlaceholder[0];

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

   //Add feature groups
   markerLayer.addTo(map);
   tripLayer.addTo(map);
   localBarLayer.addTo(map);
   localTrainLayer.addTo(map);
   localPointLayer.addTo(map);
});
