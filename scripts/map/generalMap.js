//focus on station
function focus_station(city_id,route){
    route.eachLayer(function(layer){
        if(layer.options.id === city_id){
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
            if(layer.options.cluster == undefined) {
                layer.setOpacity(0.2);
            }
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


    $(document).on('change','#selected_date',function() {
        let query_date = buildQueryDate($('#selected_date').val());
        if(typeof previous_marker === 'undefined' && last_checked_time !== $('#selected_date').val()){
            setTimeout(async function () {
                delay(400);
                await getTrainRecords(query_date);
            }, 400);
        }
    });

    /*/
    $(document).on('change','#trip_type',function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let trip_type = $("input[name='trip_type']:checked").attr("id");
        let time_restriction = $("input[name='trip']:checked").attr("id");
        let journey_type = $("input[name='journey_type']:checked").attr("id");
        if(last_checked_trip_type != $("input[name='trip']:checked").attr("id")){
            setTimeout(async function () {
                delay(500);
                if(typeof previous_marker !== 'undefined') {
                    $("#se-loading-function").css({"display" : "block"});
                    const eventMaker = async () => {
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                        await displayTickets(map);
                        if (journey_type === 'no_return') {
                            console.log('no return');
                            getCityConnections(query_date,previous_marker,trip_type,time_restriction);
                        } else {
                            if(journey_type === 'one_day') {
                                let return_option = $("input[name='oneday_type']:checked").attr("id");
                                getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                            } else {
                                let return_option = buildQueryDate($('#return_date').val());
                                getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                            }
                        }
                    }
                    setTimeout(function(){
                        // start working right after selecting destination
                        eventMaker();
                    }, 100);
                }
            }, 1000);
        }
    });
    $(document).on('change','#time_buttons',function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let trip_type = $("input[name='trip_type']:checked").attr("id");
        let time_restriction = $("input[name='trip']:checked").attr("id");
        let journey_type = $("input[name='journey_type']:checked").attr("id");
        if(last_checked_trip_time != $("input[name='trip']:checked").attr("id")){
            setTimeout(async function () {
                delay(500);
                if(typeof previous_marker !== 'undefined') {
                    $("#se-loading-function").css({"display" : "block"});
                    const eventMaker = async () => {
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                        await displayTickets(map);
                        if (journey_type === 'no_return') {console.log('no return');
                            getCityConnections(query_date,previous_marker,trip_type,time_restriction); }
                        else {
                            if(journey_type === 'one_day') {
                                let return_option = $("input[name='oneday_type']:checked").attr("id");
                                getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                            } else {
                                let return_option = buildQueryDate($('#return_date').val());
                                getRoundTrip(previous_marker, trip_type, time_restriction, return_option)
                            }
                        }
                    }
                    setTimeout(function(){
                        // start working right after selecting destination
                        eventMaker();
                    }, 100);
                }
            }, 1000);
        }
    });
    $(document).on('change','input[name="oneday_type"], #return_date, #no_return',function() {
        let query_date = buildQueryDate($('#selected_date').val());
        let trip_type = $("input[name='trip_type']:checked").attr("id");
        let time_restriction = $("input[name='trip']:checked").attr("id");
        let journey_type = $("input[name='journey_type']:checked").attr("id");
        if(last_checked_journey_type != $(this).attr("id") && last_checked_journey_type != $(this).val()) {
            setTimeout(async function () {
                delay(500);
                if(typeof previous_marker !== 'undefined') {
                    $("#se-loading-function").css({"display" : "block"});
                    const eventMaker = async () => {
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                        await displayTickets(map);
                        if (journey_type === 'no_return') {console.log('no return');
                            last_checked_journey_type = $(this).attr("id");
                            getCityConnections(query_date,previous_marker,trip_type,time_restriction);
                        }
                        else {
                            if(journey_type === 'one_day') {
                                let return_option = $("input[name='oneday_type']:checked").attr("id");
                                console.log(return_option)
                                last_checked_journey_type = $(this).attr("id");
                                getRoundTrip(previous_marker, trip_type, time_restriction, return_option);
                            } else {
                                last_checked_journey_type = $('#selected_date').val();
                                let return_option = buildQueryDate($('#return_date').val());
                                getRoundTrip(previous_marker, trip_type, time_restriction, return_option)
                            }
                        }
                    }
                    setTimeout(function(){
                        // start working right after selecting destination
                        eventMaker();
                    }, 100);
                }
            }, 1000);
        }
    });
    /*/

    $(document).on('click','#search_btn',function() {
        if ($('#destination_select').val() != "On part d'où ?") {
            let val = $('#destination_select').val().charAt(0).toUpperCase() + $('#destination_select').val().slice(1)
            let obj = $("#destination_browser").find("option[value='" + val + "']");
            if(obj != null && obj.length > 0) {
                $("#se-loading-function").css({"display" : "block"});
                $("#destination_select").blur();
                const eventMaker = async () => {
                    if(last_checked_time !== $('#selected_date').val()){
                                setTimeout(async function () {
                                    delay(400);
                                    await getTrainRecords(query_date);
                                }, 100)
                    }
                    let destination_id = $('#destination_browser [value="' + val + '"]').data('value');
                    let found = false;
                    if(typeof previous_marker !== 'undefined'){
                            tripLayer.eachLayer(function (layer) {
                                layer.remove();
                            });
                            markerLayer.eachLayer(function (layer) {
                                layer.setOpacity(0.2);
                            });
                    }
                    markerLayer.eachLayer(function (layer) {
                        if (destination_id == layer.options.id && found == false) {
                                //console.log(layer);
                                onDestinationChange(layer);
                                found = true;
                        }
                    });
                }
                setTimeout(function(){
                    // start working right after selecting destination
                    eventMaker();
                }, 100);
            }
        } else {
            alert("Merci de renseigner une destination");
        }
    });

    /*/$(document).on('change enterKey','#destination_select',function() {
        let val = $('#destination_select').val().charAt(0).toUpperCase() + $('#destination_select').val().slice(1)
        let obj = $("#destination_browser").find("option[value='" + val + "']");
        if(obj != null && obj.length > 0) {
            $("#se-loading-function").css({"display" : "block"});
            $("#destination_select").blur();
            const eventMaker = async () => {
                let destination_id = $('#destination_browser [value="' + val + '"]').data('value');
                let found = false;
                if(typeof human_click === 'undefined'){
                    if(typeof previous_marker !== 'undefined'){
                        tripLayer.eachLayer(function (layer) {
                            layer.remove();
                        });
                        markerLayer.eachLayer(function (layer) {
                            layer.setOpacity(0.2);
                        });
                    }
                    human_click = undefined;
                    markerLayer.eachLayer(function (layer) {
                        if (destination_id == layer.options.id && found == false) {
                            //console.log(layer);
                            onDestinationChange(layer);
                            found = true;
                        }
                    });
                } else {
                    human_click = undefined;
                }
            }
            setTimeout(function(){
                // start working right after selecting destination
                eventMaker();
            }, 100);
        }
    }); /*/

    function onDestinationChange(event) {
        console.log('test')
        let isActiveSearch = true;
        //clear previous elements
        clear_selection();
        //make it visible
        event.setOpacity(1);
        //store marker
        previous_marker = event;
        last_checked_departure = event.options.id
        //fly to selected marker
        //map.flyTo(event.getLatLng(),6,{'animate':true});
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
            }
            }
        }
    }


    function ondbClick(event) {
        console.log("[ondbClick] Enter in event method");
        $("#se-loading-function").css({"display" : "block"});
        const eventMaker = async () => {
            //clear previous elements
            clear_selection();
            //make it visible
            event.sourceTarget.setOpacity(1);
            //store marker
            previous_marker = event.sourceTarget;
            last_checked_departure = event.sourceTarget.options.id;
            //fly to selected marker
            //map.flyTo(event.sourceTarget.getLatLng(),6.5,{'animate':true});
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
            var timer = 0;
            if (journey_type === 'no_return') {
                console.log('no return');
                getCityConnections(query_date, query_marker, trip_type, time_restriction);
            } else {
                if (journey_type === 'one_day') {
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

            }
        }
        setTimeout(function(){
            // start working right after selecting destination
            eventMaker();
        }, 100);
    }

    function onClick(event) {
        if($('#' + event.sourceTarget.options.id).length > 0) {
            var element = document.getElementById(event.sourceTarget.options.id)
            element.scrollIntoView();
        } else {
            console.log('The element does not exist')
        }
    }

    function add_station(city_id,city_data){
        if (city_data.length > 1) {
        let markers = L.featureGroup();
        city_data.forEach(function (station) {
            var marker_destination = L.marker(
                [station.lat,station.lon],
                {"id":city_id ,"city":station.city, "iata":station.iata_code}
            ).on('dblclick', ondbClick).on('click',onClick).setOpacity(0.6).bindTooltip(station.city,{permanent: false, direction: 'right'})

            marker_destination.on({
                click: function() {
                    this.openPopup();
                }
            })
            markers.addLayer(marker_destination);
        })
            var marker_destination = L.marker(
                [markers.getBounds().getCenter().lat,markers.getBounds().getCenter().lng],
                {"id":city_id ,"city":city_data[0].city}
            ).on('dblclick', ondbClick).on('click',onClick).setOpacity(0.6).bindTooltip(city_data[0].city,{permanent: false, direction: 'right'})
            if (L.Browser.mobile) {
                var custom_icon = L.icon({"iconSize": [10,10], "iconAnchor": [15,15], "iconUrl":"images/icons/placeholder.png"});
                marker_destination.setIcon(custom_icon);
            }else{
                var custom_icon = L.icon({"iconSize": [20,20], "iconAnchor": [10,10], "iconUrl":"images/icons/placeholder.png"});
                marker_destination.setIcon(custom_icon);
            }
        markerLayer.addLayer(marker_destination)
        } else {
            city_data.forEach(function (station) {
            var marker_destination = L.marker(
                [station.lat,station.lon],
                {"id":city_id ,"city":station.city, "iata":station.iata_code}
            ).on('dblclick', ondbClick).on('click',onClick).setOpacity(0.6).bindTooltip(station.city,{permanent: false, direction: 'right'})

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
        })
        }
    }


        let idx = 0;
        station.forEach(function(data){
            add_station(idx,data)
            idx = idx +1;
        });
        map.fitBounds(markerLayer.getBounds());

});





