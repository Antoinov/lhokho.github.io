

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

//focus on station
function focus_station(city_id,route){
    console.log('look for marker...')
    route.eachLayer(function(layer){
        if(layer.options.id == city_id){
            console.log('marker found...')
            layer.fire('click');
        }
    })
}

function buildQueryDate(date_datepicker){
    date = new Date(date_datepicker);

    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();

    let formatted_date = year+'-'+("0" + month).slice(-2)+'-'+("0" + day).slice(-2);

    return formatted_date;
}

function displayTickets(map){

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

$(document).ready(function(){

    function clear_selection(){
        if (typeof current_zone !== 'undefined') {
            current_zone.clearLayers();
        }
        route.eachLayer(function (layer) {
            layer.setOpacity(0.2);
        });
        tmp_duration_list = [0];
        if(typeof slider !== 'undefined'){
            slider.remove();
        }
        if(typeof previous_marker !== 'undefined'){
            if (isMobileDisplay) {
                var custom_icon = L.icon({"iconSize": [30,30], "iconUrl":"images/icons/placeholder.png"});
                previous_marker.setIcon(custom_icon);
            }else{
                var custom_icon = L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"});
                previous_marker.setIcon(custom_icon);
            }
        }
        //remove previous ticket folder by new click
        if($("#tickets").length !== 0){
            $("#tickets").remove();
        }
    }

    // to restore marker to previous state when not used anymore
    var previous_marker = undefined;
    var isEditable = false;
    //retrieve map from global variable
    var map =  mapsPlaceholder[0];
    //add feature groups
    var route = L.featureGroup().addTo(map);
    var current_zone = L.featureGroup().addTo(map);

    $("#destination_select").change(function() {
        var id = $(this).children(":selected").attr("id");
        let city_id = id.replace(/\D/g,'');
        focus_station(city_id);
    });

    $('#toggle_tgv').change(function() {
        console.log('test')
        isEditable = $(this).prop('checked');
        map.closePopup();
    });

    function onClick(event) {
        //check if tgv is toggled
        console.log(current_zone);
        let isActiveSearch = $('#toggle_tgv').prop('checked');
        //clear previous elements
        clear_selection();
        //make it visible
        event.sourceTarget.setOpacity(1);
        //store marker
        previous_marker = event.sourceTarget;
        //fly to selected marker
        map.flyTo(event.sourceTarget.getLatLng(),7,{'animate':true});
        let date = new Date();
        if(isActiveSearch){
            //close all popups
            event.target.closePopup();
            event.sourceTarget.setIcon(L.icon({"iconSize": [40,40], "iconUrl":"images/icons/station.png"}));
            //retrieve date from form
            let query_date = buildQueryDate($('#selected_date').val());
            let query_marker = event.sourceTarget;
            getCityConnections(query_date,query_marker);
            displayTickets(map);
        }
    }

    function add_station(city_id,city_data){
        var marker_destination = L.marker(
            [city_data.lat,city_data.lon],
            {"id":city_id ,"city":city_data.city, "iata":city_data.iata_code}
        ).on('click', onClick).setOpacity(0.2);

        marker_destination.on({
            click: function() {
                if($('#toggle_tgv').prop('checked')){
                    this.openPopup()
                }
            }
        })

        //change when adapted to mobile website
        if (L.Browser.mobile) {
            var custom_icon = L.icon({"iconSize": [30,30], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }else{
            var custom_icon = L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }

        // specify popup options
        var infoPopupOptions ={'className' : 'popupCustom'}

        marker_destination.on('popupopen', function (popup) {
            displayWeatherOnMap(map,marker_destination);
        });
        let city_name = marker_destination.options.city;
        var html = '<a id="html_'+city_name+'" style="color:white;" href="destination.html?city='+city_name+'" target="_blank"">'+city_name+'</a><br/>'
            +'<img class="roundrect" src="images/city/bg_'+city_id+'.jpg" alt="maptime logo gif" width="145px" height="100px"/><br/>';

        marker_destination.bindPopup(html,infoPopupOptions);
        route.addLayer(marker_destination);
    }

    station = firebase.database().ref("city/station");

    station.once('value').then(function(datakey){
        let idx = 0;
        datakey.forEach(function(data){
            data.val().forEach(function (station) {
                add_station(idx,station,station.iata_code);
            })
            idx = idx +1;
        });
        map.fitBounds(route.getBounds());
    });

    //Get connections

    var trip_durations = [];

    function getCityConnections(date,marker){
        //retrieve relevant data
        let coords = marker.getLatLng();
        let departure_city = marker.options.city;
        let departure_iata = marker.options.iata;
        //build sncf API query
        var query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
            '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
            '&refine.date=%date'.replace('%date',date)+ //format: YYYY-MM-DD
            '&refine.origine_iata=%departure'.replace('%departure',departure_iata);
        $.getJSON(query, function(response){
            //get data from
            let arrival_iatas = [];
            let departure_times = [];
            let records = [];
            response.records.forEach(function(record){
                console.log(record.fields);
                records.push(record.fields);
                arrival_iatas.push(record.fields.destination_iata);
                trip_durations.push(calculateDuration(record.fields.heure_arrivee,record.fields.heure_depart));
                departure_times.push(record.fields.heure_depart);
            })

            return getStationsFromIatas(arrival_iatas,trip_durations,coords,departure_city,date,departure_iata);
        })
    }

    function createTrainlineLink(departure_time,departure_iata,arrival_iata){

        let time = departure_time+'-06:00'; //by default, from 6am

        let link = "https://www.trainline.fr/search/%depiata/%arriata/%date"
            .replace('%depiata',departure_iata)
            .replace('%arriata',arrival_iata)
            .replace('%date',time);

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
            if(typeof slider !== 'undefined'){
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





