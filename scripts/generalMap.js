$(document).ready(function(){
    var cities = [];
    // to restore marker to previous state when not used anymore
    var previous_marker = undefined;
    var isEditable = false;

    var map =  mapsPlaceholder[0];

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
            if(layer.options.id == city_id){
                console.log('marker found...')
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

    function onClick(e) {
        let isActiveSearch = $('#toggle_tgv').prop('checked');
        clear_selection();
        if(previous_marker !== undefined){
            previous_marker.setIcon(L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"}))
        }
        if(isActiveSearch){
            console.log(e.sourceTarget._popup);
            $(".leaflet-popup-close-button").click()
            map.eachLayer(function (layer) {
                layer.closePopup();
            });
            map.closePopup();
            e.target.closePopup();
            e.sourceTarget.setIcon(L.icon({"iconSize": [40,40], "iconUrl":"images/icons/station.png"}));
        }
        //store marker
        previous_marker = e.sourceTarget;
        e.sourceTarget.setOpacity(1);

        //Get latlng from first marker
        let coordinates = new Array();

        coordinates.push(e.sourceTarget.getLatLng());
        map.flyTo(e.sourceTarget.getLatLng(),7,{'animate':true});
        console.log(e.sourceTarget.options);
        let date = new Date();
        if(isActiveSearch){
            e.sourceTarget.closePopup();
            date = new Date($('#selected_date').val());
            day = date.getDate();
            month = date.getMonth() + 1;
            year = date.getFullYear();
            let date_str = year+'-'+("0" + month).slice(-2)+'-'+("0" + day).slice(-2);
            getCityConnections(date_str,e.sourceTarget.options.iata,e.sourceTarget.options.city,coordinates);
            //Remove previous tickets folder if exists
            if($("#tickets").length !== 0){
                $("#tickets").remove();
            }
            let tickets_html = '<div id="tickets" class="Content"></div>'
            //adding additional information embedded in the map

            if(info_line !== undefined){
                info_line.remove();
            }

            var info_line = L.control({
                position : 'bottomright'
            });

            info_line.onAdd = function (map) {
                this._div = L.DomUtil.create('div','FixedHeightContainer'); // create a div
                this.update();
                return this._div;
            };

            // method that we will use to update the control based on feature properties passed
            info_line.update = function (props) {
                this._div.innerHTML = tickets_html;
            };

            info_line.addTo(map);
        }
    }

    $('#toggle_tgv').change(function() {
        isEditable = $(this).prop('checked');
        map.closePopup();
    })

    function add_station(city_id,city_data,station_iata){
        let city_name = city_data.city;
        let lat = city_data.lat;
        let lon = city_data.lon;
        var marker_destination = L.marker(
            [lat,lon],
            {"id":city_id ,"city":city_name, "iata":station_iata}
        ).on('click', onClick).setOpacity(0.2);

        marker_destination.on({
            click: function() {
                if($('#toggle_tgv').prop('checked')){
                    this.openPopup()
                }
            }
        })

        markers.push(marker_destination);
        //change when adapted to mobile website
        if (L.Browser.mobile) {
            var custom_icon = L.icon({"iconSize": [30,30], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }else{
            var custom_icon = L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }

        // specify popup options
        var customOptions =
            {
                'className' : 'popupCustom'
            }

        const delay = ms => new Promise(res => setTimeout(res, ms));

        marker_destination.on('popupopen', function (popup) {
            var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=%lat&lon=%lon&lang=fr&appid=5e0c07d2d939d7a1cbaadf4d6d0ee1bf&units=metric'.replace('%lat',lat.toString()).replace('%lon',lon.toString())
            $.getJSON(url, function(data){
                if(popup)
                console.log(data);
                let url1 = 'https://openweathermap.org/img/wn/%s.png'.replace('%s',(data['daily'][0]['weather'][0]['icon']).toString());
                let url2 = 'https://openweathermap.org/img/wn/%s.png'.replace('%s',(data['daily'][1]['weather'][0]['icon']).toString());
                let url3 = 'https://openweathermap.org/img/wn/%s.png'.replace('%s',(data['daily'][2]['weather'][0]['icon']).toString());
                let temp = '   '+Math.round(data['daily'][0]['temp']['day'])+'   ';
                html = '<a id="html_'+city_id+'" style="color:white;" href="destination.html?city='+city_id+'" target="_blank"">'+city_name+'</a><br/>'+ temp+'\°  <br/>'
                    +'<img class="roundrect" src="images/city/bg_'+city_id+'.jpg" alt="maptime logo gif" width="145px" height="90px"/><br/>';
                let html_base = html
                    +'<img class="" id="icon_1" src='+url1+' alt="" width="45px">|<img class="" id="icon_2" src='+url2+' alt="" width="45px">|<img class="" id="icon_3" src='+url3+' alt="" width="45px"><br/>';
                let html_weather = html_base + '<a id="bar_'+city_id+'" href="#" style="color:white;"">more...</a>';
                marker_destination._popup.setContent(html_weather)
                $( "#bar_"+city_id ).bind( "click", function() {
                    map.flyTo(marker_destination.getLatLng(),15,{'easeLinearity':1.0});
                    marker_destination.setIcon(L.icon({"iconSize": [40,40], "iconUrl":"images/icons/station.png"}));
                    map.closePopup();
                    //var static = new L.Layer.StaticOverlay().addTo(map);
                    const builder = async () => {
                        await delay(5000);
                        console.log("load bar data...");
                        buildBarLayer(marker_destination.getLatLng(),city_id,html_base);
                    };
                    builder();
                });
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

    function getCityConnections(date,departure_iata,departure_city,coords){
        var url = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
            '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
            '&refine.date=%date'.replace('%date',date)+ //format: YYYY-MM-DD
            '&refine.origine_iata=%departure'.replace('%departure',departure_iata);
        $.getJSON(url, function(data){
            //get data from
            let arrival_iatas = [];
            let departure_times = [];
            data.records.forEach(function(record){
                arrival_iatas.push(record.fields.destination_iata);
                trip_durations.push(calculateDuration(record.fields.heure_arrivee,record.fields.heure_depart));
                departure_times.push(record.fields.heure_depart);
            })

            return getStationsFromIatas(arrival_iatas,trip_durations,coords,departure_city,date,departure_iata);

        })
    }
    function populateTripData(station){

    }

    function createTrainlineLink(departure_time,departure_iata,arrival_iata){

        let time = departure_time+'-06:00'; //by default, from 6am

        let link = "https://www.trainline.fr/search/%depiata/%arriata/%date"
            .replace('%depiata',departure_iata)
            .replace('%arriata',arrival_iata)
            .replace('%date',time);

        console.log(link);

        return link;
    }

    function getStationsFromIatas(iata_list,trip_durations,coords,departure_city,departure_time,departure_iata){
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
            if(slider !== undefined){
                slider.remove();
            }
            stations.forEach(function(station){
                let current_coords = new Array();
                current_coords.push(coords[0])
                current_coords.push([station.lat,station.lon]);
                console.log(station);
                var polyline = new CustomPolyline(current_coords,{
                    color: 'black',
                    weight: 4,
                    opacity: 0.6,
                    duration: station.duration,
                    dashArray: '10, 10',
                    dashOffset: '0'
                });
                let hours = Math.round(station.duration/(60))
                let minute = Math.round(Math.abs(station.duration- hours*60));
                let display = ("0" + hours).slice(-2)+"h"+("0" + minute).slice(-2)+"m";

                let tl_url = createTrainlineLink(departure_time,departure_iata,station.iata_code);

                let ticket_html = '<div id="'+departure_iata+station.iata_code+'" class="card card-custom text-white mb-3" style="width: 15rem; height: 7rem;">'
                    +'<div class="card-header">%d &rarr; %a </div>'.replace('%d',departure_city).replace('%a',station.city)
                    +'<div class="card-body">'
                    +'<p class="card-text text-white"><i class="fas fa-train"></i> %time </br><a href="'.replace('%time',display)+tl_url+'" style="color:white;" target="_blank"">book ticket..</a> </p>'
                    +'</div>'
                    +'</div>';

                ticket_html.anchored = false;

                polyline.on('mouseover', function(e) {
                    var layer = e.target;
                    layer.setStyle({
                        color: 'red',
                        opacity: 1,
                        weight: 6
                    });
                    $("#tickets").append(ticket_html);
                });

                polyline.on('click', function(e) {
                    var layer = e.target;
                    layer.setStyle({
                        color: 'red',
                        opacity: 1,
                        weight: 6
                    });
                    ticket_html.anchored = true;
                    $("#tickets").append(ticket_html);
                });

                polyline.on('mouseout', function(e) {
                    var layer = e.target;
                    if(!ticket_html.anchored){
                        layer.setStyle({
                            color: 'black',
                            weight: 1,
                            opacity: 0.6,
                            duration: station.duration,
                            dashArray: '10, 10',
                            dashOffset: '0'
                        });
                        $("#"+departure_iata+station.iata_code).remove();
                    }
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
                    value: Math.round(Math.max(...tmp_duration_list)),
                    step:Math.round(Math.abs(Math.round(Math.max(...tmp_duration_list))-Math.round(Math.min(...tmp_duration_list)))/10),
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





