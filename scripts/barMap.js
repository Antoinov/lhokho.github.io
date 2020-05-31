function add_marker(name,position,icon_url,icon_size,price,layer){
    var marker_destination = L.marker(
        position,
        {"name":name , "price":price}
    );
    var custom_icon = L.icon({"iconSize": icon_size, "iconUrl":icon_url});
    marker_destination.setIcon(custom_icon);

    var popup = L.popup({"maxWidth": "100%"});
    var html = $('<a id="html_'+name+'" style="width: 100.0%; height: 100.0%;" href="http://www.google.com/search?q='+name+' bar" target="_blank""><br>'+name+'<br></a>')[0];

    popup.setContent(html);
    marker_destination.bindPopup(popup);
    layer.addLayer(marker_destination);

}

function update_map(markers,price){
    console.log(price)
    markers.eachLayer(function(layer){
        console.log(layer)
        if(layer.options.price > price){
            layer.setOpacity(0);
        }else{
            layer.setOpacity(1)
        }
    });
}

$(document).ready(function(){
    var city_id = window.location.search.substr(1).split("=")[1];
    //retrieve all information we need to display map
    var info_bars = firebase.database().ref("city/bar/"+city_id);
    var info_station = firebase.database().ref("city/station/"+city_id);

    if(info_bars !== 0){
        let current_city = undefined;
        //train stations information
        let station_positions = [];
        let station_names = [];
        //bar information
        let bar_names = [];
        let bar_positions = [];
        var bar_HH_prices = [];
        console.log(info_bars)

        info_station.on("value", function(dataset) {
            dataset.forEach(function(childNodes){
                var node_data = childNodes.val();
                station_positions.push([node_data.coords[1],node_data.coords[0]]);
                station_names.push(node_data.name);
                current_city = node_data.ville;
            });
            info_bars.on("value", function(dataset) {
                console.log('iterate over bar');
                dataset.forEach(function(childNodes){
                    var node_data = childNodes.val();
                    console.log(node_data);
                    console.log('bar added');
                    bar_positions.push([node_data.latitude,node_data.longitude]);
                    bar_names.push(node_data.name);
                });
                // to be replaced

                for (var i=0, t=15; i<bar_names.length; i++) {
                    bar_HH_prices.push(Math.round(Math.random() * t))
                }
                setupMap()
            });

        });

        function setupMap(){
            console.log(station_positions[0])
            var map = L.map(
                "map",
                {
                    center: station_positions[0],
                    crs: L.CRS.EPSG3857,
                    zoom: 13,
                    zoomControl: false,
                    preferCanvas: false,
                }
            );

            var tile = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap',
                subdomains: 'abcd',
                minZoom: 0,
                maxZoom: 20,
                ext: 'png'
            }).addTo(map);

            var route = L.featureGroup().addTo(map)

            var markers = L.markerClusterGroup({
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: function(cluster) {
                    return L.icon({"iconSize": [30,30], "iconUrl":"images/icons/pint.png"});
                }
            });

            map.addLayer(markers);

            for (var k = 0; k < station_names.length; k++) {
                var name = station_names[k]
                add_marker(name,station_positions[k],"images/icons/station.png",[40,40],0,route);
                var circleCenter = station_positions[k];

                var circleOptions = {
                    color: 'orange',
                    fillColor: 'orange',
                    fillOpacity: 0.2,
                    dashArray: '5,10'
                }

                var circleOptions2 = {
                    color: 'orange',
                    fillColor: 'orange',
                    fillOpacity: 0.1,
                    dashArray: '5,10',
                    weight: 1
                }

                var circle = L.circle(circleCenter, 1000, circleOptions);

                var circle2 = L.circle(circleCenter, 3000, circleOptions2);

                circle.addTo(map);

                circle2.addTo(map);
            }

            for (var j = 0; j < bar_names.length; j++) {
                var name = bar_names[j]
                add_marker(name,bar_positions[j],"images/icons/pint.png",[20,20],bar_HH_prices[j],markers)
            }


            slider = L.control.slider(function(value) {
                update_map(markers,value)
            }, {
                max: 15,
                value: 15,
                step:1,
                size: '250px',
                orientation:'vertical',
                id: 'slider'
            }).addTo(map);

            map.fitBounds(markers.getBounds());

            //adding additional information embedded in the map
            var info = L.control({
                position : 'topleft'
            });

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                this.update();
                return this._div;
            };

            // method that we will use to update the control based on feature properties passed
            info.update = function (props) {
                this._div.innerHTML = '<img src="images/icons/sign.png" height="100">';
                this._div.opacity = 1.0;
            };

            info.addTo(map);

        }
    }

});








