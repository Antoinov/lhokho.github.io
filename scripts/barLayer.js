function add_marker(name,position,icon_url,icon_size,price,layer){
    var marker_destination = L.marker(
        position,
        {"name":name , "price":price}
    );
    var custom_icon = L.icon({"iconSize": icon_size, "iconUrl":icon_url});
    marker_destination.setIcon(custom_icon);

    var popup = L.popup({"maxWidth": "100%"});
    var html = $('<a id="html_'+name+'" style="width: 100.0%; height: 100.0%;" href="http://www.google.com/search?q='+name+' bar" target="_blank"">' +
        '<br>'+name+'<br>' +
        '</a>')[0];

    popup.setContent(html);
    marker_destination.bindPopup(popup);
    layer.addLayer(marker_destination);
}

function arrayRemove(arr, value) { return arr.filter(function(ele){ return ele != value; });}

function update_bar(markers,price){
    var clusterToClean = [];
    markers.eachLayer(function(layer){
        if(layer.options.price !== undefined){
            if(layer.options.price > price){
                layer.setOpacity(0);
                var visibleOne = markers.getVisibleParent(layer);
                if(clusterToClean.indexOf(visibleOne) === -1){
                    clusterToClean.push(visibleOne);
                }
            }else{
                layer.setOpacity(1);
                var anotherOne = markers.getVisibleParent(layer);
                arrayRemove(clusterToClean,anotherOne);
            }
        }
    });
    clusterToClean.forEach(function(cluster){
        cluster.setOpacity(0);
    })
}

//BAR
function buildBarLayer(map,initial_pos,city_id,info_html) {
    var info_bars = firebase.database().ref("city/bar/" + city_id);
    var info_station = firebase.database().ref("city/station/" + city_id);

    if (info_bars !== 0) {
        let current_city = undefined;
        //train stations information
        let station_positions = [];
        let station_names = [];
        //bar information
        let bar_names = [];
        let bar_positions = [];
        var bar_HH_prices = [];
        var bar_nHH_prices = [];
        var bar_HH_hours = [];
        //console.log(info_bars)

        info_station.on("value", function (dataset) {
            dataset.forEach(function (childNodes) {
                var node_data = childNodes.val();
                station_positions.push([node_data.lat, node_data.lon]);
                station_names.push(node_data.name);
                current_city = node_data.ville;
            });
            info_bars.on("value", function (dataset) {
                ////console.log('iterate over bar');
                dataset.forEach(function (childNodes) {
                    var node_data = childNodes.val();
                    //console.log(node_data);
                    //console.log('bar added');
                    bar_positions.push([node_data.latitude, node_data.longitude]);
                    bar_names.push(node_data.name);
                    bar_HH_prices.push(Number(node_data["HHprice_1"]));
                    bar_nHH_prices.push(Number(node_data["nHHprice_1"]));
                    //console.log(node_data["HHprice_1"]);
                    let start = node_data["HH_start"];
                    start = start.replace('[', '').replace(']', '').replace(',', 'h');
                    let end = node_data["HH_end"];
                    end = end.replace('[', '').replace(']', '').replace(',', 'h');
                    bar_HH_hours.push([start, end]);
                });

                addBarLayer(map,city_id,initial_pos,station_names,station_positions,bar_names,bar_positions,bar_HH_prices,bar_nHH_prices,info_html)
            });

        });
    }
}

function addBarLayer(map,city_id,initial_pos,station_names,station_positions,bar_names,bar_positions,bar_HH_prices,bar_nHH_prices,info_html){
    var local = L.featureGroup().addTo(map);
    var markers_bar = L.markerClusterGroup({
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            return L.icon({"iconSize": [30,30], "iconUrl":"images/icons/pint.png"});
        }
    });

    map.addLayer(markers_bar);

    for (var k = 0; k < station_names.length; k++) {
        var name = station_names[k]
        add_marker(name,station_positions[k],"images/icons/station.png",[40,40],undefined,local);
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

        var circle = L.circle(circleCenter, 500, circleOptions);

        var circle2 = L.circle(circleCenter, 1000, circleOptions2);

        circle.addTo(local);

        circle2.addTo(local);
    }

    for (var j = 0; j < bar_names.length; j++) {
        var name = bar_names[j]
        if(isNaN(bar_nHH_prices[j])){
            add_marker(name,bar_positions[j],"images/icons/pint.png",[20,20],undefined,markers_bar)
        }
        add_marker(name,bar_positions[j],"images/icons/pint.png",[20,20],bar_nHH_prices[j],markers_bar)
    }
    if(bar_names.length > 0){
        slider = L.control.slider(function(value) {
            update_bar(markers_bar,value)
        }, {
            position:'bottomleft',
            max: Math.round(Math.max(...bar_nHH_prices))+1,
            value: Math.round(Math.max(...bar_nHH_prices)),
            step:1,
            size: '250px',
            orientation:'horizontal',
            id: 'slider',
            collapsed:false,
            logo:''
        }).addTo(map);
    }



    //adding additional information embedded in the map
    var info = L.control({
        position : 'bottomleft'
    });

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        let html_back = info_html + '<a id="back_'+city_id+'" href="#" style="color:white;"">back to map...</a>';
        this._div.innerHTML = html_back;
    };

    info.addTo(map);
    $( "#back_"+city_id ).bind( "click", function() {
        map.flyTo(initial_pos,13,{'easeLinearity':1.0});
        info.remove();
        slider.remove();
        map.removeLayer(markers_bar);
        map.removeLayer(local);
        focus_station(city_id);
    });

}