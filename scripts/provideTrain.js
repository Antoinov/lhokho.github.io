// Global variable to store tgv max trip
var last_checked_time = undefined;
var last_checked_trip_type = undefined;
var last_checked_trip_time = undefined;
var trips = [];
var stations = [];

$(document).ready(function(){
    station = firebase.database().ref("city/station");
    //default loading of next day trip
    var currentTime = new Date();
    station.once("value", function (dataset) {
        stations = dataset.val();
    }).then(function(){
        setTimeout(function () {
            getTrainRecords(buildQueryDate(currentTime));
        }, 500);
        
        //update trip on date change (MOVE TO GENERALMAP.JS)
        $('#selected_date').change(async function() {});
    });
});

// Get API SNCF records
async function getTrainRecords(date) {
    trips = [];
    last_checked_time = date;
    console.log("enter getTrainRecords method");
    var query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
        '&q=&rows=10000&sort=date&refine.od_happy_card=OUI' +
        '&refine.date=%date'.replace('%date', date); //format: YYYY-MM-DD
    $.ajaxSetup({
        async: false
    });
    $.getJSON(query, function (response) {
        response['records'].forEach(function(result){
            let trip = {};   
            //define trip date
            trip.day = result.fields.date;
            //gather departure data
            let departure_station = stations.reduce(function(acc, curr, index) {
                curr.forEach(function(stat){
                    if (stat.iata_code == result.fields.origine_iata) {
                        trip.departure_id = index;
                        acc.push(stat);
                    }
                })
                return acc;
            }, [])[0];
            if(typeof departure_station !== 'undefined'){
                trip.departure_city = departure_station.city;
                trip.departure_coords = [departure_station.lat, departure_station.lon];
                trip.departure_iata = result.fields.origine_iata;
                trip.departure_time = result.fields.heure_depart;
                //gather arrival data
                let arrival_station = stations.reduce(function(acc, curr, index) {
                    curr.forEach(function(stat){
                        if (stat.iata_code === result.fields.destination_iata) {
                            trip.arrival_id = index;
                            acc.push(stat);
                        }
                    })
                    return acc;
                }, [])[0];
                if(typeof arrival_station !== 'undefined'){
                    trip.arrival_city = arrival_station.city;
                    trip.arrival_iata = result.fields.destination_iata;
                    trip.arrival_coords = [arrival_station.lat, arrival_station.lon];
                    trip.arrival_iata = result.fields.destination_iata;
                    trip.arrival_time = result.fields.heure_arrivee;
                    //additional trip info
                    trip.duration = calculateDuration(result.fields.heure_depart,result.fields.heure_arrivee);
                    trip.nbStop = 0;
                    trips.push(trip);
                } else {console.log('Missing Arrival Station in DataBase : ', result.fields.destination_iata, ' - ', result.fields.destination)};
            } else {console.log('Missing Departure Station in DataBase : ', result.fields.origine_iata, ' - ', result.fields.origine,' - ', result.fields.code_equip, ' - ', result.fields.axe) };
        });
        return trips;
    });
};

function findTripsFromDepartureID(departure_id){
    return trips.filter(trip => trip.departure_id == departure_id);
}

function findTripsFromArrivalIata(arrival_iata){
    return trips.filter(trip => trip.arrival_iata == arrival_iata);
}

function findTrips(departure_iata,arrival_iata,nbStop){
    return trips.filter(trip => trip.departure_iata == departure_iata
        && trip.arrival_iata == arrival_iata
        && trip.nbStop == nbStop);
}

//Get connections
async function getCityConnections(date, marker,trip_type,time_restriction) {
    //retrieve relevant data
    let departure_id = marker.options.id;
    let direct_only = trip_type;
    //get direct trip
    let trips = findTripsFromDepartureID(departure_id)
    console.log(time_restriction);
    if (time_restriction != "unknown_trip" ) {trips = trips.filter(trip => trip.duration <= time_restriction)};
    var destination_list = [];
    trips.forEach(function(trip){
    let isIn = destination_list.includes(trip.arrival_id);
    if (isIn == false) {
            destination_list.push(trip.arrival_id);
            // console.log(destination_list)
    }});

    // get non direct trip if allowed
    if (direct_only === "indirect") {
       let all_indirect_trips = [];
       destination_list.forEach( await function(destination) {
       let indirect_trips = findTripsFromDepartureID(destination).filter(trip => trip.arrival_id != destination);
       let current = trips.filter(trip => trip.arrival_id == destination);
       current.forEach(function (trip) {
       let [hours, minutes] = trip.arrival_time.split(':');
       let dt1 = new Date();
       dt1.setHours(+hours);
       dt1.setMinutes(minutes);
       indirect_trips.forEach(function(indirect_trip){
            // Check if no better direct alternative
            let dt2 = new Date();
            let [hours, minutes] = indirect_trip.departure_time.split(':');
            dt2.setHours(+hours);
            dt2.setMinutes(minutes);
            // Difftime is the connection time
            let Difftime = Math.round((dt2.getTime() - dt1.getTime()) / 60000);
            if (Difftime > 10 && Difftime < 90) {
                   let dt3 = new Date();
                   let [hours, minutes] = indirect_trip.arrival_time.split(':');
                   dt3.setHours(+hours);
                   dt3.setMinutes(minutes);
                   let check = trips.filter(trip => trip.arrival_id == indirect_trip.arrival_id);
                   // console.log(check);
                   let alternative = false;
                   for (var i = 0 in check) {
                        let dt4 = new Date();
                        let [hours, minutes] = check[i].arrival_time.split(':');
                        dt4.setHours(+hours);
                        dt4.setMinutes(minutes);
                        if ((Math.abs(dt3.getTime() - dt4.getTime()) < 3600000)) {
                        // console.log('Better alternative found - Exit loop');
                        // console.log('alternative directe existante à : ', check[i].departure_city, '-', check[i].arrival_city, ' ', check[i].departure_time, '-', check[i].arrival_time, ' au lieu de : ', trip.departure_city, '-', indirect_trip.departure_city, '-', indirect_trip.arrival_city , ' ', trip.departure_time, '-', trip.arrival_time, '-', indirect_trip.departure_time, '-', indirect_trip.arrival_time);
                        alternative = true;
                        };
                        // console.log(alternative)
                        };
                        if (alternative == false) {
                        indirect_trip.origine = trip.departure_city;
                        indirect_trip.origine_id = trip.departure_id;
                        indirect_trip.origine_iata = trip.departure_iata;
                        indirect_trip.origine_departure = trip.departure_time;
                        indirect_trip.connection_arrival = trip.arrival_time;
                        indirect_trip.connection_iata = trip.arrival_iata;
                        indirect_trip.full_duration = indirect_trip.duration + trip.duration + Difftime;
                        indirect_trip.connection_time = Difftime;
                        if (time_restriction != "unknown_trip" ) {if (indirect_trip.full_duration <= time_restriction){all_indirect_trips.push(indirect_trip)}} else {all_indirect_trips.push(indirect_trip);};
                        // console.log(indirect_trip.arrival_city, ' depuis ', indirect_trip.departure_city, ' ', trip.departure_time,'-',trip.arrival_time,'-',indirect_trip.departure_time,'-',indirect_trip.arrival_time)
                        };
                   };
                   });
                   });
                   });
                   // console.log(all_indirect_trips);
                   await drawDirectTrip(trips);
                   await drawIndirectTrip(all_indirect_trips,destination_list)} else {await drawDirectTrip(trips)};

            };

async function drawIndirectTrip(indirect_trips,destination_list){
    console.log('Debut Exé DrawIndirect');
    //set up weather acceptance to true
    let accepted_weather = true;
    indirect_trips.forEach(function(indirect_trip){
        let isIn = destination_list.includes(indirect_trip.arrival_id);
        if (isIn == false) {
                destination_list.push(indirect_trip.arrival_id);
                // console.log(destination_list)
        };
        let identify_ticket = indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.departure_iata.toString() + indirect_trip.arrival_iata.toString() + indirect_trip.arrival_time.replace(':', '') + indirect_trip.origine_departure.replace(':', '');

    if ($("#" + identify_ticket).length === 0) {

        let current_coords = new Array();
        current_coords.push(indirect_trip.departure_coords);
        current_coords.push(indirect_trip.arrival_coords);
        var polyline = new CustomPolyline(current_coords, {
            id: identify_ticket,
            color: 'blue',
            weight: 2,
            opacity: 0.02,
            duration: indirect_trip.duration,
            dashArray: '10, 10',
            dashOffset: '0'
        });
        tripLayer.addLayer(polyline);
        //var polygon = getTripPolygon(trip.departure_coords,trip.arrival_coords);

        let hours = Math.round(indirect_trip.full_duration / (60))
        let minute = Math.round(Math.abs(indirect_trip.full_duration - hours * 60));
        let display = ("0" + hours).slice(-2) + "h" + ("0" + minute).slice(-2) + "m";
        let processed_date = indirect_trip.day.toString() + '-' + indirect_trip.origine_departure.split(':')[0].toString() + ':00';
        let tl_url = createTrainlineLink(processed_date, indirect_trip.origine_iata, indirect_trip.arrival_iata);

        let category_html = '<div class="card" id="' + indirect_trip.arrival_id + '">' +
                            '<img src="images/city/bg_'+ indirect_trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                            '<h5 class="card-img-overlay" role="tab" id="heading' + indirect_trip.arrival_id + '">' +
                            '<a class="collapsed d-block" data-toggle="collapse" data-parent="#tickets" href="#sub' + indirect_trip.arrival_id + '" aria-expanded="false">' +
                            '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + indirect_trip.arrival_city + '</p></a></h5><div class="card" id="sub' + indirect_trip.arrival_id + '"></div></div>'

        let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + indirect_trip.arrival_id + '">' +
                          '<div class="card-body" href="' + tl_url + '">' +
                          '<i class="fas fa-paper-plane"></i>' +
                          '<strong> %td </strong>| %tac <i class="fas fa-history"></i><br> %tdc | <strong>%ta </strong><br> ... via la belle ville de %sc pendant <strong>%tc min</strong> <br>'.replace('%td', indirect_trip.origine_departure).replace('%tac', indirect_trip.connection_arrival).replace('%sc', indirect_trip.departure_city).replace('%tc', indirect_trip.connection_time).replace('%tdc', indirect_trip.departure_time).replace('%ta', indirect_trip.arrival_time)+
                          'le tout en <strong> %d </strong>!'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>'
                          '</div></div>'

        if (isIn == false) {
            $("#tickets").append(category_html);
            $('#sub' + indirect_trip.arrival_id).append(ticket_html);
        } else {$('#sub' + indirect_trip.arrival_id).append(ticket_html)};

        tmp_duration_list.push(indirect_trip.duration);


        markerLayer.eachLayer(function (layer) {
            if (indirect_trip.arrival_iata == layer.options.iata) {
                layer.setOpacity(0.5);
            }
        });

    }
    });
console.log('Fin Exé DrawIndirect');}

async function drawDirectTrip(trips){
    console.log("Début Exé DrawDirect");
    var destination_list = [];
    trips.forEach(function(trip){
    let isIn = destination_list.includes(trip.arrival_id);
    if (isIn == false) {
            destination_list.push(trip.arrival_id);
            console.log(destination_list)
    };

    //set up weather acceptance to true
    let accepted_weather = true;
    let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
    if ($("#" + identify_ticket).length === 0) {

        let current_coords = new Array();
        current_coords.push(trip.departure_coords);
        current_coords.push(trip.arrival_coords);
        var polyline = new CustomPolyline(current_coords, {
            id: identify_ticket,
            color: 'black',
            weight: 4,
            opacity: 0.1,
            duration: trip.duration,
            dashArray: '10, 10',
            dashOffset: '0'
        });
        tripLayer.addLayer(polyline);
        //var polygon = getTripPolygon(trip.departure_coords,trip.arrival_coords);

        let hours = Math.round(trip.duration / (60))
        let minute = Math.round(Math.abs(trip.duration - hours * 60));
        let display = ("0" + hours).slice(-2) + "h" + ("0" + minute).slice(-2) + "m";
        let processed_date = trip.day.toString() + '-' + trip.departure_time.split(':')[0].toString() + ':00';
        let tl_url = createTrainlineLink(processed_date, trip.departure_iata, trip.arrival_iata);

        /*let content = '<li><div id="' + identify_ticket + '" class="card card-custom text-white mb-3" style="width: 15rem; ">' +
            '<div class="card-header p-0 my-auto"><i class="fas fa-angle-double-down"></i> %td | %d </div>'.replace('%d', trip.departure_city).replace('%td', trip.departure_time) +
            '<div class="card-body p-0 my-auto">' +
            '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i> %time </p>'.replace('%time', display) +
            '</div>' +
            '<div class="card-footer p-0 my-auto"><i class="fas fa-angle-double-down"></i> %ta | %a | <a href="'.replace('%a', trip.arrival_city).replace('%ta', trip.arrival_time) + tl_url + '" style=" text:right;color:white;" target="_blank"">book ticket..</a></div> ' +
            '<div class="card-footer p-0 my-auto" id="heading_' + identify_ticket + '">' +
            '<button class="btn btn-link p-0 my-auto text-white" id="btn_return_' + identify_ticket + '" data-toggle="collapse" data-target="#collapse_' + identify_ticket + '" aria-expanded="false" aria-controls="collapse_' + identify_ticket + '">' +
            'return...' +
            '</button>' +
            '</div>' +
            '<div id="collapse_' + identify_ticket + '" class="collapse p-0 my-auto" aria-labelledby="heading_' + identify_ticket + '">' +
            '<div id="back_' + identify_ticket + '" class="card-body p-0 my-auto">';
        ticket_html = ticket_html +
            '</div>' +
            '</div>' +
            '</div></li>';    */

        let category_html = '<div class="card" id="' + trip.arrival_id + '">' +
                            '<img src="images/city/bg_'+ trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                            '<h5 class="card-img-overlay" role="tab" id="heading' + trip.arrival_id + '">' +
                            '<a class="collapsed d-block" data-toggle="collapse" data-parent="#tickets" href="#sub' + trip.arrival_id + '" aria-expanded="false">' +
                            '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + trip.arrival_city + '</p></a></h5><div class="card" id="sub' + trip.arrival_id + '"></div></div>'
        let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.arrival_id + '">' +
                          '<div class="card-body" href="' + tl_url + '">' +
                          '<i class="fas fa-space-shuttle"></i>' +
                          '<strong> %td | %ta </strong>'.replace('%ta', trip.arrival_time).replace('%td', trip.departure_time) +
                          'en %d !'.replace('%d', display) +
                          '</div></div>'
        if (isIn == false) {
            $("#tickets").append(category_html);
            $('#sub' + trip.arrival_id).append(ticket_html);
        } else {$('#sub' + trip.arrival_id).append(ticket_html)};




        /*var anchored = false;
        if (typeof previousid == 'undefined') {
            $("#tickets").append(ticket_html);
            $('#btn_return_' + identify_ticket).hide();
        } else {
            $(ticket_html).inserAfter('#' + previousid);
            $('#btn_return_' + identify_ticket).hide();
        }*/

        tmp_duration_list.push(trip.duration);


        markerLayer.eachLayer(function (layer) {
            if (trip.arrival_iata == layer.options.iata) {
                layer.setOpacity(1);
            }
        });

        /*$('#' + identify_ticket).bind('mouseover', function () {
            tripLayer.eachLayer(function (layer) {
                if (!anchored) {
                    if (layer.options.id == identify_ticket) {
                        layer.setStyle({
                            color: 'black',
                            weight: 4,
                            opacity: 0.02,
                            duration: trip.duration,
                            dashArray: '10, 10',
                            dashOffset: '0'
                        });
                        $('#' + identify_ticket).css("background-color", "#9d9efd");
                    }
                }
            });
        });

        $('#' + identify_ticket).bind('click', function () {
            console.log('test click')
            let oneTime = true;
            tripLayer.eachLayer(function (layer) {
                if (layer.options.id == identify_ticket && oneTime) {
                    oneTime = false;
                    console.log(layer.options.id);
                    console.log(layer)
                    console.log(anchored)
                    let center_x = (trip.departure_coords[0] + Number(trip.arrival_coords[0])) / 2;
                    let center_y = (trip.departure_coords[1] + Number(trip.arrival_coords[1])) / 2;

                    if (typeof anchored == 'undefined') {
                        anchored = true;

                        $('#' + identify_ticket).css("background-color", "#9d9efd");
                        //fly to center of selected trip
                        map.flyTo([center_x, center_y], 6, {
                            'animate': true
                        });
                    } else {
                        if (anchored) {
                            anchored = false;
                            layer.setStyle({
                                color: 'black',
                                weight: 4,
                                opacity: 0.02,
                                duration: trip.duration,
                                dashArray: '10, 10',
                                dashOffset: '0'
                            });
                            $('#' + identify_ticket).css("background-color", "#57587f");
                        } else {
                            anchored = true;
                            layer.setStyle({
                                color: 'red',
                                weight: 4,
                                opacity: 1,
                                duration: trip.duration,
                                dashArray: '10, 10',
                                dashOffset: '0'
                            });
                            $('#' + identify_ticket).css("background-color", "#9d9efd");
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
                            $('#' + previousid).css("background-color", "#57587f");
                        }
                        map.flyTo([center_x, center_y], 7, {
                            'animate': true
                        });
                        //map.fitBounds(layer.getBounds());
                    }
                    previousid = identify_ticket;
                }
            });
        });

        $('#' + identify_ticket).bind('mouseout', function () {
            tripLayer.eachLayer(function (layer) {
                let id = identify_ticket;
                if (layer.options.id == id) {
                    if (!anchored) {
                        $('#' + identify_ticket).css("background-color", "#57587f");
                    }
                }
            });
        })*/
    }


// //WEATHER RESTRICTION
// if (weather_restriction !== 'unknown_weather') {
//     console.log('Apply weather restriction...');
//     accepted_weather = acceptWeather(trip, weather_restriction);
// }
// //SCHEDULE RESTRICTION
// if (time_restriction !== 'unknown_time') {
//     console.log('Apply schedule restriction...');
//     let from = trip.day.split("-");
//     var arrival_formatted_date = new Date(from[0], from[1] - 1, from[2], trip.arrival_time.split(':')[0], trip.arrival_time.split(':')[1])
//     time_restriction = time_restriction.replace('h', '');
//     let shifted_date = arrival_formatted_date;
//     shifted_date.setHours(shifted_date.getHours() + Number(time_restriction));
//     let shifted_day_query = undefined;
//     if (shifted_date.getDay() < 10) {
//         shifted_day_query = shifted_date.getFullYear() + '-' + ("0" + (shifted_date.getMonth() + 1)).slice(-2) + "-" + ("0" + shifted_date.getDate()).slice(-2);
//     } else {
//         shifted_day_query = shifted_date.getFullYear() + '-' + ("0" + (shifted_date.getMonth() + 1)).slice(-2) + "-" + shifted_date.getDate();
//     }

//     var return_query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
//         '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
//         '&refine.date=%date'.replace('%date', shifted_day_query) + //format: YYYY-MM-DD
//         '&refine.origine_iata=%arrival'.replace('%arrival', trip.arrival_iata) +
//         '&refine.destination_iata=%departure'.replace('%departure', trip.departure_iata)
//     $.getJSON(return_query, function (response) {
//         let isThereRecords = false;
//         response.records.forEach(function (record) {
//             let from_return = record.fields.date.split("-");
//             var return_format_date = new Date(from_return[0], from_return[1] - 1, from_return[2], record.fields.heure_depart.split(':')[0], record.fields.heure_depart.split(':')[1]);
//             let difference_time = shifted_date.getTime() - return_format_date.getTime();
//             let isMatchingSlot = (difference_time > 0) && (difference_time < time_restriction * 60 * 60 * 1000)
//             if (isMatchingSlot) {
//                 console.log('Add return to given trip...');
//                 isThereRecords = true;
//                 let trip_back = {};
//                 trip_back.time = record.fields.date;
//                 trip_back.heure_depart = record.fields.heure_depart;
//                 trip_back.heure_arrivee = record.fields.heure_arrivee;
//                 trip_back.duration = calculateDuration(record.fields.heure_arrivee, record.fields.heure_depart);
//                 let processed_date = trip.day.toString() + '-' + trip_back.heure_depart.split(':')[0].toString() + ':00';
//                 trip.return_trips.push(trip_back);
//                 let tl_return_url = createTrainlineLink(processed_date, trip.arrival_iata, trip.departure_iata);
//                 let return_html = undefined;
//                 console.log(shifted_day_query.split('-')[2]);
//                 console.log(trip.day.split('-')[2]);
//                 if (shifted_day_query.split('-')[2] !== trip.day.split('-')[2]) {
//                     return_html = '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i><a href="' + tl_return_url + '" style=" text:right;color:white;" target="_blank""> %depart <i class="fas fa-angle-double-right"></i> %arrivee (+1)</a></p>'
//                         .replace('%depart', trip_back.heure_depart).replace('%arrivee', trip_back.heure_arrivee)
//                 } else {
//                     return_html = '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i><a href="' + tl_return_url + '" style=" text:right;color:white;" target="_blank""> %depart <i class="fas fa-angle-double-right"></i> %arrivee </a></p>'
//                         .replace('%depart', trip_back.heure_depart).replace('%arrivee', trip_back.heure_arrivee)
//                 }

//                 $("#back_" + identify_ticket).append(return_html);
//                 $('#panel').css('visibility', 'hidden');
//             }

//         })
//         if (time_restriction === '24') {
//             console.log('Check previous day...')
//             let previous_day = new Date(shifted_date.setDate(shifted_date.getDate() - 1));
//             let date_previous_day_query = undefined;
//             if (shifted_date.getDay() < 10) {
//                 date_previous_day_query = previous_day.getFullYear() + '-' + ("0" + (previous_day.getMonth() + 1)).slice(-2) + "-" + ("0" + previous_day.getDate()).slice(-2);
//             } else {
//                 date_previous_day_query = previous_day.getFullYear() + '-' + ("0" + (previous_day.getMonth() + 1)).slice(-2) + "-" + previous_day.getDate();
//             }
//             var previous_day_query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
//                 '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
//                 '&refine.date=%date'.replace('%date', date_previous_day_query) + //format: YYYY-MM-DD
//                 '&refine.origine_iata=%arrival'.replace('%arrival', trip.arrival_iata) +
//                 '&refine.destination_iata=%departure'.replace('%departure', trip.departure_iata);
//             $.getJSON(previous_day_query, function (response) {
//                 response.records.forEach(function (record) {
//                     let from_return = record.fields.date.split("-");
//                     var return_format_date = new Date(from_return[0], from_return[1] - 1, from_return[2], record.fields.heure_depart.split(':')[0], record.fields.heure_depart.split(':')[1]);
//                     let difference_time = shifted_date.getTime() - return_format_date.getTime();
//                     let isMatchingSlot = (difference_time > 0) && (difference_time < time_restriction * 60 * 60 * 1000);
//                     if (isMatchingSlot) {
//                         console.log('Add return to given trip...')
//                         isThereRecords = true;
//                         let trip_back = {};
//                         trip_back.time = record.fields.date;
//                         trip_back.heure_depart = record.fields.heure_depart;
//                         trip_back.heure_arrivee = record.fields.heure_arrivee;
//                         trip_back.duration = calculateDuration(record.fields.heure_arrivee, record.fields.heure_depart);
//                         let processed_date = trip.day + '-' + trip_back.heure_depart.split(':')[0] + ':00';
//                         trip.return_trips.push(trip_back);
//                         let tl_return_url = createTrainlineLink(processed_date, trip.arrival_iata, trip.departure_iata);
//                         let return_html = undefined;
//                         return_html = '<p class="card-text text-white p-0 my-auto"><i class="fas fa-train"></i><a href="' + tl_return_url + '" style=" text:right;color:white;" target="_blank""> %depart <i class="fas fa-angle-double-right"></i> %arrivee </a></p>'
//                             .replace('%depart', trip_back.heure_depart).replace('%arrivee', trip_back.heure_arrivee);
//                         $("#back_" + identify_ticket).append(return_html);
//                     }

//                 });
//             });

//         }
//         if (isThereRecords) {
//             $('#btn_return_' + identify_ticket).show();
//         }
//     })
// }

     

});

console.log("Fin Exé DrawDirect");};

function getNonDirectTrip(departure_city, date, trips, indirect_list) {
    var indirect_trips = [];
    for (indirect_departure_iata of indirect_list.values()) {
        var query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
            '&q=&rows=10000&sort=date&facet=origine_iata&refine.od_happy_card=OUI' +
            '&refine.date=%date'.replace('%date', date) + //format: YYYY-MM-DD
            '&refine.origine_iata=%departure'.replace('%departure', indirect_departure_iata);
        console.log(indirect_departure_iata);
        $.ajaxSetup({
            async: false
        });
        $.getJSON(query).done(function (response) {
            console.log('API called')
            trips.forEach(function (trip) {
                var existing_direct_alternative = false
                // Sort the trips file to select only the trip from the selected destination
                if (trip.arrival_iata == indirect_departure_iata) {
                    let origin = trip.departure_iata
                    let [hours, minutes] = trip.arrival_time.split(':');
                    var dt1 = new Date();
                    dt1.setHours(+hours);
                    dt1.setMinutes(minutes);
                    // Find the potential connections from this destination
                    response.records.forEach(function (record) {
                        if (record.fields.destination_iata != origin) {
                            var dt2 = new Date();
                            let [hours, minutes] = record.fields.heure_depart.split(':');
                            dt2.setHours(+hours);
                            dt2.setMinutes(minutes);
                            // Difftime is the connection time
                            let Difftime = Math.round((dt2.getTime() - dt1.getTime()) / 60000)
                            // Loop into the direct trip to check if there is no better direct alternative.
                            trips.forEach(function (temp_trip) {
                                if (record.fields.destination_iata == temp_trip.arrival_iata && Difftime > 15 && Difftime < 90) {
                                    let dt3 = new Date();
                                    let [hours, minutes] = record.fields.heure_arrivee.split(':');
                                    dt3.setHours(+hours);
                                    dt3.setMinutes(minutes);
                                    let dt4 = new Date();
                                    let [fromage, coulis] = temp_trip.arrival_time.split(':');
                                    dt4.setHours(+fromage);
                                    dt4.setMinutes(coulis);
                                    if (((Math.abs(dt3.getTime() - dt4.getTime())) / 60000) < 60) {
                                        console.log('alternative directe existante à : ', temp_trip.departure_city, '-', temp_trip.arrival_city, ' ', temp_trip.departure_time, '-', temp_trip.arrival_time, ' au lieu de : ', trip.departure_city, '-', record.fields.origine, '-', record.fields.destination, ' ', trip.departure_time, '-', trip.arrival_time, '-', record.fields.heure_depart, '-', record.fields.heure_arrivee);
                                        existing_direct_alternative = true
                                    };
                                    console.log(existing_direct_alternative);
                                }
                            })
                            // Get connection trip details if the conditions are reached
                            if (Difftime > 15 && Difftime < 90 && existing_direct_alternative == false) {
                                // Check in firebase to collect the informations on the new reachable destination (with connection)
                                station.once("value", function (dataset) {
                                    dataset.forEach(function (childNodes) {
                                        childNodes.val().forEach(function (station_data) {
                                            if (record.fields.destination_iata == station_data.iata_code) {
                                                let indirect_trip = {};
                                                indirect_trip.day = dt2;
                                                indirect_trip.departure_city = departure_city;
                                                indirect_trip.departure_iata = origin;
                                                indirect_trip.departure_coords = trip.departure_coords;
                                                indirect_trip.departure_time = trip.departure_time;
                                                indirect_trip.connection_city = trip.arrival_city;
                                                indirect_trip.connection_iata = trip.arrival_iata;
                                                indirect_trip.connection_coords = trip.arrival_coords;
                                                indirect_trip.connection_arrival = trip.arrival_time;
                                                indirect_trip.connection_departure = record.fields.heure_depart;
                                                indirect_trip.connection_time = Difftime;
                                                indirect_trip.arrival_city = station_data.city;
                                                indirect_trip.arrival_id = childNodes.key;
                                                indirect_trip.arrival_iata = record.fields.destination_iata;
                                                indirect_trip.arrival_coords = [station_data.lat, station_data.lon];
                                                indirect_trip.arrival_time = record.fields.heure_arrivee;
                                                indirect_trip.duration = calculateDuration(record.fields.heure_arrivee, trip.departure_time);
                                                // console.log(indirect_trip)
                                                indirect_trips.push(indirect_trip);
                                            }
                                        });
                                    })
                                });
                            } else {
                                console.log('connection impossible')
                            }
                        }
                    })
                }
            })
        })

    }
    return indirect_trips;
}

function createTrainlineLink(departure_time,departure_iata,arrival_iata){
        //build trainline link
        let link = "https://www.trainline.fr/search/%depiata/%arriata/%date"
            .replace('%depiata',departure_iata)
            .replace('%arriata',arrival_iata)
            .replace('%date',(departure_time));

        return link;
    }