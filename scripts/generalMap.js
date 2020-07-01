//focus on station
function focus_station(city_id,route){
    route.eachLayer(function(layer){
        if(layer.options.id == city_id){
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

    let tickets_html = '<div  class="Content"><ul style="padding: 0;list-style-type:none;" id="tickets"></ul></div>'
    info_line.onAdd = function () {
        this._div = L.DomUtil.create('div','FixedHeightContainer');
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info_line.update = function (props) {
        this._div.innerHTML = tickets_html;
    };
    //check if container exist
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
        if (typeof tripLayer !== 'undefined') {
            tripLayer.clearLayers();
        }
        markerLayer.eachLayer(function (layer) {
            layer.setOpacity(0.2);
        });
        tmp_duration_list = [0];

        if(typeof previous_marker !== 'undefined'){
            var custom_icon = L.icon({"iconSize": [20,20], "iconUrl":"images/icons/placeholder.png"});
            previous_marker.setIcon(custom_icon);
        }
        //remove previous ticket folder by new click
        if($("#tickets").length !== 0){
            $("#tickets").remove();
        }
        //remove ticket container if exists
        if($(".FixedHeightContainer").length !== 0){
            $(".FixedHeightContainer").remove();
        }

        //remove previous lines
        tripLayer.eachLayer(function (layer) {
            layer.remove();
        });
    }

    // to restore marker to previous state when not used anymore
    var previous_marker = undefined;
    //retrieve map from global variable
    var map =  mapsPlaceholder[0];
 
    //work on change event
    $("#destination_select").change(function(event) {
        var id = $(this).children(":selected").attr("id");
        let city_id = id.replace(/\D/g,'');
        if (event.originalEvent !== undefined) {
            focus_station(city_id,markerLayer);
        }
    });

    $('#selected_date').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let weather_restriction = $("input[name='weather']:checked").attr("id");
        let time_restriction = $("input[name='time']:checked").attr("id");
        //remove previous tickets
        $("#tickets").empty();
        console.log(weather_restriction);
        console.log(time_restriction);
        if(typeof previous_marker !== 'undefined'){
            getCityConnections(query_date,previous_marker,weather_restriction,time_restriction);
        }
    });

    $('#time_buttons').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let weather_restriction = $("input[name='weather']:checked").attr("id");
        let time_restriction = $("input[name='time']:checked").attr("id");
        $("#tickets").empty();
        console.log(weather_restriction);
        console.log(time_restriction);
        if(typeof previous_marker !== 'undefined'){
            getCityConnections(query_date,previous_marker,weather_restriction,time_restriction);
        }
    });

    $('#weather_buttons').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let weather_restriction = $("input[name='weather']:checked").attr("id");
        let time_restriction = $("input[name='time']:checked").attr("id");
        $("#tickets").empty();
        console.log(weather_restriction);
        console.log(time_restriction);
        if(typeof previous_marker !== 'undefined'){
            getCityConnections(query_date,previous_marker,weather_restriction,time_restriction);
        }
    });

    $('#destination_select').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let weather_restriction = $("input[name='weather']:checked").attr("id");
        let time_restriction = $("input[name='time']:checked").attr("id");
        console.log(weather_restriction);
        console.log(time_restriction);
        getCityConnections(query_date,previous_marker,weather_restriction,time_restriction);
    });

    $('#toggle_tgv').change(function() {
        console.log('test')
        isEditable = $(this).prop('checked');
        map.closePopup();
        tripLayer.clearLayers();
        clear_selection();
        map.flyTo([46.1667,0.3333],6,{'animate':true});
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
            let weather_restriction = $("input[name='weather']:checked").attr("id");
            let time_restriction = $("input[name='time']:checked").attr("id");
            getCityConnections(query_date,query_marker,weather_restriction,time_restriction);
            //select city in tgv ticket form (when click is human made)
            if (event.originalEvent !== undefined) {
                $('#destination_select').val(event.sourceTarget.options.id).change();

            }
            //display ticket box
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
            }
        });

        let city_name = marker_destination.options.city;
        var html = '<a id="html_'+city_name+'" style="color:white;" href="destination.html?city='+city_name+'" target="_blank"">'+city_name+'</a><br/>'
            +'<img class="roundrect" src="images/city/bg_'+city_id+'.jpg" alt="maptime logo gif" width="145px" height="100px"/><br/>';

        marker_destination.bindPopup(html,infoPopupOptions);
        markerLayer.addLayer(marker_destination);
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
        map.fitBounds(markerLayer.getBounds());
    });

    //Get connections
    function getCityConnections(date,marker,weather_restriction,time_restriction){
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

                records.push(record.fields);
                arrival_iatas.push(record.fields.destination_iata);
                departure_times.push(record.fields.heure_depart);

            })

            return getStationsFromIatas(arrival_iatas,coords,departure_city,date,departure_iata,records,weather_restriction,time_restriction);
        })
    }

    //Calculate time duration in minutes
    function calculateDuration(start,end) {
        let start_m = Number(start.split(':')[0])*60 + Number(start.split(':')[1]);
        let end_m = Number(end.split(':')[0])*60 + Number(end.split(':')[1]);
        return Math.abs(start_m-end_m);
    }

    function createTrainlineLink(departure_time,departure_iata,arrival_iata){
        //build trainline link
        let link = "https://www.trainline.fr/search/%depiata/%arriata/%date"
            .replace('%depiata',departure_iata)
            .replace('%arriata',arrival_iata)
            .replace('%date',(departure_time).slice(-2));

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

    function getStationsFromIatas(iata_list,coords,departure_city,departure_time,departure_iata,records,weather_restriction,time_restriction){
        let trips = [];

        station.once("value", function(dataset) {
            dataset.forEach(function(childNodes){
                childNodes.val().forEach(function(station_data){
                    if(iata_list.includes(station_data.iata_code)){
                        var indexes = iata_list.reduce(function(a, e, i) {
                            if (e === station_data.iata_code)
                                a.push(i);
                            return a;
                        }, []).forEach(function(index){
                            let record = records[index];
                            let trip = {};
                            trip.day = record.date;
                            trip.departure_city = departure_city;
                            trip.departure_iata = record.origine_iata;
                            trip.departure_coords = [coords.lat,coords.lng];
                            trip.departure_time = record.heure_depart;
                            trip.arrival_city = station_data.city;
                            trip.arrival_id = childNodes.key; 
                            trip.arrival_iata = record.destination_iata;
                            trip.arrival_coords =[station_data.lat,station_data.lon];
                            trip.arrival_time = record.heure_arrivee;
                            trip.duration = calculateDuration(record.heure_arrivee,record.heure_depart);
                            //create empty array that may store way back
                            trip.return_trips = [];
                            trips.push(trip);
                        });
                    }
                })
            });
        }).then(function(){
            trips = trips.sort(compare);
            let previousid = undefined;
            
            trips.forEach(function(trip){
                //set up weather acceptance to true
                let accepted_weather = true;
                let identify_ticket = trip.departure_iata.toString()+trip.arrival_iata.toString()+trip.arrival_time.replace(':','')+trip.departure_time.replace(':','');
                console.log(identify_ticket);

                if($("#" + identify_ticket).length === 0) {
                     //WEATHER RESTRICTION
                    if(weather_restriction !== 'unknown_weather'){
                        console.log('Apply weather restriction...');
                        accepted_weather = acceptWeather(trip,weather_restriction);
                    }
                    //SCHEDULE RESTRICTION
                    if(time_restriction !== 'unknown_time'){
                        console.log('Apply schedule restriction...');
                        let from = trip.day.split("-");
                        var arrival_formatted_date = new Date(from[0], from[1] - 1, from[2],trip.arrival_time.split(':')[0],trip.arrival_time.split(':')[1])
                        time_restriction = time_restriction.replace('h','');
                        let shifted_date = arrival_formatted_date;
                        shifted_date.setHours(shifted_date.getHours() + Number(time_restriction));
                        let shifted_day_query = undefined;
                        if( shifted_date.getDay() < 10){
                            shifted_day_query = shifted_date.getFullYear()+'-'+("0" + (shifted_date.getMonth()+1)).slice(-2)+"-"+("0" + shifted_date.getDate()).slice(-2);
                        }else{
                            shifted_day_query = shifted_date.getFullYear()+'-'+("0" + (shifted_date.getMonth()+1)).slice(-2)+"-"+shifted_date.getDate();
                        }
                        
                        var return_query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
                            '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
                            '&refine.date=%date'.replace('%date',shifted_day_query)+ //format: YYYY-MM-DD
                            '&refine.origine_iata=%arrival'.replace('%arrival',trip.arrival_iata)+
                            '&refine.destination_iata=%departure'.replace('%departure',trip.departure_iata)
                        $.getJSON(return_query, function(response){
                            let isThereRecords = false;
                            response.records.forEach(function(record){
                                let from_return = record.fields.date.split("-");
                                var return_format_date = new Date(from_return[0], from_return[1] - 1, from_return[2],record.fields.heure_depart.split(':')[0],record.fields.heure_depart.split(':')[1]);
                                let difference_time = shifted_date.getTime() - return_format_date.getTime();
                                let isMatchingSlot = (difference_time > 0) && (difference_time < time_restriction *60*60*1000)
                                if(isMatchingSlot){
                                    console.log('Add return to given trip...');
                                    isThereRecords = true;
                                    let trip_back = {};
                                    trip_back.time = record.fields.date;
                                    trip_back.heure_depart = record.fields.heure_depart;
                                    trip_back.heure_arrivee = record.fields.heure_arrivee;
                                    trip_back.duration = calculateDuration(record.fields.heure_arrivee,record.fields.heure_depart);
                                    let processed_date = trip.day.toString()+'-'+trip_back.heure_depart.split(':')[0].toString()+':00';
                                    trip.return_trips.push(trip_back);
                                    let tl_return_url = createTrainlineLink(processed_date,trip.arrival_iata,trip.departure_iata);
                                    let return_html = undefined;
                                    console.log(shifted_day_query.split('-')[2]);
                                    console.log(trip.day.split('-')[2]);
                                    if(shifted_day_query.split('-')[2] !== trip.day.split('-')[2]){
                                        return_html = '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i><a href="'+tl_return_url+'" style=" text:right;color:white;" target="_blank""> %depart <i class="fas fa-angle-double-right"></i> %arrivee (+1)</a></p>'
                                        .replace('%depart',trip_back.heure_depart).replace('%arrivee',trip_back.heure_arrivee)
                                    }else{
                                        return_html = '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i><a href="'+tl_return_url+'" style=" text:right;color:white;" target="_blank""> %depart <i class="fas fa-angle-double-right"></i> %arrivee </a></p>'
                                        .replace('%depart',trip_back.heure_depart).replace('%arrivee',trip_back.heure_arrivee)
                                    }
                                    
                                    $("#back_"+identify_ticket).append(return_html);
                                    $('#panel').css('visibility', 'hidden');
                                }

                            })
                            if(time_restriction === '24'){
                                console.log('Check previous day...')
                                let previous_day = new Date(shifted_date.setDate(shifted_date.getDate()-1));
                                let date_previous_day_query = undefined;
                                if( shifted_date.getDay() < 10){
                                    date_previous_day_query = previous_day.getFullYear()+'-'+("0" + (previous_day.getMonth()+1)).slice(-2)+"-"+("0" + previous_day.getDate()).slice(-2);
                                }else{
                                    date_previous_day_query = previous_day.getFullYear()+'-'+("0" + (previous_day.getMonth()+1)).slice(-2)+"-"+previous_day.getDate();
                                }
                                var previous_day_query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
                                    '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
                                    '&refine.date=%date'.replace('%date',date_previous_day_query)+ //format: YYYY-MM-DD
                                    '&refine.origine_iata=%arrival'.replace('%arrival',trip.arrival_iata)+
                                    '&refine.destination_iata=%departure'.replace('%departure',trip.departure_iata);
                                $.getJSON(previous_day_query, function(response){
                                    response.records.forEach(function(record){
                                        let from_return = record.fields.date.split("-");
                                        var return_format_date = new Date(from_return[0], from_return[1] - 1, from_return[2],record.fields.heure_depart.split(':')[0],record.fields.heure_depart.split(':')[1]);
                                        let difference_time = shifted_date.getTime() - return_format_date.getTime();
                                        let isMatchingSlot = (difference_time > 0) && (difference_time < time_restriction *60*60*1000);
                                        if(isMatchingSlot){
                                            console.log('Add return to given trip...')
                                            isThereRecords = true;
                                            let trip_back = {};
                                            trip_back.time = record.fields.date;
                                            trip_back.heure_depart = record.fields.heure_depart;
                                            trip_back.heure_arrivee = record.fields.heure_arrivee;
                                            trip_back.duration = calculateDuration(record.fields.heure_arrivee,record.fields.heure_depart);
                                            let processed_date = trip.day+'-'+trip_back.heure_depart.split(':')[0]+':00';
                                            trip.return_trips.push(trip_back);
                                            let tl_return_url = createTrainlineLink(processed_date,trip.arrival_iata,trip.departure_iata);
                                            let return_html = undefined;
                                            return_html = '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i><a href="'+tl_return_url+'" style=" text:right;color:white;" target="_blank""> %depart <i class="fas fa-angle-double-right"></i> %arrivee </a></p>'
                                                .replace('%depart',trip_back.heure_depart).replace('%arrivee',trip_back.heure_arrivee);
                                            $("#back_"+identify_ticket).append(return_html);
                                        }
            
                                    });
                                });
                                
                            }
                            if(isThereRecords){
                                $('#btn_return_'+identify_ticket).show();
                            }
                        })
                    }
                    let current_coords = new Array();
                    current_coords.push(trip.departure_coords);
                    current_coords.push(trip.arrival_coords);
                    var polyline = new CustomPolyline(current_coords,{
                        id:identify_ticket,
                        color: 'black',
                        weight: 4,
                        opacity: 0.02,
                        duration: trip.duration,
                        dashArray: '10, 10',
                        dashOffset: '0'
                    });
                    tripLayer.addLayer(polyline);
                    //var polygon = getTripPolygon(trip.departure_coords,trip.arrival_coords);

                    let hours = Math.round(trip.duration/(60))
                    let minute = Math.round(Math.abs(trip.duration- hours*60));
                    let display = ("0" + hours).slice(-2)+"h"+("0" + minute).slice(-2)+"m";
                    let processed_date = trip.day.toString()+'-'+trip.departure_time.split(':')[0].toString()+':00';
                    let tl_url = createTrainlineLink(processed_date,trip.departure_iata,trip.arrival_iata);

                    let ticket_html = '<li><div id="' + identify_ticket + '" class="card card-custom text-white mb-3" style="width: 15rem; ">'
                        +'<div class="card-header p-0 my-auto"><i class="fas fa-angle-double-down"></i> %td | %d </div>'.replace('%d',trip.departure_city).replace('%td',trip.departure_time)
                        +'<div class="card-body p-0 my-auto">'
                        +'<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i> %time </p>'.replace('%time',display)
                        +'</div>'
                        +'<div class="card-footer p-0 my-auto"><i class="fas fa-angle-double-down"></i> %ta | %a | <a href="'.replace('%a',trip.arrival_city).replace('%ta',trip.arrival_time)+tl_url+'" style=" text:right;color:white;" target="_blank"">book ticket..</a></div> '
                        +'<div class="card-footer p-0 my-auto" id="heading_'+identify_ticket+'">'
                        +'<button class="btn btn-link p-0 my-auto text-white" id="btn_return_'+identify_ticket+'" data-toggle="collapse" data-target="#collapse_'+identify_ticket+'" aria-expanded="false" aria-controls="collapse_'+identify_ticket+'">' +
                        'return...' +
                        '</button>' +
                        '</div>'+
                        '<div id="collapse_'+identify_ticket+'" class="collapse p-0 my-auto" aria-labelledby="heading_'+identify_ticket+'">' +
                        '<div id="back_'+identify_ticket+'" class="card-body p-0 my-auto">';
                    ticket_html = ticket_html +
                        '</div>' +
                        '</div>'
                        +'</div></li>';

                
                    var anchored = false;
                    if(accepted_weather){
                        if(typeof previousid == 'undefined'){
                            $("#tickets").append(ticket_html);
                            $('#btn_return_'+identify_ticket).hide();
                        }else{
                            $(ticket_html).inserAfter('#'+previousid);
                            $('#btn_return_'+identify_ticket).hide();
                        }
                    }

                    tmp_duration_list.push(trip.duration);
                    
                
                    markerLayer.eachLayer(function (layer) {
                        if (trip.arrival_iata == layer.options.iata) {
                            layer.setOpacity(1);
                        }
                    });

                    $('#'+identify_ticket).bind('mouseover',function(){
                        tripLayer.eachLayer(function (layer) {
                            if(!anchored) {
                                if (layer.options.id == identify_ticket) {
                                    layer.setStyle({
                                        color: 'black',
                                        weight: 4,
                                        opacity: 0.02,
                                        duration: trip.duration,
                                        dashArray: '10, 10',
                                        dashOffset: '0'
                                    });
                                    $('#'+identify_ticket).css("background-color","#9d9efd");
                                }
                            }
                        });
                    });

                    $('#'+identify_ticket).bind('click',function(){
                        console.log('test click')
                        let oneTime = true;
                        tripLayer.eachLayer(function (layer) {
                            if (layer.options.id == identify_ticket && oneTime) {
                                oneTime = false;
                                console.log(layer.options.id);
                                console.log(layer)
                                console.log(anchored)
                                let center_x = (trip.departure_coords[0]+Number(trip.arrival_coords[0]))/2;
                                let center_y = (trip.departure_coords[1]+Number(trip.arrival_coords[1]))/2;
                                
                                if(typeof anchored == 'undefined'){
                                    anchored = true;
                                    
                                    $('#'+identify_ticket).css("background-color","#9d9efd");
                                    //fly to center of selected trip
                                    map.flyTo([center_x,center_y],6,{'animate':true});
                                }else{
                                    if(anchored){
                                        anchored = false;
                                        layer.setStyle({
                                            color: 'black',
                                            weight: 4,
                                            opacity: 0.02,
                                            duration: trip.duration,
                                            dashArray: '10, 10',
                                            dashOffset: '0'
                                        });
                                        $('#'+identify_ticket).css("background-color","#57587f");
                                    }else{
                                        anchored = true;
                                        layer.setStyle({
                                            color: 'red',
                                            weight: 4,
                                            opacity: 1,
                                            duration: trip.duration,
                                            dashArray: '10, 10',
                                            dashOffset: '0'
                                        });
                                        $('#'+identify_ticket).css("background-color","#9d9efd");
                                        tripLayer.eachLayer(function (previous_layer) {
                                            if (previous_layer.options.id == previousid) {
                                                previous_layer.setStyle({
                                                    color: 'black',
                                                    weight: 4,
                                                    opacity: 0.02,
                                                    duration: trip.duration,
                                                    dashArray: '10, 10',
                                                    dashOffset: '0'
                                                });
                                            }
                                        });
                                        $('#'+previousid).css("background-color","#57587f");
                                    }
                                    map.flyTo([center_x,center_y],7,{'animate':true});
                                    //map.fitBounds(layer.getBounds());
                                }
                                previousid = identify_ticket;
                            }
                        });
                    });

                    $('#'+identify_ticket).bind('mouseout',function(){
                        tripLayer.eachLayer(function (layer) {
                            let id = identify_ticket;
                            if (layer.options.id == id) {
                                if(!anchored){
                                    $('#'+identify_ticket).css("background-color","#57587f");
                                }
                            }
                        });
                    })
                }
               
            })
        });
    }
});





