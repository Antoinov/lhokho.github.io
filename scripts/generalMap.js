$(document).ready(function(){
    var cities = [];
    //stored lat lon
    var previous_latlon = undefined;

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

    var edition_group = L.featureGroup().addTo(map);

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
    // to restore marker to previous state when not used anymore
    var previous_marker = undefined;

    function onClick(e) {
        clear_selection();
        if(previous_marker !== undefined){
            previous_marker.setIcon(L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"}))
        }
        e.sourceTarget.setIcon(L.icon({"iconSize": [40,40], "iconUrl":"images/icons/station.png"}));
        //store marker
        previous_marker = e.sourceTarget;

        e.sourceTarget.setOpacity(1);
        //Get latlng from first marker
        let coordinates = new Array();
        coordinates.push(e.sourceTarget.getLatLng());
        console.log(e.sourceTarget.options);
        let date = new Date();
        console.log($('#toggle_tgv').prop('checked'));
        if($('#toggle_tgv').prop('checked')){
            date = new Date($('#selected_date').val());
            day = date.getDate();
            month = date.getMonth() + 1;
            year = date.getFullYear();
            let date_str = year+'-'+("0" + month).slice(-2)+'-'+("0" + day).slice(-2);
            getCityConnections(date_str,e.sourceTarget.options.iata,coordinates);
        }


    }

    function add_station(city_id,city_data,station_iata){

        let city_name = city_data.city;
        let lat = city_data.lat;
        let lon = city_data.lon;
        var marker_destination = L.marker(
            [lat,lon],
            {"id":city_id ,"city":city_name, "iata":station_iata}
        ).on('click', onClick).setOpacity(0.2);

        markers.push(marker_destination);
        //change when adapted to mobile website
        if (L.Browser.mobile) {
            var custom_icon = L.icon({"iconSize": [30,30], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }else{
            var custom_icon = L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }

        // create popup contents
        var customPopup = "<br>"+"<a id='html_'"+city_name+" href='destination.html?city="+city_id+"' target='_blank'>"+city_name+"</a><br/><img src='images/city/bg_"+city_id+".jpg' alt='maptime logo gif' width='150px' height='100px'/>";

        // specify popup options
        var customOptions =
            {
                'className' : 'popupCustom'
            }
        let temp = "NA";
        let url = "NA";

        marker_destination.on('popupopen', function (popup) {
            var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=%lat&lon=%lon&lang=fr&appid=5e0c07d2d939d7a1cbaadf4d6d0ee1bf&units=metric'.replace('%lat',lat.toString()).replace('%lon',lon.toString())
            $.getJSON(url, function(data){
                console.log(data);
                let url = 'https://openweathermap.org/img/wn/%s@2x.png'.replace('%s',(data['daily'][0]['weather'][0]['icon']).toString());
                let temp = Math.round(data['daily'][0]['temp']['day']);
                html = html +temp+'\°<img class="" id="icon_2" src='+url+' alt="">';
                marker_destination._popup.setContent(html)
            });
        });

        var html = '<a id="html_'+city_name+'" style="color:white;" href="destination.html?city='+city_name+'" target="_blank"">'+city_name+'</a><br/>'
            +'<img class="roundrect" src="images/city/bg_'+city_id+'.jpg" alt="maptime logo gif" width="145px" height="100px"/><br/>';

        marker_destination.bindPopup(html,customOptions);
        route.addLayer(marker_destination);
    }

    station = firebase.database().ref("city/station");

    station.once('value').then(function(datakey){
        let idx = 0;
        datakey.forEach(function(data){
            data.val().forEach(function (station) {
                add_station(idx,station,station.iata_code);
                cities.push(data.val()[0]);
            })
            idx = idx +1;
        });
        map.fitBounds(route.getBounds());
    });

    //Get connections

    var trip_durations = [];

    function getCityConnections(date,departure_iata,coords){
        var url = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
            '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
            '&refine.date=%date'.replace('%date',date)+ //format: YYYY-MM-DD
            '&refine.origine_iata=%departure'.replace('%departure',departure_iata);
        $.getJSON(url, function(data){
            //get data from
            let arrival_iatas = [];
            data.records.forEach(function(record){
                arrival_iatas.push(record.fields.destination_iata);
                trip_durations.push(calculateDuration(record.fields.heure_arrivee,record.fields.heure_depart));
            })

            return getStationsFromIatas(arrival_iatas,trip_durations,coords);

        })
    }

    function getStationsFromIatas(iata_list,trip_durations,coords){
        let stations = [];
        station.once("value", function(dataset) {
            dataset.forEach(function(childNodes){
                childNodes.val().forEach(function(station_data){
                    if(iata_list.includes(station_data.iata_code)){
                        if(stations.indexOf(station_data) == -1){
                            console.log('station found in list :'+station_data.city);
                            station_data.duration = trip_durations[iata_list.indexOf(station_data.iata_code)];
                            stations.push(station_data);
                        }
                    }
                })
            });
        }).then(function(){
            console.log(stations);
            if(slider != undefined){
                slider.remove();
            }
            stations.forEach(function(station){
                let current_coords = new Array();
                current_coords.push(coords[0])
                current_coords.push([station.lat,station.lon]);
                var polyline = new CustomPolyline(current_coords,{
                    color: 'black',
                    weight: 1,
                    opacity: 0.6,
                    duration: station.duration,
                    dashArray: '10, 10',
                    dashOffset: '0'
                });
                tmp_duration_list.push(station.duration);
                current_zone.addLayer(polyline);
                console.log(tmp_duration_list);
                route.eachLayer(function (layer) {
                    if (station.iata_code == layer.options.iata) {
                        console.log('found related marker');
                        layer.setOpacity(1);
                    }
                });
            })

            if(stations.length > 0){
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
                        let hours = Math.round(value/(60))
                        let minute = Math.round(Math.abs(value- hours*60));
                        let display = ("0" + hours).slice(-2)+"h"+("0" + minute).slice(-2)+"m";
                        return display;},
                    id: 'slider',
                    collapsed:false,
                    position:'bottomleft',
                    logo:''
                }).addTo(map);

                map.fitBounds(current_zone.getBounds());
            }
        });
    }

    //Calculate time duration in minutes
    function calculateDuration(start,end) {
        let start_m = Number(start.split(':')[0])*60 + Number(start.split(':')[1]);
        let end_m = Number(end.split(':')[0])*60 + Number(end.split(':')[1]);
        return Math.abs(start_m-end_m);
    }


});





