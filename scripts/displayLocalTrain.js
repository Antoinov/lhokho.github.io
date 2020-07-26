/**
 * Build local trip layer
 * @param {Map} map leaflet map to populate
 * @param {Number} city_id unique city identifier
 */
function buildLocalTripLayer(map,city_id){
    //clear layer before displaying any elements
    localTrainLayer.clearLayers();

    let db_city_stations = firebase.database().ref("city/station/" + city_id);
    
    db_city_stations.on("value", function (main) {
        main.forEach(function (childNodes) {
            console.log(childNodes.val())
            let departure_coords = [childNodes.val().lat,childNodes.val().lon];
            let db_ter_stations = firebase.database().ref("city/train/" + city_id+"/"+childNodes.key);
            db_ter_stations.on("value", function (local) {
                local.forEach(function (localStation) {
                    console.log(localStation.val());
                    let arrival_coords = [localStation.val().lat,localStation.val().lon];
                    //build trip itinerary
                    displayTrip(departure_coords,arrival_coords,localStation.val().duration);
                    //build local marker station
                    var localStation_marker = L.marker(
                        arrival_coords,
                        {"station":localStation.val().name ,"duration":localStation.val().duration}
                    );
                    //icons bound to marker
                    var custom_icon = L.icon({"iconSize": [30,30], "iconUrl":"images/icons/local_station.png"});
                    localStation_marker.setIcon(custom_icon);
                    console.log(localStation_marker)
                    //localStation_marker.options.icon.style.backgroundColor = '#57587f'
                    // specify popup css class
                    var infoPopupOptions ={"maxWidth" : "auto"}
                    // specify popup html content
                    var html = '<a id="local_'+localStation.val().name+'" style="color:white;" href="#" target="_blank"">'+localStation.val().name+'</a><br/>'
                            +'Trip Duration:'+Math.floor((localStation.val().duration)/ 60)+' min'+'<br/>';
                            localStation_marker.bindPopup(html,infoPopupOptions);
                    //bound marker to map
                    localStation_marker.addTo(localTrainLayer);
                    //map.fitBounds(localTrainLayer.getBounds());
                });
            });
        });
    });
    
}

/**
 * Call trainmap API to display trip itinerary polyline
 * @param {Array} departure_coords lon,lat of departure point
 * @param {Array} arrival_coords lon,lat of arrival point
 */
function displayTrip(departure_coords,arrival_coords,duration){
    var query = 'https://trainmap.ntag.fr/api/route?dep=%deplat,%deplon&arr=%arrlat,%arrlon'
        .replace('%deplat',departure_coords[0])
        .replace('%deplon',departure_coords[1])
        .replace('%arrlat',arrival_coords[0])
        .replace('%arrlon',arrival_coords[1]);
    $.getJSON(query, function(response){
        //response.geometry.type = 'LineString';
        //console.log(response.geometry.coordinates[0])
        polyline_wps = [];
        response.geometry.coordinates[0].forEach(function(point){
            polyline_wps.push([point[1],point[0]])
        })
        //create custom line
        var polyline = new CustomPolyline(polyline_wps,{
            color: 'black',
            weight: 3,
            opacity: 1,
            duration: duration,
            dashArray: '10, 10',
            dashOffset: '0'
        });
        polyline.addTo(localTrainLayer);
    });
}