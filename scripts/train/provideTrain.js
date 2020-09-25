// Global variable to store tgv max trip
var specific_indirect_station = [0, 8];
var last_checked_departure = undefined;
var last_checked_time = undefined;
var last_checked_return = undefined;
var last_checked_trip_type = undefined;
var last_checked_trip_time = undefined;
var last_checked_journey_type = undefined;
var trips = [];
var station = [];
var mobile = false;


$(document).ready(function(){
    $.ajaxSetup({
        async: false
    });
    $.getJSON("./static/lhokho-station-export.json", function(json) {
        station = json;
    }).then(function(station){
        //default loading of next day trip
        var currentTime = new Date();
        currentTime.setDate(currentTime.getDate() + 1)
        $('#se-pre-con').css({'display' : 'block'})
        setTimeout(function () {
                getTrainRecords(buildQueryDate(currentTime));
                $('#se-pre-con').css({'display' : 'none'})
        }, 100);

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
        // Create base to check if a train is crossing the station on a selected day
        let activity_station_base = [];
        response['records'].forEach(function(result){
            let trip = {};
            //define trip date
            trip.day = result.fields.date;
            //gather departure data
            let departure_station = station.reduce(function(acc, curr, index) {
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
                let arrival_station = station.reduce(function(acc, curr, index) {
                    curr.forEach(function(stat){
                        if (stat.iata_code === result.fields.destination_iata) {
                            trip.arrival_id = index;
                            acc.push(stat);
                        }
                    })
                    return acc;
                }, [])[0];
                if (activity_station_base.includes(trip.departure_id) == false) {
                        activity_station_base.push(trip.departure_id);
                }
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
        markerLayer.eachLayer(function (layer) {
            if (activity_station_base.includes(layer.options.id) == false) {
                layer.getElement().style.display = 'none';
            } else {
                layer.getElement().style.display = 'block';
            }
        })
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
            let departure_station = station.reduce(function(acc, curr, index) {
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
                let arrival_station = station.reduce(function(acc, curr, index) {
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
        $('#sidebar').toggleClass('active');
    };
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
                let [hours, minutes] = trip.departure_time.split(':');
                let dt0 = new Date();
                dt0.setHours(+hours);
                dt0.setMinutes(minutes);
                [hours, minutes] = trip.arrival_time.split(':');
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
                    if (trip.arrival_iata != indirect_trip.departure_iata && specific_indirect_station.includes(trip.arrival_id)) {
                        var minimum_Difftime = 40
                    } else {
                        var minimum_Difftime = 10
                    }
                    if (Difftime >= minimum_Difftime && Difftime <= 150) {
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
                            let dt5 = new Date();
                            [hours, minutes] = check[i].departure_time.split(':');
                            dt5.setHours(+hours);
                            dt5.setMinutes(minutes);
                            if ((Math.abs(dt3.getTime() - dt4.getTime()) < 3600000) || (Math.abs(dt5.getTime() - dt0.getTime()) < 3600000)) {
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
        // Check if duplicates
        trips = Array.from(new Set(trips.map(JSON.stringify))).map(JSON.parse);
        all_indirect_trips = Array.from(new Set(all_indirect_trips.map(JSON.stringify))).map(JSON.parse);
        //await drawDirectTrip(trips,false);
        //await drawIndirectTrip(all_indirect_trips,destination_list,true);
        await drawTrips(trips, all_indirect_trips)
    } else {
        // Check if duplicates
        trips = Array.from(new Set(trips.map(JSON.stringify))).map(JSON.parse);
        //await drawDirectTrip(trips,true);
        await drawTrips(trips);
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
            let indirect_trips = findTripsFromDepartureID(destination).filter(trip => trip.arrival_id != departure_id);
            let current = trips.filter(trip => trip.arrival_id == destination);
            current.forEach(function (trip) {
                let [hours, minutes] = trip.departure_time.split(':');
                let dt0 = new Date();
                dt0.setHours(+hours);
                dt0.setMinutes(minutes);
                [hours, minutes] = trip.arrival_time.split(':');
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
                    if (trip.arrival_iata != indirect_trip.departure_iata && specific_indirect_station.includes(trip.arrival_id)) {
                        var minimum_Difftime = 40
                    } else {
                        var minimum_Difftime = 10
                    }
                    if (Difftime >= minimum_Difftime && Difftime <= 150) {
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
                            let dt5 = new Date();
                            [hours, minutes] = check[i].departure_time.split(':');
                            dt5.setHours(+hours);
                            dt5.setMinutes(minutes);
                            if ((Math.abs(dt3.getTime() - dt4.getTime()) < 3600000) || (Math.abs(dt5.getTime() - dt0.getTime()) < 3600000)) {
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
        oneday_trips = Array.from(new Set(oneday_trips.map(JSON.stringify))).map(JSON.parse);
        await drawTrips(undefined, undefined, undefined, undefined, oneday_trips);
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
        oneday_trips = Array.from(new Set(oneday_trips.map(JSON.stringify))).map(JSON.parse);
        await drawTrips(undefined, undefined, undefined, undefined, oneday_trips);
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
        oneday_trips = Array.from(new Set(oneday_trips.map(JSON.stringify))).map(JSON.parse);
        await drawTrips(undefined, undefined, undefined, undefined, oneday_trips);
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
            // Remove duplicates
            trips = Array.from(new Set(trips.map(JSON.stringify))).map(JSON.parse);
            direct_return_base = Array.from(new Set(direct_return_base.map(JSON.stringify))).map(JSON.parse);
            //await drawDirectTrip(trips,false);
            //await drawDirectReturn(direct_return_base,return_list,true);
            await drawTrips(trips,undefined,direct_return_base)
        } else {
            let all_indirect_returns = [];
            destination_list.forEach( await function(destination) {
                let first_leg = return_base.filter(trip => trip.departure_id == destination);
                let second_leg = return_base.filter(trip => trip.arrival_id == departure_id);
                first_leg.forEach(function (trip) {
                    let [hours, minutes] = trip.departure_time.split(':');
                    let dt0 = new Date();
                    dt0.setHours(+hours);
                    dt0.setMinutes(minutes);
                    [hours, minutes] = trip.arrival_time.split(':');
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
                        if (trip.arrival_iata != indirect_trip.departure_iata && specific_indirect_station.includes(trip.arrival_id)) {
                            var minimum_Difftime = 40
                        } else {
                            var minimum_Difftime = 10
                        }
                        if (trip.arrival_id == indirect_trip.departure_id && Difftime >= minimum_Difftime && Difftime <= 150) {
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
                                let dt5 = new Date();
                                [hours, minutes] = check[i].departure_time.split(':');
                                dt5.setHours(+hours);
                                dt5.setMinutes(minutes);
                                if ((Math.abs(dt3.getTime() - dt4.getTime()) < 3600000) || (Math.abs(dt5.getTime() - dt0.getTime()) < 3600000)) {
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
            trips = Array.from(new Set(trips.map(JSON.stringify))).map(JSON.parse);
            all_indirect_trips = Array.from(new Set(all_indirect_trips.map(JSON.stringify))).map(JSON.parse);
            direct_return_base = Array.from(new Set(direct_return_base.map(JSON.stringify))).map(JSON.parse);
            all_indirect_returns = Array.from(new Set(all_indirect_returns.map(JSON.stringify))).map(JSON.parse);
            all_indirect_returns.forEach(function(trip){
                let isIn = return_list.includes(trip.origine_id);
                if (isIn == false) {
                    return_list.push(trip.origine_id);
                };})
            trips = trips.filter(trip => return_list.includes(trip.arrival_id));
            all_indirect_trips = all_indirect_trips.filter(indirect_trip => return_list.includes(indirect_trip.arrival_id));
            drawTrips(trips, all_indirect_trips, direct_return_base, all_indirect_returns);
            // await drawDirectTrip(trips,false);
            // await drawIndirectTrip(all_indirect_trips,temp_destination_list,false);
            // await drawDirectReturn(direct_return_base,return_list,false);
            // await drawIndirectReturn(all_indirect_returns,return_list,true);
        }
    }
    }}
}

async function drawTrips(direct_trips, indirect_trips, direct_return, indirect_return, oneday_trips) {
    console.log("[drawTrips] Enter in method");
    let map =  mapsPlaceholder[0];
    let destination_list = new Map();
    let trip_map = new Map();
    let markers = [];
    let origin_station = false;
    let train_found = true;
    let departure_station = undefined;
    // Set the different trips category
    if (direct_trips != undefined) {
        if (direct_trips.length > 0) {
            departure_station = direct_trips[0].departure_id;
            direct_trips.forEach(function(trip){
                if( typeof destination_list.get(trip.arrival_id) === 'undefined'){
                        destination_list.set(trip.arrival_id,[]);
                        trip_map.set(trip.arrival_id,[]);
                        let category_html = '<li class="card" id="' + trip.arrival_id + '">' +
                                '<img src="images/city/bg_'+ trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                                '<h5 class="card-img-overlay" role="tab" id="heading' + trip.arrival_id + '">' +
                                '<a class="collapsed d-block " data-toggle="collapse" style="background-color: transparent;" data-parent="#tickets" href="#sub' + trip.arrival_id + '" aria-expanded="false">' +
                                '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + trip.arrival_city + '</p></a></h5><div class="card collapse" id="sub' + trip.arrival_id + '"></div></li>'
                        destination_list.get(trip.arrival_id).push(category_html)
                        markerLayer.eachLayer(function (layer) {
                            if (trip.arrival_id == layer.options.id) {
                                layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/placeholder.png"}));
                                layer.setOpacity(0.8);
                                markers.push(layer);
                            }
                            if (layer.options.id == departure_station && origin_station == false) {
                                markers.push(layer);
                                origin_station = true;
                            }
                        });
                }
                let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '');
                let hours = Math.trunc(trip.duration / (60))
                let minute = Math.trunc(Math.abs(trip.duration - hours * 60));
                let display  = createTimeDisplay(minute,hours);
                let processed_date = trip.day.toString() + '-' + trip.departure_time.split(':')[0].toString() + ':00';
                let tl_url = createTrainlineLink(processed_date, trip.departure_iata, trip.arrival_iata);
                ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.arrival_id + '">' +
                        '<div class="card-body" href="' + tl_url + '">' +
                        '<i class="fas fa-space-shuttle"></i>' +
                        '<strong> %td | %ta </strong>'.replace('%ta', trip.arrival_time).replace('%td', trip.departure_time) +
                        'en %d !'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>' +
                        '</div></div>'
                trip.ticket_html = ticket_html
                trip.identify_ticket = identify_ticket;
                trip.type = 'direct';
                trip.flow = 0;
                trip.sorting_hour = trip.departure_time.split(':')[0];
                trip_map.get(trip.arrival_id).push(trip);
            });
        } else {
            train_found = false;
            departure_station = last_checked_departure;
        }
    }
    if (indirect_trips != undefined) {
        indirect_trips.forEach(function(trip){
            if( typeof destination_list.get(trip.arrival_id) === 'undefined'){
                    let destination = [];
                    destination_list.set(trip.arrival_id,[]);
                    trip_map.set(trip.arrival_id,[]);
                    destination.arrival_id = trip.arrival_id;
                    category_html = '<li class="card" id="' + trip.arrival_id + '">' +
                                        '<img src="images/city/bg_'+ trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                                        '<h5 class="card-img-overlay" role="tab" id="heading' + trip.arrival_id + '">' +
                                        '<a class="collapsed d-block " data-toggle="collapse" style="background-color: transparent;" data-parent="#tickets" href="#sub' + trip.arrival_id + '" aria-expanded="false">' +
                                        '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + trip.arrival_city + '</p></a></h5><div class="card collapse" id="sub' + trip.arrival_id + '"></div></li>'
                    destination_list.get(trip.arrival_id).push(category_html)
                    markerLayer.eachLayer(function (layer) {
                        if (trip.arrival_id == layer.options.id) {
                            layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/indirect_pin.png"}))
                            layer.setOpacity(0.8);
                            markers.push(layer);
                        }
                    });
            }
            let identify_ticket = trip.origine_iata.toString() + trip.connection_iata.toString() + trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.origine_departure.replace(':', '');
            let hours = Math.trunc(trip.full_duration / (60))
            let minute = Math.trunc(Math.abs(trip.full_duration - hours * 60));
            let display  = createTimeDisplay(minute,hours);
            let processed_date = trip.day.toString() + '-' + trip.origine_departure.split(':')[0].toString() + ':00';
            let tl_url = createTrainlineLink(processed_date, trip.origine_iata, trip.arrival_iata);

            let ticket_html = '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.arrival_id + '">' +
                                '<div class="card-body" href="' + tl_url + '">' +
                                '<i class="fas fa-paper-plane"></i>' +
                                '<strong> %td </strong>| %tac <i class="fas fa-history"></i><br> %tdc | <strong>%ta </strong><br> ... via la belle ville de %sc pendant <strong>%tc min</strong> <br>'.replace('%td', trip.origine_departure).replace('%tac', trip.connection_arrival).replace('%sc', trip.departure_city).replace('%tc', trip.connection_time).replace('%tdc', trip.departure_time).replace('%ta', trip.arrival_time)+
                                'le tout en <strong> %d </strong>!'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>'
                                '</div></div>'
            trip.ticket_html = ticket_html
            trip.identify_ticket = identify_ticket;
            trip.type = 'indirect';
            trip.flow = 0;
            trip.sorting_hour = trip.origine_departure.split(':')[0];
            trip_map.get(trip.arrival_id).push(trip);
        });
    }
    if (direct_return != undefined) {
       direct_return.forEach(function(trip){
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
            trip.ticket_html = ticket_html
            trip.identify_ticket = identify_ticket;
            trip.type = 'direct';
            trip.flow = 1;
            trip.sorting_hour = trip.departure_time.split(':')[0];
            trip_map.get(trip.departure_id).push(trip);
        });
    }
    if (indirect_return != undefined) {
        indirect_return.forEach(function(trip){
            let identify_ticket = trip.origine_iata.toString() + trip.connection_iata.toString() + trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.origine_departure.replace(':', '');
            let hours = Math.trunc(trip.full_duration / (60))
            let minute = Math.trunc(Math.abs(trip.full_duration - hours * 60));
            let display  = createTimeDisplay(minute,hours);
            let processed_date = trip.day.toString() + '-' + trip.origine_departure.split(':')[0].toString() + ':00';
            let tl_url = createTrainlineLink(processed_date, trip.origine_iata, trip.arrival_iata);

            let ticket_html =   '<div id="' + identify_ticket + '" class="collapse show" role="tabpanel" aria-labelledby="heading' + trip.arrival_id + '">' +
                                '<div class="card-body" href="' + tl_url + '">' +
                                '<i class="fa fa-angle-left"></i>' +
                                '<strong> %td </strong>| %tac <i class="fas fa-history"></i><br> %tdc | <strong>%ta </strong><br> ... via la belle ville de %sc pendant <strong>%tc min</strong> <br>'.replace('%td',trip.origine_departure).replace('%tac',trip.connection_arrival).replace('%sc',trip.departure_city).replace('%tc',trip.connection_time).replace('%tdc',trip.departure_time).replace('%ta',trip.arrival_time)+
                                'le tout en <strong> %d </strong>!'.replace('%d', display) + '<a type="button" target="_blank" href="' + tl_url + '" class="btn btn-link btn-sm">Book</a>'
                                '</div></div>'
            trip.ticket_html = ticket_html
            trip.identify_ticket = identify_ticket;
            trip.type = 'indirect';
            trip.flow = 1;
            trip.sorting_hour = trip.origine_departure.split(':')[0];
            trip_map.get(trip.origine_id).push(trip);
        });
    }
    if (oneday_trips != undefined) {
        if (oneday_trips.length > 0) {
            departure_station = oneday_trips[0].departure_id;
            oneday_trips.forEach(function(trip){
                if( typeof destination_list.get(trip.arrival_id) === 'undefined'){
                        destination_list.set(trip.arrival_id,[]);
                        trip_map.set(trip.arrival_id,[]);
                        let category_html = '<li class="card" id="' + trip.arrival_id + '">' +
                                '<img src="images/city/bg_'+ trip.arrival_id +'.jpg" width="200" height="150" class="card-img" alt="...">' +
                                '<h5 class="card-img-overlay" role="tab" id="heading' + trip.arrival_id + '">' +
                                '<a class="collapsed d-block " data-toggle="collapse" style="background-color: transparent;" data-parent="#tickets" href="#sub' + trip.arrival_id + '" aria-expanded="false">' +
                                '<i class="fa fa-chevron-down pull-right"></i><p class="text-dark text-center bg-white" style="opacity:0.5">' + trip.arrival_city + '</p></a></h5><div class="card collapse" id="sub' + trip.arrival_id + '"></div></li>'
                        destination_list.get(trip.arrival_id).push(category_html)
                        markerLayer.eachLayer(function (layer) {
                            if (trip.arrival_id == layer.options.id) {
                                layer.setIcon(L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/placeholder.png"}));
                                layer.setOpacity(0.8);
                                markers.push(layer);
                            }
                            if (layer.options.id == departure_station && origin_station == false) {
                                markers.push(layer);
                                origin_station = true;
                            }
                        });
                }
                let identify_ticket = trip.departure_iata.toString() + trip.arrival_iata.toString() + trip.arrival_time.replace(':', '') + trip.departure_time.replace(':', '') + trip.sl_arrival_time.replace(':', '') + trip.sl_departure_time.replace(':', '')
                //Display time first way
                let hours = Math.trunc(trip.duration/ (60))
                let minute = Math.trunc(Math.abs(trip.duration - hours * 60));
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
                trip.ticket_html = ticket_html
                trip.identify_ticket = identify_ticket;
                trip.type = 'direct';
                trip.flow = 0;
                trip.sorting_hour = trip.departure_time.split(':')[0];
                trip_map.get(trip.arrival_id).push(trip);
            })
        } else {
            train_found = false;
            departure_station = last_checked_departure;
        }
    }
    var fg = L.featureGroup(markers);

    // DRAW PART
    if (train_found == true) {
        for (let [key, value] of destination_list) {
            value.forEach(trip => {
                    $("#tickets").append(trip);
                    $('#heading' + key).bind('mouseenter', function () {
                            markerLayer.eachLayer(function (layer) {
                                if (key != layer.options.id && layer.options.id != departure_station) {
                                    layer.setOpacity(0.1);
                                }
                            });
                    });
                    $('#heading' + key).bind('mouseleave', function () {
                            markerLayer.eachLayer(function (layer) {
                                if (destination_list.has(layer.options.id) == true || layer.options.id == departure_station) {
                                    layer.setOpacity(0.8);
                                }
                            });
                    });
            });
        }
        for (let [key, value] of trip_map) {
            value.sort((a, b) => (Number(a.sorting_hour) > Number(b.sorting_hour))? 1 : -1)
                .sort(function (a, b) {
                    return a.flow - b.flow;
                })
                    .forEach(trip => {
                        $('#sub' + key).append(trip.ticket_html)
                        if (trip.type == 'direct') {
                            $('#' + trip.identify_ticket).bind('mouseover', function () {
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
                                        if (trip.arrival_id != layer.options.id && layer.options.id != trip.departure_id) {
                                            layer.setOpacity(0.1);
                                        }
                                });
                                map.flyToBounds([current_coords])
                            });
                            $('#' + trip.identify_ticket).bind('mouseout', function () {
                                    if (typeof tripLayer !== 'undefined') {
                                        tripLayer.clearLayers();
                                    };
                                    markerLayer.eachLayer(function (layer) {
                                        if (destination_list.has(layer.options.id) == true || departure_station == layer.options.id) {
                                            layer.setOpacity(0.8);
                                        }
                                    });
                                    if (L.Browser.mobile) {map.flyToBounds(fg.getBounds(),{padding: [30,30]})} else {map.flyToBounds(fg.getBounds(),{padding: [50,50]})};
                            });
                        } else {
                            $('#' + trip.identify_ticket).bind('mouseenter', function () {
                                let current_coords = new Array();
                                current_coords.push(trip.origine_coords);
                                current_coords.push(trip.departure_coords);
                                var polyline = new CustomPolyline(current_coords, {
                                    id: 'fl_line' + trip.identify_ticket,
                                    color: 'black',
                                    weight: 2,
                                    opacity: 1,
                                    dashArray: '10, 10',
                                });
                                tripLayer.addLayer(polyline);
                                current_coords = new Array();
                                current_coords.push(trip.departure_coords);
                                current_coords.push(trip.arrival_coords);
                                var polyline = new CustomPolyline(current_coords, {
                                    id: 'sl_line' + trip.identify_ticket,
                                    color: '#0affb4',
                                    weight: 2,
                                    opacity: 1,
                                    dashArray: '10, 10',
                                });
                                tripLayer.addLayer(polyline);
                                map.flyToBounds([trip.origine_coords,trip.departure_coords,trip.arrival_coords])
                                markerLayer.eachLayer(function (layer) {
                                    if (layer.options.id != trip.arrival_id && layer.options.id != trip.departure_id && layer.options.id != trip.origine_id) {
                                        layer.setOpacity(0.1);
                                    }
                                });
                            });
                            $('#' + trip.identify_ticket).bind('mouseleave', function () {
                                if (typeof tripLayer !== 'undefined') {
                                    tripLayer.clearLayers();
                                };
                                markerLayer.eachLayer(function (layer) {
                                    if (destination_list.has(layer.options.id) == true) {
                                        layer.setOpacity(0.8);
                                    }
                                });
                                if (L.Browser.mobile) {map.flyToBounds(fg.getBounds(),{padding: [30,30]})} else {map.flyToBounds(fg.getBounds(),{padding: [50,50]})};
                            });
                        }
                    });
        }
    } else {
           let category_html = '<li class="card">' +
                               '<img src="images/icons/misstrain.gif" width="200" height="200" class="card-img" alt="...">' +
                               '<h5 class="card-img-overlay" role="tab">' +
                               '<p><br></p>' +
                               '<p class="text-dark text-center bg-white" style="opacity:0.5">Sorry! No tchoutchou</p></h5><div class="card"></div></li>'
            $("#tickets").append(category_html);
    }
    markerLayer.eachLayer(function (layer) {
        if (destination_list.has(layer.options.id) == false && layer.options.id != departure_station) {
            layer.setIcon(L.icon({"iconSize": [10,10], "iconAnchor": [5,5], "iconUrl":"images/icons/circle.png"}))
        }
    })
    $("#se-loading-function").fadeOut(1000);
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
