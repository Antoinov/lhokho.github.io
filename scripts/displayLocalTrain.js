function buildLocalTripLayer(map,city_id){
    //clear layer before displaying any elements
    localTrainLayer.clearLayers();

    let db_city_stations = firebase.database().ref("city/station/" + city_id);
    
    db_city_stations.on("value", function (main) {
        main.forEach(function (childNodes) {
            console.log(childNodes.val())
            let departure_coords = [childNodes.val().lat,childNodes.val().lon];
            let db_ter_stations = firebase.database().ref("city/train/" + city_id);
            db_ter_stations.on("value", function (local) {
                local.forEach(function (localStation) {
                    console.log(localStation.val());
                    displayTrip(map,departure_coords,[localStation.val().lat,localStation.val().lon]);
                });
            });
        });
    });
    
}

function displayTrip(map,departure_coords,arrival_coords){

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
        var carto = L.polyline(polyline_wps).addTo(localTrainLayer);
    });
}