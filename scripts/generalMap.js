$(document).ready(function(){
    //Create and shape leaflet map
    var map = L.map(
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

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    var tile_layer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        {"attribution": "\u0026copy; \u003ca href=\"https://www.openstreetmap.org/copyright\"\u003eOpenStreetMap\u003c/a\u003e contributors \u0026copy; \u003ca href=\"https://carto.com/attributions\"\u003eCARTO\u003c/a\u003e", "detectRetina": false, "maxNativeZoom": 18, "maxZoom": 18, "minZoom": 0, "noWrap": false, "opacity": 1, "subdomains": "abc", "tms": false}
    ).addTo(map);

    var route = L.featureGroup().addTo(map);

    var current_zone = L.featureGroup().addTo(map);

    var markers = [];

    CustomPolyline = L.Polyline.extend({
        options: {
            // default values, you can override these when constructing a new customPolyline
            duration:0
        }
    });

    function update_map(markers,selected_duration){
        markers.eachLayer(function(layer){
            console.log(layer);
            if(layer.options.duration !== undefined){
                if(layer.options.duration > selected_duration){
                    layer.setStyle({
                        opacity: 0
                    });
                }else{
                    layer.setStyle({
                        opacity: 0.6
                    });
                }
            }
        });
    }

    var tmp_duration_list = [0];

    slider = L.control.slider(function(value) {
        update_map(current_zone,value)
    }, {
        max: Math.round(Math.max(...tmp_duration_list)),
        min: Math.round(Math.min(...tmp_duration_list)),
        value: Math.round(Math.max(...tmp_duration_list)),
        step:Math.round(Math.abs(Math.max(...tmp_duration_list)-Math.min(...tmp_duration_list))/10),
        size: '300px',
        orientation:'horizontal',
        id: 'slider',
        collapsed:false,
        position:'bottomleft',
        logo:''
    }).addTo(map);

    slider.remove();

    //focus on station
    function focus_station(city_id){
        console.log('look for marker...')
        route.eachLayer(function(layer){
            console.log(layer);
            console.log(city_id);
            if(layer.options.id == city_id){
                console.log('found marker');
                layer.fire('click');
            }
        })
    }

    $("#destination_select").change(function() {
        var id = $(this).children(":selected").attr("id");
        let city_id = id.replace(/\D/g,'');
        focus_station(city_id);
    });

    function clear_selection(){
        current_zone.clearLayers();
        route.eachLayer(function (layer) {
            layer.setOpacity(0.2);
        });
        tmp_duration_list = [0];
        slider.remove();
    }

    var previous_marker = undefined;

    function onClick(e) {
        clear_selection();
        if(previous_marker !== undefined){
            previous_marker.setIcon(L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"}))
        }
        e.sourceTarget.setIcon(L.icon({"iconSize": [40,40], "iconUrl":"images/icons/station.png"}));
        //store marker
        previous_marker = e.sourceTarget;
        e.sourceTarget.options.links.forEach(function (link) {
            e.sourceTarget.setOpacity(1);
            route.eachLayer(function (layer) {
                if(link.id == layer.options.id){
                    console.log('found related marker')
                    layer.setOpacity(1);
                    var latlngs = Array();
                    //Get latlng from first marker
                    latlngs.push(e.sourceTarget.getLatLng());
                    //Get latlng from first marker
                    latlngs.push(layer.getLatLng());
                    console.log(Math.min(...link.durations))
                    var polyline = new CustomPolyline(latlngs,{
                        color: 'black',
                        weight: 1,
                        opacity: 0.6,
                        duration: Math.min(...link.durations),
                        dashArray: '10, 10',
                        dashOffset: '0'
                    });
                    tmp_duration_list.push(Math.min(...link.durations));
                    current_zone.addLayer(polyline);
                    console.log(tmp_duration_list)
                }
            });

        });
        console.log(tmp_duration_list)
        slider = L.control.slider(function(value) {
            update_map(current_zone,value)
        }, {
            max: Math.round(Math.max(...tmp_duration_list)),
            min: Math.round(Math.min(...tmp_duration_list)),
            value: Math.round(Math.max(...tmp_duration_list)/2),
            step:Math.round(Math.abs(Math.max(...tmp_duration_list)-Math.min(...tmp_duration_list))/10),
            size: '300px',
            orientation:'horizontal',
            showValue:true,
            getValue: function(value) {
                let hours = Math.round(value/(24*60))
                let minute = Math.round(Math.abs((value/(24*60))- hours)*60)
                let display = ("0" + hours).slice(-2)+"h"+("0" + minute).slice(-2)+"m";
                return display;},
            id: 'slider',
            collapsed:false,
            position:'bottomleft',
            logo:''
        }).addTo(map);

        map.fitBounds(current_zone.getBounds());
    }



    function add_destination(city_id,city_data){

        let city_name = city_data.city;
        let city_pos = city_data.coords;

        let duration_db = firebase.database().ref("city/trip/"+city_id);
        let durations = []
        duration_db.on("value", function(dataset) {
            dataset.forEach(function (childNodes) {
                var node_data = {
                    'id': childNodes.key,
                    'stops':[],
                    'durations':[]
                }
                childNodes.val().forEach(function(trip){
                    if(node_data.stops.indexOf(trip['stops']) === -1){
                        node_data.stops.push(trip['stops']);
                        node_data.durations.push(trip['duration']);
                    }else{
                        idx = node_data.stops.indexOf(trip['stops'])
                        //get minimal duration for a specified trip
                        if(node_data.durations[idx] > trip['duration']){
                            node_data.durations[idx] = trip['duration'];
                        }
                    }
                    node_data.stops.push(trip['stops'])
                    node_data.durations.push(trip['duration'])
                })
                durations.push(node_data)
            });
        });


        var marker_destination = L.marker(
            [city_pos[1],city_pos[0]],
            {"id":city_id , "links":durations}
        ).on('click', onClick).setOpacity(0.2);;

        markers.push(marker_destination)
        //change when adapted to mobile website
        if (L.Browser.mobile) {
            var custom_icon = L.icon({"iconSize": [30,30], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }else{
            var custom_icon = L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }

        var popup = L.popup({"maxWidth": "100%"});
        var html = $('<a id="html_'+city_name+'" style="width: 100.0%; height: 100.0%;" href="destination.html?city='+city_id+'" target="_blank""><br>'+city_name+'<br></a>')[0];

        popup.setContent(html);
        marker_destination.bindPopup(popup);
        route.addLayer(marker_destination);
    }


    firebase.database().ref().child('city/station').once('value').then(function(datakey){
        let idx = 0;
        datakey.forEach(function(data){
            add_destination(idx,data.val()[0]);
            idx = idx +1;
        });
        map.fitBounds(route.getBounds());
    });


});





