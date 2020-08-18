// Global variable to store tgv max trip
var last_checked_time = undefined;
var last_checked_return = undefined;
var last_checked_trip_type = undefined;
var last_checked_trip_time = undefined;
var last_checked_journey_type = undefined;
var trips = [];
var stations = [];
var mobile = false;


$(document).ready(function(){
    station = firebase.database().ref("city/station");
    //default loading of next day trip
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate() + 1)
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

async function getReturnRecords(date) {
    return_base = [];
    last_checked_return = date;
    console.log("enter getTrainRecords method");
    var query = 'https://data.sncf.com/api/records/1.0/search/?dataset=tgvmax' +
        '&q=&rows=10000&sort=date&refine.od_happy_card=OUI' +
        '&refine.date=%date'.replace('%date', date) //format: YYYY-MM-DD
    $.ajaxSetup({
        async: false
    });
    $.getJSON(query, function (response) {
        response['records'].forEach(function(result){
            let ret = {};
            //define trip date
            ret.day = result.fields.date;
            //gather departure data
            let departure_station = stations.reduce(function(acc, curr, index) {
                curr.forEach(function(stat){
                    if (stat.iata_code == result.fields.origine_iata) {
                        ret.departure_id = index;
                        acc.push(stat);
                    }
                })
                return acc;
            }, [])[0];
            if(typeof departure_station !== 'undefined'){
                ret.departure_city = departure_station.city;
                ret.departure_coords = [departure_station.lat, departure_station.lon];
                ret.departure_iata = result.fields.origine_iata;
                ret.departure_time = result.fields.heure_depart;
                //gather arrival data
                let arrival_station = stations.reduce(function(acc, curr, index) {
                    curr.forEach(function(stat){
                        if (stat.iata_code === result.fields.destination_iata) {
                            ret.arrival_id = index;
                            acc.push(stat);
                        }
                    })
                    return acc;
                }, [])[0];
                if(typeof arrival_station !== 'undefined'){
                    ret.arrival_city = arrival_station.city;
                    ret.arrival_iata = result.fields.destination_iata;
                    ret.arrival_coords = [arrival_station.lat, arrival_station.lon];
                    ret.arrival_iata = result.fields.destination_iata;
                    ret.arrival_time = result.fields.heure_arrivee;
                    //additional trip info
                    ret.duration = calculateDuration(result.fields.heure_depart,result.fields.heure_arrivee);
                    ret.nbStop = 0;
                    return_base.push(ret);
                } else {console.log('Missing Arrival Station in DataBase : ', result.fields.destination_iata, ' - ', result.fields.destination)};
            } else {console.log('Missing Departure Station in DataBase : ', result.fields.origine_iata, ' - ', result.fields.origine,' - ', result.fields.code_equip, ' - ', result.fields.axe) };
        });

        return return_base;

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

//Get connections (One way)
async function getCityConnections(date, marker,trip_type,time_restriction) {
    if (L.Browser.mobile) {
        $('#sidebarCollapse').click();
    }
    //retrieve relevant data
    let departure_id = marker.options.id;
    let control_trip_type = trip_type;
    //get direct trip
    let trips = findTripsFromDepartureID(departure_id);
    if (time_restriction != "unknown_trip" ) {trips = trips.filter(trip => trip.duration <= time_restriction)};
    var destination_list = [];
    trips.forEach(function(trip){
    let isIn = destination_list.includes(trip.arrival_id);
    if (isIn == false) {
            destination_list.push(trip.arrival_id);
            // console.log(destination_list)
    }});
    // get non direct trip if allowed
    if (control_trip_type === "indirect") {
        let all_indirect_trips = [];
        destination_list.forEach( await function(destination) {
            let indirect_trips = findTripsFromDepartureID(destination).filter(trip => trip.arrival_id != departure_id);
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
                        for (let i in check) {
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
                            indirect_trip.origine_coords = trip.departure_coords;
                            indirect_trip.connection_arrival = trip.arrival_time;
                            indirect_trip.connection_iata = trip.arrival_iata;
                            indirect_trip.full_duration = indirect_trip.duration + trip.duration + Difftime;
                            indirect_trip.connection_time = Difftime;
                            if (time_restriction != "unknown_trip" ) {
                                if (indirect_trip.full_duration <= time_restriction){
                                    all_indirect_trips.push(indirect_trip)}
                            } else {
                                all_indirect_trips.push(indirect_trip);
                            }
                        }
                    }
                });
            });
        });
        await drawDirectTrip(trips,false);
        await drawIndirectTrip(all_indirect_trips,destination_list,true);
    } else {
        await drawDirectTrip(trips,true);
    }
}

async function getRoundTrip(marker, trip_type, time_restriction, return_option) {
    if (L.Browser.mobile) {$('#sidebarCollapse').click();}
    //retrieve relevant data
    let departure_id = marker.options.id;
    let departure_iata = marker.options.iata;
    let direct_only = trip_type;
    //get direct trip
    let trips = findTripsFromDepartureID(departure_id);
    if (time_restriction != "unknown_trip" ) {trips = trips.filter(trip => trip.duration <= time_restriction)};
    var destination_list = [];
    var temp_destination_list = [];
    trips.forEach(function(trip){
        let isIn = destination_list.includes(trip.arrival_id);
        if (isIn == false) {
            destination_list.push(trip.arrival_id);
            temp_destination_list.push(trip.arrival_id);
            // console.log(destination_list)
        }});
    // get non direct trip if allowed
    if (direct_only == 'indirect') {
        var all_indirect_trips = [];
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
                        for (let i in check) {
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
                            indirect_trip.origine_coords = trip.departure_coords;
                            indirect_trip.connection_arrival = trip.arrival_time;
                            indirect_trip.connection_iata = trip.arrival_iata;
                            indirect_trip.full_duration = indirect_trip.duration + trip.duration + Difftime;
                            indirect_trip.connection_time = Difftime;
                            if (time_restriction != "unknown_trip" ) {
                                if (indirect_trip.full_duration <= time_restriction){
                                    all_indirect_trips.push(indirect_trip);
                                }
                            } else {
                                all_indirect_trips.push(indirect_trip);
                            }
                            // console.log(indirect_trip.arrival_city, ' depuis ', indirect_trip.departure_city, ' ', trip.departure_time,'-',trip.arrival_time,'-',indirect_trip.departure_time,'-',indirect_trip.arrival_time)
                        }
                    }
                });
            });
        });
        // Concatenate all direct/indirect destination for return calculation
        var temp_destination_list = destination_list.slice();
        all_indirect_trips.forEach(function(trip){
            let isIn = destination_list.includes(trip.arrival_id);
            if (isIn == false) {
                destination_list.push(trip.arrival_id);
            }})
    }

    let oneday_trips = [];
    if (return_option == 'short_journey') {
        destination_list.forEach(function (destination) {
            let first_legs = trips.filter(trip => trip.arrival_id == destination)
            let second_legs = findTripsFromDepartureID(destination).filter(trip => trip.arrival_id == departure_id);
            if (time_restriction != "unknown_trip" ) {second_legs = second_legs.filter(trip => trip.duration <= time_restriction)};
            first_legs.forEach(function (first_leg) {
                let [hours, minutes] = first_leg.arrival_time.split(':');
                let dt1 = new Date();
                dt1.setHours(+hours);
                dt1.setMinutes(minutes);
                second_legs.forEach(function (second_leg) {
                    let [hours, minutes] = second_leg.departure_time.split(':');
                    let dt2 = new Date();
                    dt2.setHours(+hours);
                    dt2.setMinutes(minutes);
                    let TravelTime = Math.round((dt2.getTime() - dt1.getTime()) / 60000);
                    if (TravelTime >= 120 ) {
                        first_leg.sl_departure_id = second_leg.departure_id;
                        first_leg.sl_departure_iata = second_leg.departure_iata;
                        first_leg.sl_departure_time = second_leg.departure_time;
                        first_leg.sl_arrival_id = second_leg.arrival_id;
                        first_leg.sl_arrival_iata = second_leg.arrival_iata;
                        first_leg.sl_arrival_time = second_leg.arrival_time;
                        first_leg.sl_duration = second_leg.duration;
                        first_leg.travel_time = first_leg.duration + second_leg.duration;
                        first_leg.time_on_site = TravelTime;
                        if (first_leg.travel_time < 1200) {oneday_trips.push(first_leg)}
                    }
                })
            })
        });
        oneday_trips = new Set(oneday_trips);
        drawOneDayTrip(oneday_trips,true);
    }
    else {if(return_option == 'medium_journey') {
        destination_list.forEach(function (destination) {
            let first_legs = trips.filter(trip => trip.arrival_id == destination)
            let second_legs = findTripsFromDepartureID(destination).filter(trip => trip.arrival_id == departure_id);
            if (time_restriction != "unknown_trip" ) {second_legs = second_legs.filter(trip => trip.duration <= time_restriction)};
            first_legs.forEach(function (first_leg) {
                let [hours, minutes] = first_leg.arrival_time.split(':');
                let dt1 = new Date();
                dt1.setHours(+hours);
                dt1.setMinutes(minutes);
                second_legs.forEach(function (second_leg) {
                    let [hours, minutes] = second_leg.departure_time.split(':');
                    let dt2 = new Date();
                    dt2.setHours(+hours);
                    dt2.setMinutes(minutes);
                    let TravelTime = Math.round((dt2.getTime() - dt1.getTime()) / 60000);
                    if (TravelTime >= 240) {
                        first_leg.sl_departure_id = second_leg.departure_id;
                        first_leg.sl_departure_iata = second_leg.departure_iata;
                        first_leg.sl_departure_time = second_leg.departure_time;
                        first_leg.sl_arrival_id = second_leg.arrival_id;
                        first_leg.sl_arrival_iata = second_leg.arrival_iata;
                        first_leg.sl_arrival_time = second_leg.arrival_time;
                        first_leg.sl_duration = second_leg.duration;
                        first_leg.travel_time = first_leg.duration + second_leg.duration;
                        first_leg.time_on_site = TravelTime;
                        if (first_leg.travel_time < 1200) {oneday_trips.push(first_leg)}
                    }
                })
            })
        });
        oneday_trips = new Set(oneday_trips);
        drawOneDayTrip(oneday_trips,true);
    }
    else {
        if(return_option === 'long_journey') {
        destination_list.forEach(function (destination) {
            let first_legs = trips.filter(trip => trip.arrival_id == destination)
            let second_legs = findTripsFromDepartureID(destination).filter(trip => trip.arrival_id == departure_id);
            if (time_restriction != "unknown_trip" ) {second_legs = second_legs.filter(trip => trip.duration <= time_restriction)};
            first_legs.forEach(function (first_leg) {
                let [hours, minutes] = first_leg.arrival_time.split(':');
                let dt1 = new Date();
                dt1.setHours(+hours);
                dt1.setMinutes(minutes);
                second_legs.forEach(function (second_leg) {
                    let [hours, minutes] = second_leg.departure_time.split(':');
                    let dt2 = new Date();
                    dt2.setHours(+hours);
                    dt2.setMinutes(minutes);
                    let TravelTime = Math.round((dt2.getTime() - dt1.getTime()) / 60000);
                    if (TravelTime >= 360) {
                        first_leg.sl_departure_id = second_leg.departure_id;
                        first_leg.sl_departure_iata = second_leg.departure_iata;
                        first_leg.sl_departure_time = second_leg.departure_time;
                        first_leg.sl_arrival_id = second_leg.arrival_id;
                        first_leg.sl_arrival_iata = second_leg.arrival_iata;
                        first_leg.sl_arrival_time = second_leg.arrival_time;
                        first_leg.sl_duration = second_leg.duration;
                        first_leg.travel_time = first_leg.duration + second_leg.duration;
                        first_leg.time_on_site = TravelTime;
                        if (first_leg.travel_time < 1200) {oneday_trips.push(first_leg)}
                    }
                })
            })
        });
        oneday_trips = new Set(oneday_trips);
        drawOneDayTrip(oneday_trips,true);
    }
    // For direct/indirect return on specific date
    else {
        if(last_checked_return != $('#return_date').val()){
            getReturnRecords(return_option)};
        let direct_return_base = return_base.filter(trip => trip.arrival_id == departure_id && destination_list.includes(trip.departure_id));
        if (time_restriction != "unknown_trip" ) {direct_return_base = direct_return_base.filter(trip => trip.duration <= time_restriction)};
        if (direct_only != "indirect") {
            // Check if return exist before drawing tickets
            let return_list = [];
            direct_return_base.forEach(function(trip){
                let isIn = return_list.includes(trip.departure_id);
                if (isIn == false) {
                    return_list.push(trip.departure_id);
                };})
            trips = trips.filter(trip => return_list.includes(trip.arrival_id));
            await drawDirectTrip(trips,false);
            await drawDirectReturn(direct_return_base,return_list,true);
        } else {
            let all_indirect_returns = [];
            destination_list.forEach( await function(destination) {
                let first_leg = return_base.filter(trip => trip.departure_id == destination);
                let second_leg = return_base.filter(trip => trip.arrival_id == departure_id);
                first_leg.forEach(function (trip) {
                    let [hours, minutes] = trip.arrival_time.split(':');
                    let dt1 = new Date();
                    dt1.setHours(+hours);
                    dt1.setMinutes(minutes);
                    second_leg.forEach(function(indirect_trip){
                        // Check if no better direct alternative
                        let dt2 = new Date();
                        let [hours, minutes] = indirect_trip.departure_time.split(':');
                        dt2.setHours(+hours);
                        dt2.setMinutes(minutes);
                        // Difftime is the connection time
                        let Difftime = Math.round((dt2.getTime() - dt1.getTime()) / 60000);
                        if (trip.arrival_id == indirect_trip.departure_id && Difftime > 10 && Difftime < 90) {
                            let dt3 = new Date();
                            let [hours, minutes] = indirect_trip.arrival_time.split(':');
                            dt3.setHours(+hours);
                            dt3.setMinutes(minutes);
                            let check = direct_return_base.filter(trip => trip.departure_id == destination);
                            let alternative = false;
                            for (let i in check) {
                                let dt4 = new Date();
                                let [hours, minutes] = check[i].arrival_time.split(':');
                                dt4.setHours(+hours);
                                dt4.setMinutes(minutes);
                                if ((Math.abs(dt3.getTime() - dt4.getTime()) < 3600000)) {
                                    //console.log('Better alternative found - Exit loop');
                                    //console.log('alternative directe existante à : ', check[i].departure_city, '-', check[i].arrival_city, ' ', check[i].departure_time, '-', check[i].arrival_time, ' au lieu de : ', trip.departure_city, '-', indirect_trip.departure_city, '-', indirect_trip.arrival_city , ' ', trip.departure_time, '-', trip.arrival_time, '-', indirect_trip.departure_time, '-', indirect_trip.arrival_time);
                                    alternative = true;
                                };
                                // console.log(alternative)
                            };
                            if (alternative == false) {
                                indirect_trip.origine = trip.departure_city;
                                indirect_trip.origine_id = trip.departure_id;
                                indirect_trip.origine_iata = trip.departure_iata;
                                indirect_trip.origine_departure = trip.departure_time;
                                indirect_trip.origine_coords = trip.departure_coords;
                                indirect_trip.connection_arrival = trip.arrival_time;
                                indirect_trip.connection_iata = trip.arrival_iata;
                                indirect_trip.full_duration = indirect_trip.duration + trip.duration + Difftime;
                                indirect_trip.connection_time = Difftime;
                                if (time_restriction != "unknown_trip" ) {if (indirect_trip.full_duration <= time_restriction){all_indirect_returns.push(indirect_trip);}} else {all_indirect_returns.push(indirect_trip);};
                                // console.log(indirect_trip.arrival_city, ' depuis ', indirect_trip.departure_city, ' ', trip.departure_time,'-',trip.arrival_time,'-',indirect_trip.departure_time,'-',indirect_trip.arrival_time)
                            };
                        };
                    });
                });
            });
            let return_list = [];
            direct_return_base.forEach(function(trip){
                let isIn = return_list.includes(trip.departure_id);
                if (isIn == false) {
                    return_list.push(trip.departure_id);
                };})
            // remove duplicates (reason why duplicate not found)
            all_indirect_returns = new Set(all_indirect_returns);
            all_indirect_returns.forEach(function(trip){
                let isIn = return_list.includes(trip.origine_id);
                if (isIn == false) {
                    return_list.push(trip.origine_id);
                };})
            trips = trips.filter(trip => return_list.includes(trip.arrival_id));
            all_indirect_trips = all_indirect_trips.filter(indirect_trip => return_list.includes(indirect_trip.arrival_id));
            await drawDirectTrip(trips,false);
            await drawIndirectTrip(all_indirect_trips,temp_destination_list,false);
            await drawDirectReturn(direct_return_base,return_list,false);
            await drawIndirectReturn(all_indirect_returns,return_list,true);
        }
    }
    }}
}

async function drawDirectTrip(trips,isLastDrawMethod){
    console.log("[drawDirectTrip] Enter in method");
    let map =  mapsPlaceholder[0];
    // list to know which marker show / hide while mouse on
    var hide_list = [];
    trips.forEach(function(trip){
        let isIn = hide_list.includes(trip.arrival_id);
        if (isIn == false) {
            hide_list.push(trip.arrival_id);
        }
    });
    var destination_list = [];
    if (trips.length != 0){
        destination_list.push(trips[0].departure_id);
        let trip_map = new Map();
        trips.forEach(function(trip){
            let isIn = destination_list.includes(trip.arrival_id);
            if (isIn == false) {
                destination_list.push(trip.arrival_id);
            };
            let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
            if ($("#" + identify_ticket).length === 0) {

                let category_html = '<li class="card" id="' + trip.arrival_id + '">' +
                    '<img src="images/city/bg_'+ trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                    '<h5 class="card-img-overlay" role="tab" id="heading' + trip.arrival_id + '">' +
                    '<a class="collapsed d-block " data-toggle="collapse" style="background-color: transparent;" data-parent="#tickets" href="#sub' + trip.arrival_id + '" aria-expanded="false">' +
                    '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + trip.arrival_city + '</p></a></h5><div class="card collapse" id="sub' + trip.arrival_id + '"></div></li>'

                if (isIn == false) {
                    $("#tickets").append(category_html);
                    $('#heading' + trip.arrival_id).bind('mouseenter', function () {
                        markerLayer.eachLayer(function (layer) {
                            if (trip.arrival_iata != layer.options.iata && layer.options.iata != trip.departure_iata) {
                                layer.setOpacity(0.1);
                            }
                        });
                    });
                    $('#heading' + trip.arrival_id).bind('mouseleave', function () {
                        markerLayer.eachLayer(function (layer) {
                            if (hide_list.includes(layer.options.id) == true || trip.departure_id == layer.options.id) {
                                layer.setOpacity(0.8);
                            }
                        });
                    });
                }
                if( typeof trip_map.get(trip.arrival_id) === 'undefined'){
                    trip_map.set(trip.arrival_id,[]);
                }
                trip_map.get(trip.arrival_id).push(trip)
                tmp_duration_list.push(trip.duration);
            }
        });
        markers = [];
        markerLayer.eachLayer(function (layer) {
            if (destination_list.includes(layer.options.id) == false) {
                layer.setOpacity(0.4);
                layer.setIcon(L.icon({"iconSize": [10,10], "iconAnchor": [5,5], "iconUrl":"images/icons/circle.png"}))
            } else {
                markers.push(layer);
                layer.setOpacity(0.8);
                layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/placeholder.png"}))
            }
            if (layer.options.id == trips[0].departure_id) {layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/station.png"}))}
        });
        var fg = L.featureGroup(markers);
        for (let [key, value] of trip_map) {
            value
                .sort((a, b) => (Number(a.departure_time.split(':')[0]) > Number(b.departure_time.split(':')[0]))? 1 : -1)
                .forEach(trip => {
                let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
                let hours = Math.trunc(trip.duration / (60))
                let minute = Math.trunc(Math.abs(trip.duration - hours * 60));
                let display  = createTimeDisplay(minute,hours);
                let processed_date = trip.day.toString() + '-' + trip.departure_time.split(':')[0].toString() + ':00';
                let tl_url = createTrainlineLink(processed_date, trip.departure_iata, trip.arrival_iata);
                let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.arrival_id + '">' +
                    '<div class="card-body" href="' + tl_url + '">' +
                    '<i class="fas fa-space-shuttle"></i>' +
                    '<strong> %td | %ta </strong>'.replace('%ta', trip.arrival_time).replace('%td', trip.departure_time) +
                    'en %d !'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>' +
                    '</div></div>'
                $('#sub' + key).append(ticket_html)
                $('#' + identify_ticket).bind('mouseover', function () {
                    let current_coords = new Array();
                    current_coords.push(trip.departure_coords);
                    current_coords.push(trip.arrival_coords);
                    var polyline = new CustomPolyline(current_coords, {
                        id: 'line' + trip.departure_iata.toString() + trip.arrival_iata.toString(),
                        color: 'black',
                        weight: 2,
                        opacity: 0.8,
                        dashArray: '10, 10'
                    });
                    tripLayer.addLayer(polyline);
                    markerLayer.eachLayer(function (layer) {
                            if (trip.arrival_iata != layer.options.iata && layer.options.iata != trip.departure_iata) {
                                layer.setOpacity(0.1);
                            }
                    });
                    map.flyToBounds([current_coords])
                });
                $('#' + identify_ticket).bind('mouseout', function () {
                        if (typeof tripLayer !== 'undefined') {
                            tripLayer.clearLayers();
                        };
                        markerLayer.eachLayer(function (layer) {
                            if (hide_list.includes(layer.options.id) == true || trip.departure_id == layer.options.id) {
                                layer.setOpacity(0.8);
                            }
                        });
                        if (L.Browser.mobile) {map.flyToBounds(fg.getBounds(),{padding: [30,30]})} else {map.flyToBounds(fg.getBounds(),{padding: [50,50]})};
                });
            })
        }
        if (L.Browser.mobile) {
            map.flyToBounds(fg.getBounds(),{padding: [30,30], duration: 1})
            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
        } else {
            map.flyToBounds(fg.getBounds(),{padding: [50,50], duration: 1})
            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
        };
    } else {
        if (typeof tripLayer !== 'undefined') {
                tripLayer.clearLayers();
        };
        markerLayer.eachLayer(function (layer) {
            if (layer.options.icon.options.iconUrl == "images/icons/station.png") {
                layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/station.png"}))
            } else {
                layer.setIcon(L.icon({"iconSize": [10,10], "iconAnchor": [5,5], "iconUrl":"images/icons/circle.png"}))
            }
        })
        let category_html = '<li class="card">' +
           '<img src="images/icons/misstrain.gif" width="200" height="200" class="card-img" alt="...">' +
           '<h5 class="card-img-overlay" role="tab">' +
           '<p><br></p>' +
           '<p class="text-dark text-center bg-white" style="opacity:0.5">Sorry! No tchoutchou</p></h5><div class="card"></div></li>'
        $("#tickets").append(category_html);
      }

    if (isLastDrawMethod) {
        $("#se-loading-function").fadeOut(1000);
    }
    console.log("Fin Exé DrawDirect");
}

async function drawIndirectTrip(indirect_trips,destination_list,isLastDrawMethod){
    let map =  mapsPlaceholder[0];
    console.log('Debut Exé DrawIndirect');
    // Check if IndirectTrips isn't empty
    var hide_list = destination_list.slice();
    indirect_trips.forEach(function(trip){
            let isIn = hide_list.includes(trip.arrival_id);
            if (isIn == false) {
                hide_list.push(trip.arrival_id);
            }
    });
    if (indirect_trips.length != 0){
        let indirect_trip_map = new Map();
        indirect_trips.forEach(function(indirect_trip){
            let origin_ticket = 'line' + indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.connection_arrival.replace(':', '') + indirect_trip.origine_departure.replace(':', '');
            let isIn = destination_list.includes(indirect_trip.arrival_id);
            if (isIn == false) {
                destination_list.push(indirect_trip.arrival_id);
            }
            let identify_ticket = indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.departure_iata.toString() + indirect_trip.arrival_iata.toString() + indirect_trip.arrival_time.replace(':', '') + indirect_trip.origine_departure.replace(':', '');

            if ($("#" + identify_ticket).length === 0) {


                let category_html = '<li class="card" id="' + indirect_trip.arrival_id + '">' +
                    '<img src="images/city/bg_'+ indirect_trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                    '<h5 class="card-img-overlay" role="tab" id="heading' + indirect_trip.arrival_id + '">' +
                    '<a class="collapsed d-block" data-toggle="collapse" data-parent="#tickets" style="background-color: transparent;" href="#sub' + indirect_trip.arrival_id + '" aria-expanded="false">' +
                    '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + indirect_trip.arrival_city + '</p></a></h5><div class="card collapse" id="sub' + indirect_trip.arrival_id + '"></div></li>'

                if (isIn == false) {
                    $("#tickets").append(category_html);}



                markerLayer.eachLayer(function (layer) {
                    if (indirect_trip.arrival_iata == layer.options.iata && isIn == false) {
                        layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/indirect_pin.png"}))
                    }
                    if (indirect_trip.arrival_iata == layer.options.iata) {
                        layer.setOpacity(0.8);
                    }
                });
                //if trip list doesn't exist for this arrival id
                if( typeof indirect_trip_map.get(indirect_trip.arrival_id) === 'undefined'){
                    indirect_trip_map.set(indirect_trip.arrival_id,[]);
                }
                indirect_trip_map.get(indirect_trip.arrival_id).push(indirect_trip)
            }
        });
        hide_list.forEach(function(id) {
            $('#heading' + id).bind('mouseenter', function () {
                markerLayer.eachLayer(function (layer) {
                    if (id != layer.options.id && layer.options.id != indirect_trips[0].origine_id) {
                        layer.setOpacity(0.1);
                    }
                });
            });
            $('#heading' + id).bind('mouseleave', function () {
                markerLayer.eachLayer(function (layer) {
                    if (hide_list.includes(layer.options.id) == true || indirect_trips[0].origine_id == layer.options.id) {
                        layer.setOpacity(0.8);
                    }
                });
            });
        })

        let markers = [];
        markerLayer.eachLayer(function (layer) {
            if (layer.options.id == indirect_trips[0].origine_id) {layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/station.png"}))}
            if (hide_list.includes(layer.options.id) == true) {markers.push(layer)}
        });
        let fg = L.featureGroup(markers);


        for (let [key, value] of indirect_trip_map) {
            //console.log(value);
            value
                .sort((a, b) => (Number(a.origine_departure.split(':')[0]) > Number(b.origine_departure.split(':')[0]) ? 1 : -1))
                .forEach(indirect_trip => {
                    let identify_ticket = indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.departure_iata.toString() + indirect_trip.arrival_iata.toString() + indirect_trip.arrival_time.replace(':', '') + indirect_trip.origine_departure.replace(':', '');
                    let hours = Math.trunc(indirect_trip.full_duration / (60))
                    let minute = Math.trunc(Math.abs(indirect_trip.full_duration - hours * 60));
                    let display  = createTimeDisplay(minute,hours);
                    let processed_date = indirect_trip.day.toString() + '-' + indirect_trip.origine_departure.split(':')[0].toString() + ':00';
                    let tl_url = createTrainlineLink(processed_date, indirect_trip.origine_iata, indirect_trip.arrival_iata);

                    let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + indirect_trip.arrival_id + '">' +
                        '<div class="card-body" href="' + tl_url + '">' +
                        '<i class="fas fa-paper-plane"></i>' +
                        '<strong> %td </strong>| %tac <i class="fas fa-history"></i><br> %tdc | <strong>%ta </strong><br> ... via la belle ville de %sc pendant <strong>%tc min</strong> <br>'.replace('%td', indirect_trip.origine_departure).replace('%tac', indirect_trip.connection_arrival).replace('%sc', indirect_trip.departure_city).replace('%tc', indirect_trip.connection_time).replace('%tdc', indirect_trip.departure_time).replace('%ta', indirect_trip.arrival_time)+
                        'le tout en <strong> %d </strong>!'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>'
                    '</div></div>'
                    $('#sub' + key).append(ticket_html);
                    $('#' + identify_ticket).bind('mouseenter', function () {
                        let current_coords = new Array();
                        current_coords.push(indirect_trip.origine_coords);
                        current_coords.push(indirect_trip.departure_coords);
                        var polyline = new CustomPolyline(current_coords, {
                            id: 'fl_line' + identify_ticket,
                            color: 'black',
                            weight: 2,
                            opacity: 1,
                            dashArray: '10, 10',
                        });
                        tripLayer.addLayer(polyline);
                        current_coords = new Array();
                        current_coords.push(indirect_trip.departure_coords);
                        current_coords.push(indirect_trip.arrival_coords);
                        var polyline = new CustomPolyline(current_coords, {
                            id: 'sl_line' + identify_ticket,
                            color: '#0affb4',
                            weight: 2,
                            opacity: 1,
                            dashArray: '10, 10',
                        });
                        tripLayer.addLayer(polyline);
                        map.flyToBounds([indirect_trip.origine_coords,indirect_trip.departure_coords,indirect_trip.arrival_coords])
                        markerLayer.eachLayer(function (layer) {
                            if (layer.options.iata != indirect_trip.arrival_iata && layer.options.iata != indirect_trip.connection_iata && layer.options.iata != indirect_trip.origine_iata) {
                                layer.setOpacity(0.1);
                            }
                        });
                    });
                    $('#' + identify_ticket).bind('mouseleave', function () {
                        if (typeof tripLayer !== 'undefined') {
                            tripLayer.clearLayers();
                        };
                        markerLayer.eachLayer(function (layer) {
                            if (destination_list.includes(layer.options.id) == true) {
                                layer.setOpacity(0.8);
                            }
                        });
                        if (L.Browser.mobile) {map.flyToBounds(fg.getBounds(),{padding: [30,30]})} else {map.flyToBounds(fg.getBounds(),{padding: [50,50]})};
                    });
                });
            //console.log(value);
        }

        if (L.Browser.mobile) {
            map.flyToBounds(fg.getBounds(),{padding: [30,30], duration: 1})
            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
        } else {
            map.flyToBounds(fg.getBounds(),{padding: [50,50], duration: 1})
            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
        };

    }
    if (isLastDrawMethod) {
        $("#se-loading-function").fadeOut(1000);
    }
    console.log('Fin Exé DrawIndirect');
}

async function drawDirectReturn(trips,hide_list,isLastDrawMethod){
    console.log("Début Exé DrawDirect Return");
    let map =  mapsPlaceholder[0];
    let return_map = new Map();
    trips.forEach(function(trip){
        let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
        if ($("#" + identify_ticket).length === 0) {
            if( typeof return_map.get(trip.arrival_id) === 'undefined'){
                return_map.set(trip.arrival_id,[]);
            }
            return_map.get(trip.arrival_id).push(trip)
        }})
    let markers = [];
    markerLayer.eachLayer(function (layer) {
        if (hide_list.includes(layer.options.id) == true) {markers.push(layer)}
    });
    let fg = L.featureGroup(markers);
    for (let [key, value] of return_map) {
        value
            .sort((a, b) => (Number(a.departure_time.split(':')[0]) > Number(b.departure_time.split(':')[0]))? 1 : -1)
            .forEach(trip => {
                let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
                let hours = Math.trunc(trip.duration / (60))
                let minute = Math.trunc(Math.abs(trip.duration - hours * 60));
                let display  = createTimeDisplay(minute,hours);
                let processed_date = trip.day.toString() + '-' + trip.departure_time.split(':')[0].toString() + ':00';
                let tl_url = createTrainlineLink(processed_date, trip.departure_iata, trip.arrival_iata);

                let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.departure_id + '">' +
                    '<div class="card-body" href="' + tl_url + '">' +
                    '<i class="fa fa-angle-double-left"></i>' +
                    '<strong> %td | %ta </strong>'.replace('%ta', trip.arrival_time).replace('%td', trip.departure_time) +
                    'en %d !'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>' +
                    '</div></div>'

                $('#sub' + trip.departure_id).append(ticket_html);
                $('#' + identify_ticket).bind('mouseover', function () {
                    let current_coords = new Array();
                    current_coords.push(trip.departure_coords);
                    current_coords.push(trip.arrival_coords);
                    var polyline = new CustomPolyline(current_coords, {
                        id: 'line' + trip.departure_iata.toString() + trip.arrival_iata.toString(),
                        color: 'black',
                        weight: 2,
                        opacity: 0.8,
                        dashArray: '10, 10',
                    });
                    tripLayer.addLayer(polyline);
                    map.flyToBounds([current_coords])
                    markerLayer.eachLayer(function (layer) {
                        if (trip.arrival_iata != layer.options.iata && layer.options.iata != trip.departure_iata) {
                            layer.setOpacity(0.1);
                        }
                    });
                });
                $('#' + identify_ticket).bind('mouseout', function () {
                        if (typeof tripLayer !== 'undefined') {
                            tripLayer.clearLayers();
                        };
                        markerLayer.eachLayer(function (layer) {
                            if (hide_list.includes(layer.options.id) == true || trip.departure_id == layer.options.id) {
                                layer.setOpacity(0.8);
                            }
                        });
                        if (L.Browser.mobile) {
                            map.flyToBounds(fg.getBounds(),{padding: [30,30], duration: 1})
                            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
                        } else {
                            map.flyToBounds(fg.getBounds(),{padding: [50,50], duration: 1})
                            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
                        };
                });
            });
    }
    //fade out loader after display
    if (isLastDrawMethod) {
        $("#se-loading-function").fadeOut(1000);
    }
    console.log("Fin Exé DrawDirect Return");
}

async function drawIndirectReturn(indirect_trips,hide_list,isLastDrawMethod){
    console.log('[drawIndirectReturn] Enter in method');
    let map =  mapsPlaceholder[0];
    let indirect_return_map = new Map();
    indirect_trips.forEach(function(indirect_trip){
        let origin_ticket = 'line' + indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.connection_arrival.replace(':', '') + indirect_trip.origine_departure.replace(':', '');

        let identify_ticket = indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.departure_iata.toString() + indirect_trip.arrival_iata.toString() + indirect_trip.arrival_time.replace(':', '') + indirect_trip.origine_departure.replace(':', '');

        if ($("#" + identify_ticket).length === 0) {
            if( typeof indirect_return_map.get(indirect_trip.origine_id) === 'undefined'){
                indirect_return_map.set(indirect_trip.origine_id,[]);
            }
            indirect_return_map.get(indirect_trip.origine_id).push(indirect_trip)

        }
    });
    let markers = [];
    markerLayer.eachLayer(function (layer) {
        if (hide_list.includes(layer.options.id) == true) {markers.push(layer)}
    });
    let fg = L.featureGroup(markers);
    for (let [key, value] of indirect_return_map) {
        //console.log(value);
        value
            .sort((a, b) => (Number(a.origine_departure.split(':')[0]) > Number(b.origine_departure.split(':')[0]) ? 1 : -1))
            .forEach(indirect_trip => {
                let identify_ticket = indirect_trip.origine_iata.toString() + indirect_trip.connection_iata.toString() + indirect_trip.departure_iata.toString() + indirect_trip.arrival_iata.toString() + indirect_trip.arrival_time.replace(':', '') + indirect_trip.origine_departure.replace(':', '');
                let hours = Math.trunc(indirect_trip.full_duration / (60))
                let minute = Math.trunc(Math.abs(indirect_trip.full_duration - hours * 60));
                let display  = createTimeDisplay(minute,hours);
                let processed_date = indirect_trip.day.toString() + '-' + indirect_trip.origine_departure.split(':')[0].toString() + ':00';
                let tl_url = createTrainlineLink(processed_date, indirect_trip.origine_iata, indirect_trip.arrival_iata);

                let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + indirect_trip.arrival_id + '">' +
                    '<div class="card-body" href="' + tl_url + '">' +
                    '<i class="fa fa-angle-left"></i>' +
                    '<strong> %td </strong>| %tac <i class="fas fa-history"></i><br> %tdc | <strong>%ta </strong><br> ... via la belle ville de %sc pendant <strong>%tc min</strong> <br>'.replace('%td', indirect_trip.origine_departure).replace('%tac', indirect_trip.connection_arrival).replace('%sc', indirect_trip.departure_city).replace('%tc', indirect_trip.connection_time).replace('%tdc', indirect_trip.departure_time).replace('%ta', indirect_trip.arrival_time)+
                    'le tout en <strong> %d </strong>!'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>'
                '</div></div>'

                    $('#sub' + indirect_trip.origine_id).append(ticket_html);
                    $('#' + identify_ticket).bind('mouseenter', function () {
                        let current_coords = new Array();
                        current_coords.push(indirect_trip.origine_coords);
                        current_coords.push(indirect_trip.departure_coords);
                        var polyline = new CustomPolyline(current_coords, {
                            id: 'fl_line' + identify_ticket,
                            color: 'black',
                            weight: 2,
                            opacity: 1,
                            dashArray: '10, 10',
                        });
                        tripLayer.addLayer(polyline);
                        current_coords = new Array();
                        current_coords.push(indirect_trip.departure_coords);
                        current_coords.push(indirect_trip.arrival_coords);
                        var polyline = new CustomPolyline(current_coords, {
                            id: 'sl_line' + identify_ticket,
                            color: '#0affb4',
                            weight: 2,
                            opacity: 1,
                            dashArray: '10, 10',
                        });
                        tripLayer.addLayer(polyline);
                        map.flyToBounds([indirect_trip.origine_coords,indirect_trip.departure_coords,indirect_trip.arrival_coords])
                        markerLayer.eachLayer(function (layer) {
                            if (layer.options.iata != indirect_trip.arrival_iata && layer.options.iata != indirect_trip.connection_iata && layer.options.iata != indirect_trip.origine_iata) {
                                layer.setOpacity(0.1);
                            }
                        });
                    });
                    $('#' + identify_ticket).bind('mouseleave', function () {
                        if (typeof tripLayer !== 'undefined') {
                            tripLayer.clearLayers();
                        };
                        markerLayer.eachLayer(function (layer) {
                            if (hide_list.includes(layer.options.id) == true) {
                                layer.setOpacity(0.8);
                            }
                        });
                        if (L.Browser.mobile) {
                            map.flyToBounds(fg.getBounds(),{padding: [30,30], duration: 1})
                            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
                        } else {
                            map.flyToBounds(fg.getBounds(),{padding: [50,50], duration: 1})
                            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
                        };
                    });
                });
            // console.log(value);
        }
        // console.log(value);

    if (isLastDrawMethod) {
        $("#se-loading-function").fadeOut(1000);
    }
    console.log('[drawIndirectReturn] Get out');
}

async function drawOneDayTrip(trips,isLastDrawMethod) {
    console.log('[drawOneDayTrip] Enter in method');
    let map =  mapsPlaceholder[0];
    let oneday_map = new Map();
    var destination_list = [];
    if (trips.size != 0){
        trips.forEach(function(trip){
            let isTripLineAlreadyDrawn = destination_list.includes(trip.arrival_id);
            if (isTripLineAlreadyDrawn == false) {
                destination_list.push(trip.arrival_id);
            };
            //set up weather acceptance to true
            let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
            let category_html = '<li class="card" id="' + trip.arrival_id + '">' +
                '<img src="images/city/bg_'+ trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                '<h5 class="card-img-overlay" role="tab" id="heading' + trip.arrival_id + '">' +
                '<a class="collapsed d-block " data-toggle="collapse" style="background-color: transparent;" data-parent="#tickets" href="#sub' + trip.arrival_id + '" aria-expanded="false">' +
                '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + trip.arrival_city + '</p></a></h5><div class="card collapse" id="sub' + trip.arrival_id + '"></div></li>'
            if (isTripLineAlreadyDrawn == false) {
                $("#tickets").append(category_html);
                $('#heading' + trip.arrival_id).bind('mouseenter', function () {
                    markerLayer.eachLayer(function (layer) {
                        if (trip.arrival_iata != layer.options.iata && layer.options.iata != trip.departure_iata) {
                            layer.setOpacity(0.1);
                        }
                    });
                });
                $('#heading' + trip.arrival_id).bind('mouseleave', function () {
                    markerLayer.eachLayer(function (layer) {
                        if (destination_list.includes(layer.options.id) == true || trip.departure_id == layer.options.id) {
                            layer.setOpacity(0.8);
                        }
                    });
                });
            }
            if ($("#" + identify_ticket).length === 0) {
                if( typeof oneday_map.get(trip.arrival_id) === 'undefined'){
                    oneday_map.set(trip.arrival_id,[]);
                }
                oneday_map.get(trip.arrival_id).push(trip)
            }
        })
        let markers = []
        markerLayer.eachLayer(function (layer) {
            if (destination_list.includes(layer.options.id) == false) {
                layer.setOpacity(0.4);
                layer.setIcon(L.icon({"iconSize": [10,10], "iconAnchor": [5,5], "iconUrl":"images/icons/circle.png"}))
            } else {
                layer.setOpacity(0.8);
                layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/placeholder.png"}))
                markers.push(layer)
            }
            if (layer.options.id == trips.values().next().value.departure_id) {layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/station.png"})); markers.push(layer)}
        });
        let fg = L.featureGroup(markers);
        for (let [key, value] of oneday_map) {
            value
                .sort((a, b) => (Number(a.time_on_site) > Number(b.time_on_site))? 1 : -1)
                .forEach(trip => {
                    let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '') + trip.sl_arrival_time.replace(':', '') + trip.sl_departure_time.replace(':', '')
                    //Display time first way
                    let hours = Math.trunc(trip.duration/ (60))
                    //console.log(hours)
                    let minute = Math.trunc(Math.abs(trip.duration - hours * 60));
                    //console.log(minute)
                    let display = createTimeDisplay(minute,hours);
                    let processed_date = trip.day.toString() + '-' + trip.departure_time.split(':')[0].toString() + ':00';
                    let tl_url = createTrainlineLink(processed_date, trip.departure_iata, trip.arrival_iata);

                    // Display time second way
                    let sl_hours = Math.trunc(trip.sl_duration / (60))
                    let sl_minute = Math.trunc(Math.abs(trip.sl_duration - sl_hours * 60));
                    let sl_display = createTimeDisplay(sl_minute,sl_hours);

                    let sl_processed_date = trip.day.toString() + '-' + trip.sl_departure_time.split(':')[0].toString() + ':00';
                    let sl_tl_url = createTrainlineLink(sl_processed_date, trip.sl_departure_iata, trip.sl_arrival_iata);

                    // Display time on site & in the train
                    let tos_hours = Math.trunc(trip.time_on_site / (60))
                    let tos_minute = Math.trunc(Math.abs(trip.time_on_site - tos_hours * 60));
                    let tos_display = createTimeDisplay(tos_minute,tos_hours);

                    let it_hours = Math.trunc(trip.travel_time / (60))
                    let it_minute = Math.trunc(Math.abs(trip.travel_time - it_hours * 60));
                    let it_display = createTimeDisplay(it_minute,it_hours);
                    let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.arrival_id + '">' +
                        '<div class="card-body" href="' + tl_url + '">' +
                        '<i class="fa fa-arrow-circle-right"></i>' +
                        '<strong> %td | %ta </strong>'.replace('%ta', trip.arrival_time).replace('%td', trip.departure_time) +
                        'en %d !'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>' + '<br>' +
                        '<i class="fa fa-arrow-circle-left"></i>' +
                        '<strong> %td | %ta </strong>'.replace('%ta', trip.sl_arrival_time).replace('%td', trip.sl_departure_time) +
                        'en %d !'.replace('%d', sl_display) + '<a type="button" target="_blank" href="' + sl_tl_url + '" class="btn btn-link btn-sm">Book</a>' + '<br>' +
                        'Time on site : %tos'.replace('%tos',tos_display) + " | " + 'Time in the train : %it'.replace('%it',it_display) +
                        '</div></div>'
                    $('#sub' + trip.arrival_id).append(ticket_html);
                    $('#' + identify_ticket).bind('mouseenter', function () {
                        let current_coords = new Array();
                        current_coords.push(trip.departure_coords);
                        current_coords.push(trip.arrival_coords);
                        var polyline = new CustomPolyline(current_coords, {
                            id: 'line' + trip.departure_iata.toString() + trip.arrival_iata.toString(),
                            color: '#f7dc6f',
                            weight: 2,
                            opacity: 0.8,
                            dashArray: '10, 10',
                        });
                        tripLayer.addLayer(polyline);
                        map.flyToBounds([current_coords]);
                        markerLayer.eachLayer(function (layer) {
                            if (trip.arrival_iata != layer.options.iata && layer.options.iata != trip.departure_iata) {
                                layer.setOpacity(0.1);
                            }
                        });
                    });
                    $('#' + identify_ticket).bind('mouseleave', function () {
                        if (typeof tripLayer !== 'undefined') {
                            tripLayer.clearLayers();
                        };
                        markerLayer.eachLayer(function (layer) {
                            if (destination_list.includes(layer.options.id) == true || trip.departure_id == layer.options.id) {
                                layer.setOpacity(0.8);
                            }
                        });
                        if (L.Browser.mobile) {map.flyToBounds(fg.getBounds(),{padding: [150,150]});map.zoomIn(0.01)} else {map.flyToBounds(fg.getBounds(),{padding: [50,50]});map.zoomIn(0.01)};
                    });
                })
        }
        if (L.Browser.mobile) {
            map.flyToBounds(fg.getBounds(),{padding: [30,30], duration: 1})
            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
        } else {
            map.flyToBounds(fg.getBounds(),{padding: [50,50], duration: 1})
            setTimeout(function(){ map.setZoom(map.getZoom() + 0.1);}, 3000);
        };
    } else {
        if (typeof tripLayer !== 'undefined') {
                tripLayer.clearLayers();
        }
        markerLayer.eachLayer(function (layer) {
            if (layer.options.icon.options.iconUrl == "images/icons/station.png") {
                layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/station.png"}))
            } else {
                layer.setIcon(L.icon({"iconSize": [10,10], "iconAnchor": [5,5], "iconUrl":"images/icons/circle.png"}))
            }
        })
        let category_html = '<li class="card">' +
            '<img src="images/icons/misstrain.gif" width="200" height="200" class="card-img" alt="...">' +
            '<h5 class="card-img-overlay" role="tab">' +
            '<p><br></p>' +
            '<p class="text-dark text-center bg-white" style="opacity:0.5">No train, no kiff Sorry!</p></h5><div class="card"></div></li>'
        $("#tickets").append(category_html);
    }
    //fade out loader
    if (isLastDrawMethod) {
        $("#se-loading-function").fadeOut(1000);
    }
    console.log('[drawOneDayTrip] Get out');
}

function createTrainlineLink(departure_time,departure_iata,arrival_iata){
    //build trainline link
    let link = "https://www.trainline.fr/search/%depiata/%arriata/%date"
        .replace('%depiata',departure_iata)
        .replace('%arriata',arrival_iata)
        .replace('%date',(departure_time));

    return link;
}

function createTimeDisplay(minutes,hours){
    if(hours === 0){
        return ("0" + minutes).slice(-2) + "m";
    }else{
        return ("0" + hours).slice(-2) + "h" + ("0" + minutes).slice(-2) + "m";
    }
}
