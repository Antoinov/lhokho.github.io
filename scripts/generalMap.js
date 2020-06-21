

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
    console.log('display tickets...');

    var info_line = L.control({
        position : 'bottomright'
    });

    let tickets_html = '<div id="tickets" class="Content"></div>'
    info_line.onAdd = function (map) {
        this._div = L.DomUtil.create('div','FixedHeightContainer');
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info_line.update = function (props) {
        this._div.innerHTML = tickets_html;
    };

    if($(".FixedHeightContainer").length === 0){
        //adding additional information embedded in the map
        info_line.addTo(map);
    }else{
        $('.FixedHeightContainer').remove();
        info_line.addTo(map);
    }
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
            let isActiveSearch = $('#toggle_tgv').prop('checked');
            if(!isActiveSearch){
                displayWeatherOnMap(map,marker_destination);
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
            }
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
                departure_times.push(record.fields.heure_depart);
            })

            return getStationsFromIatas(arrival_iatas,coords,departure_city,date,departure_iata,records);
        })
    }

    //Calculate time duration in minutes
    function calculateDuration(start,end) {
        let start_m = Number(start.split(':')[0])*60 + Number(start.split(':')[1]);
        let end_m = Number(end.split(':')[0])*60 + Number(end.split(':')[1]);
        return Math.abs(start_m-end_m);
    }

    function createTrainlineLink(departure_time,departure_iata,arrival_iata){

        let time = departure_time+'-06:00'; //by default, from 6am

        let link = "https://www.trainline.fr/search/%depiata/%arriata/%date"
            .replace('%depiata',departure_iata)
            .replace('%arriata',arrival_iata)
            .replace('%date',time);

        return link;
    }

    function compare( a, b ) {
        if ( a.duration < b.duration ){
            return -1;
        }
        if ( a.duration > b.duration ){
            return 1;
        }
        return 0;
    }

    function getStationsFromIatas(iata_list,coords,departure_city,departure_time,departure_iata,records){
        let trips = [];

        station.once("value", function(dataset) {
            dataset.forEach(function(childNodes){
                childNodes.val().forEach(function(station_data){
                    if(iata_list.includes(station_data.iata_code)){
                        var indexes = iata_list.reduce(function(a, e, i) {
                            console.log(e);
                            if (e === station_data.iata_code)
                                a.push(i);
                            return a;
                        }, []).forEach(function(index){
                            console.log('station found in list :'+station_data.city);
                            let record = records[index];
                            let trip = {};
                            trip.departure_city = departure_city;
                            trip.departure_iata = record.origine_iata;
                            trip.departure_coords = [coords.lat,coords.lng];
                            trip.departure_time = record.heure_depart;
                            trip.arrival_city = station_data.city;
                            trip.arrival_iata = record.destination_iata;
                            trip.arrival_coords =[station_data.lat,station_data.lon];
                            trip.arrival_time = record.heure_arrivee;
                            trip.duration = calculateDuration(record.heure_arrivee,record.heure_depart);
                            console.log(trip)
                            trips.push(trip);
                        });
                    }
                })
            });
        }).then(function(){
            if(typeof slider !== 'undefined'){
                slider.remove();
            }
            trips = trips.sort(compare);
            console.log(trips);
            let previousid = undefined;
            trips.forEach(function(trip){
                let current_coords = new Array();
                current_coords.push(trip.departure_coords);
                current_coords.push(trip.arrival_coords);
                console.log(trip.duration);
                var polyline = new CustomPolyline(current_coords,{
                    id:trip.departure_iata+trip.arrival_iata.toString()+trip.duration.toString(),
                    color: 'black',
                    weight: 4,
                    opacity: 0.6,
                    duration: trip.duration,
                    dashArray: '10, 10',
                    dashOffset: '0'
                });
                console.log(trip.duration);
                let hours = Math.round(trip.duration/(60))
                let minute = Math.round(Math.abs(trip.duration- hours*60));
                let display = ("0" + hours).slice(-2)+"h"+("0" + minute).slice(-2)+"m";

                let tl_url = createTrainlineLink(trip.departure_time,trip.departure_iata,trip.arrival_iata);

                let ticket_html = '<div id="'+trip.departure_iata+trip.arrival_iata+trip.duration+'" class="card card-custom text-white mb-3" style="width: 15rem; height: 5rem;">'
                    +'<div class="card-header p-0 my-auto"><i class="fas fa-angle-double-down"></i> %td | %d </div>'.replace('%d',trip.departure_city).replace('%td',trip.departure_time)
                    +'<div class="card-body p-0 my-auto">'
                    +'<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i> %time </p>'.replace('%time',display)
                    +'</div>'
                    +'<div class="card-footer p-0 my-auto"><i class="fas fa-angle-double-down"></i> %ta | %a | <a href="'.replace('%a',trip.arrival_city).replace('%ta',trip.arrival_time)+tl_url+'" style=" text:right;color:white;" target="_blank"">book ticket..</a></div> '
                    +'</div>';

                var anchored = false;
                if(typeof previousid == 'undefined'){
                    $("#tickets").append(ticket_html);
                }else{
                    $(ticket_html).inserAfter('#'+previousid);
                    previousid = trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.duration.toString();
                }


                tmp_duration_list.push(trip.duration);
                current_zone.addLayer(polyline);
                console.log(tmp_duration_list);
                route.eachLayer(function (layer) {
                    if (trip.iata_code == layer.options.iata) {
                        layer.setOpacity(1);
                    }
                });

                $('#'+trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.duration.toString()).bind('mouseover',function(){
                    current_zone.eachLayer(function (layer) {
                        if(!anchored) {
                            let id = trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.duration.toString();
                            if (layer.options.id == id) {
                                layer.setStyle({
                                    color: 'red',
                                    opacity: 1,
                                    weight: 6
                                });
                                $('#'+trip.departure_iata+trip.arrival_iata+trip.duration.toString()).css("background-color","#9d9efd");
                            }
                        }
                    });
                });

                $('#'+trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.duration.toString()).bind('click',function(){
                    current_zone.eachLayer(function (layer) {
                        console.log(layer);
                        let id = trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.duration.toString();
                        if (layer.options.id == id) {

                            let center_x = (trip.departure_coords[0]+Number(trip.arrival_coords[0]))/2;
                            let center_y = (trip.departure_coords[1]+Number(trip.arrival_coords[1]))/2;

                            if(typeof anchored == 'undefined'){
                                anchored = true;
                                layer.setStyle({
                                    color: 'red',
                                    opacity: 1,
                                    weight: 6
                                });
                                $('#'+trip.departure_iata+trip.arrival_iata+trip.duration.toString()).css("background-color","#9d9efd");
                                //fly to center of selected trip
                                map.flyTo([center_x,center_y],7,{'animate':true});
                            }else{
                                if(anchored){
                                    $('#'+trip.departure_iata+trip.arrival_iata+trip.duration.toString()).css("background-color","#57587f");
                                    layer.setStyle({
                                        color: 'black',
                                        weight: 4,
                                        opacity: 0.6,
                                        duration: trip.duration,
                                        dashArray: '10, 10',
                                        dashOffset: '0'
                                    });
                                    map.flyTo(trip.departure_coords,7,{'animate':true});
                                    anchored = false;
                                }else{
                                    anchored = true;
                                    layer.setStyle({
                                        color: 'red',
                                        opacity: 1,
                                        weight: 6
                                    });
                                    $('#'+trip.departure_iata+trip.arrival_iata+trip.duration.toString()).css("background-color","#9d9efd");
                                    console.log(trip.arrival_coords);
                                    map.flyTo([center_x,center_y],7,{'animate':true});
                                }
                            }
                        }
                    });
                });

                $('#'+trip.departure_iata+trip.arrival_iata+trip.duration.toString()).bind('mouseout',function(){
                    current_zone.eachLayer(function (layer) {
                        let id = trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.duration.toString();
                        if (layer.options.id == id) {
                            if(!anchored){
                                layer.setStyle({
                                    color: 'black',
                                    weight: 4,
                                    opacity: 0.6,
                                    duration: trip.duration,
                                    dashArray: '10, 10',
                                    dashOffset: '0'
                                });
                                $('#'+trip.departure_iata+trip.arrival_iata+trip.duration.toString()).css("background-color","#57587f");
                            }
                        }
                    });
                })


            })

            if(trips.length > 0){
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
});





