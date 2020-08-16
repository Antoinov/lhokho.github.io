//focus on station
function focus_station(city_id,route){
    route.eachLayer(function(layer){
        if(layer.options.id == city_id){
            layer.fire('click');
        }
    })
}

function Search(){
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("tickets");
    li = ul.getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("p")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        };
    };
}

function displayTickets(map){
    console.log('display tickets...');

    var info_line = L.control({
        position : 'bottomright'
    });

    let tickets_html = '<input type="text" id="myInput" onkeyup="Search()" placeholder="Search for cities.."><div  class="Content"><ul style="padding: 0;list-style-type:none;" id="tickets" role="tablist" aria-multiselectable="true"></ul></div>'
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

        if (typeof localTrainLayer !== 'undefined') {
            localTrainLayer.clearLayers();
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
    var human_click = undefined;
    //retrieve map from global variable
    var map =  mapsPlaceholder[0];

    //work on change event
    /*$("#destination_select").change(function(event) {
        var id = $(this).children(":selected").attr("id");
        let city_id = id.replace(/\D/g,'');
        if (event.originalEvent !== undefined) {
            focus_station(city_id,markerLayer);
        }
    });*/

    $('#selected_date').change(function() {
    let query_date = buildQueryDate($('#selected_date').val());
    let trip_type = $("input[name='trip_type']:checked").attr("id");
    let time_restriction = $("input[name='trip']:checked").attr("id");
    let journey_type = $("input[name='journey_type']:checked").attr("id");
    if(last_checked_time != $('#selected_date').val()){
                setTimeout(async function () {
                    delay(500);
                    await getTrainRecords(query_date);
                    if(typeof previous_marker !== 'undefined'){
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                    await displayTickets(map);
                    if (journey_type == 'no_return') {console.log('no return');
                        getCityConnections(query_date,previous_marker,trip_type,time_restriction); }
                    else {
                        if(journey_type == 'one_day') {
                            let return_option = $("input[name='oneday_type']:checked").attr("id");
                            getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                        } else {
                            let return_option = buildQueryDate($('#return_date').val());
                            getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                        }
                    }
                }
            }, 1000);
        }
    });

    $('#trip_type').change(function(){
    let query_date = buildQueryDate($('#selected_date').val());
    let trip_type = $("input[name='trip_type']:checked").attr("id");
    let time_restriction = $("input[name='trip']:checked").attr("id");
    let journey_type = $("input[name='journey_type']:checked").attr("id");
    let destination_id = $('#destination_select').val();
    if(last_checked_trip_type != $("input[name='trip']:checked").attr("id")){
        setTimeout(async function () {
                    delay(500);
                    if(typeof previous_marker !== 'undefined') {
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                    await displayTickets(map);
                    if (journey_type == 'no_return') {console.log('no return');
                        getCityConnections(query_date,previous_marker,trip_type,time_restriction); }
                    else { if(journey_type == 'one_day') {
                        let return_option = $("input[name='oneday_type']:checked").attr("id");
                        getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                    } else {
                        let return_option = buildQueryDate($('#return_date').val());
                        getRoundTrip(previous_marker, trip_type, time_restriction, return_option)
                    };
                    };
                };
            }, 1000);
        };
    });

    $('#time_buttons').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        // let weather_restriction = $("input[name='weather']:checked").attr("id");
        let trip_type = $("input[name='trip_type']:checked").attr("id");
        let time_restriction = $("input[name='trip']:checked").attr("id");
        let journey_type = $("input[name='journey_type']:checked").attr("id");
        if(last_checked_trip_time != $("input[name='trip']:checked").attr("id")){
        setTimeout(async function () {
                    delay(500);
                    if(typeof previous_marker !== 'undefined') {
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                        await displayTickets(map);
                    if (journey_type == 'no_return') {console.log('no return');
                        getCityConnections(query_date,previous_marker,trip_type,time_restriction); }
                    else { if(journey_type == 'one_day') {
                        let return_option = $("input[name='oneday_type']:checked").attr("id");
                        getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                    } else {
                        let return_option = buildQueryDate($('#return_date').val());
                        getRoundTrip(previous_marker, trip_type, time_restriction, return_option)
                    };
                    };
                };
            }, 1000);
        };
    });

    $('input[name="oneday_type"], #return_date, #no_return').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let trip_type = $("input[name='trip_type']:checked").attr("id");
        let time_restriction = $("input[name='trip']:checked").attr("id");
        let journey_type = $("input[name='journey_type']:checked").attr("id");
        if(last_checked_journey_type != $(this).attr("id") && last_checked_journey_type != $(this).val()) {
        setTimeout(async function () {
                    delay(500);
                    if(typeof previous_marker !== 'undefined') {
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                        await displayTickets(map);
                    if (journey_type == 'no_return') {console.log('no return');
                        last_checked_journey_type = $(this).attr("id");
                        getCityConnections(query_date,previous_marker,trip_type,time_restriction);
                        }
                    else { if(journey_type == 'one_day') {
                        let return_option = $("input[name='oneday_type']:checked").attr("id");
                        console.log(return_option)
                        last_checked_journey_type = $(this).attr("id");
                        getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                    } else {
                        last_checked_journey_type = $('#selected_date').val();
                        let return_option = buildQueryDate($('#return_date').val());
                        getRoundTrip(previous_marker, trip_type, time_restriction, return_option)
                    };
                    };
                };
            }, 1000);
        };
    });

    $('#destination_select').change(function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let weather_restriction = $("input[name='weather']:checked").attr("id");
        let time_restriction = $("input[name='time']:checked").attr("id");
        let destination_id = $('#destination_browser [value="' + $('#destination_select').val() + '"]').data('value')
        let found = false
        if(typeof human_click === 'undefined'){
            if(typeof previous_marker !== 'undefined'){
                tripLayer.eachLayer(function (layer) {
                        layer.remove();
                        });
                markerLayer.eachLayer(function (layer) {
                        layer.setOpacity(0.2);
                        });
            };
            human_click = undefined,
                markerLayer.eachLayer(function (layer) {
                    if (destination_id == layer.options.id && found == false) {
                        console.log(layer);
                        onDestinationChange(layer);
                        found = true;
                    }});
        };
    });

    function onDestinationChange(event) {
        let isActiveSearch = true;
        //clear previous elements
        clear_selection();
        //make it visible
        event.setOpacity(1);
        //store marker
        previous_marker = event;
        //fly to selected marker
        map.flyTo(event.getLatLng(),6.5,{'animate':true});
        let date = new Date();
        if(isActiveSearch){
            //close all popups
            event.closePopup();
            event.setIcon(L.icon({"iconSize": [25,25], "iconUrl":"images/icons/station.png"}));
            //retrieve date from form
            let query_date = buildQueryDate($('#selected_date').val());
            let query_marker = event;
            let weather_restriction = $("input[name='weather']:checked").attr("id");
            let time_restriction = $("input[name='trip']:checked").attr("id");
            let trip_type = $("input[name='trip_type']:checked").attr("id");
            let journey_type = $("input[name='journey_type']:checked").attr("id");
            //display ticket box
            displayTickets(map);
            if (journey_type == 'no_return') {console.log('no return');
                getCityConnections(query_date,query_marker,trip_type,time_restriction); }
            else { if(journey_type == 'one_day') {
                let return_option = $("input[name='oneday_type']:checked").attr("id");
                getRoundTrip(query_marker, trip_type, time_restriction, return_option);
            } else {
                let return_option = buildQueryDate($('#return_date').val());
                getRoundTrip(query_marker, trip_type, time_restriction, return_option)
            };
            };
        }
    }


    function ondbClick(event) {
        //clear previous elements
        clear_selection();
        //make it visible
        event.sourceTarget.setOpacity(1);
        //store marker
        previous_marker = event.sourceTarget;
        //fly to selected marker
        map.flyTo(event.sourceTarget.getLatLng(),6.5,{'animate':true});
        let date = new Date();
        //close all popups
        event.target.closePopup();
        event.sourceTarget.setIcon(L.icon({"iconSize": [25, 25], "iconUrl": "images/icons/station.png"}));
        let query_date = buildQueryDate($('#selected_date').val());
        let query_marker = event.sourceTarget;
        let time_restriction = $("input[name='trip']:checked").attr("id");
        let trip_type = $("input[name='trip_type']:checked").attr("id");
        let journey_type = $("input[name='journey_type']:checked").attr("id");
        displayTickets(map)
        if (journey_type == 'no_return') {
            console.log('no return');
            getCityConnections(query_date, query_marker, trip_type, time_restriction);

        } else {
            if (journey_type == 'one_day') {
                let return_option = $("input[name='oneday_type']:checked").attr("id");
                getRoundTrip(query_marker, trip_type, time_restriction, return_option);
            } else {
                let return_option = buildQueryDate($('#return_date').val());
                getRoundTrip(query_marker, trip_type, time_restriction, return_option)
            }
        }

        if (event.originalEvent !== undefined) {
            human_click = true;
            $('#destination_select').val(event.sourceTarget.options.city).change();
            human_click = undefined;

        }
    }

    function onClick(event) {
        if($('#' + event.sourceTarget.options.id).length > 0) {
            var element = document.getElementById(event.sourceTarget.options.id)
            element.scrollIntoView();
        } else {console.log('The element does not exist')};
    };

    function add_station(city_id,city_data){
        var marker_destination = L.marker(
            [city_data.lat,city_data.lon],
            {"id":city_id ,"city":city_data.city, "iata":city_data.iata_code}
        ).on('dblclick', ondbClick).on('click',onClick).setOpacity(0.2).bindTooltip(city_data.city,{permanent: false, direction: 'right'})

        marker_destination.on({
            click: function() {
                this.openPopup();
            }
        })

        //change when adapted to mobile website
        if (L.Browser.mobile) {
            var custom_icon = L.icon({"iconSize": [10,10], "iconAnchor": [15,15], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }else{
            var custom_icon = L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/placeholder.png"});
            marker_destination.setIcon(custom_icon);
        }

        markerLayer.addLayer(marker_destination);
    }


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

});





