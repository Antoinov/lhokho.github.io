var weather = firebase.database().ref("city/weather");

function displayWeatherOnMap(map,current_marker){
    let city_id = current_marker.options.id;
    console.log(city_id);
    const display = async () => {
        retrieveWeatherInformation(city_id).then(function(weather_raw_data) {
            console.log(weather_raw_data);
            let url1 = weather_raw_data.icon_urls[0];
            let url2 = weather_raw_data.icon_urls[1];
            let url3 = weather_raw_data.icon_urls[2];
            let temp = '   '+weather_raw_data.temps[0]+'   ';
            console.log(temp)
            html = '<a id="html_'+city_id+'" style="color:white;" href="destination.html?city='+city_id+'" target="_blank"">'+current_marker.options.city+'</a><br/>'+ temp+'\°  <br/>'
                +'<img class="roundrect" style="border-radius: 15px;" src="images/city/bg_'+city_id+'.jpg" alt="maptime logo gif" width="145px" height="90px"/><br/>';
            let html_base = html
                +'<img class="" id="icon_1" src='+url1+' alt="" width="45px" height="40px">|<img class="" id="icon_2" src='+url2+' alt="" width="45px">|<img class="" id="icon_3" src='+url3+' alt="" width="45px"><br/>';
            let html_weather = html_base + '<div class="row"><div class="text-center col-sm"><a id="bar_'+city_id+'" href="#"  ><i class="fas fa-info-circle fa-2x info_select"  style="color:white; "></i></a></div><div class="text-center col-sm "><a id="route_'+city_id+'" href="#" ><i class="fas fa-train fa-2x info_select" style="color:white;"></i></a></div></div>';
            current_marker._popup.setContent(html_weather)

            $( "#bar_"+city_id ).bind( "click", function() {
                map.flyTo(current_marker.getLatLng(),15,{'easeLinearity':1.0});
                map.closePopup();
                //var static = new L.Layer.StaticOverlay().addTo(map);
                const builder = async () => {
                    await delay(5000);
                    console.log("load city info data...");
                    let localLayers = L.control.layers();
                    localLayers.addTo(map);
                    buildBarLayer(map,city_id,html_base,localLayers);
                };
                builder();
            });

            $( "#route_"+city_id ).bind( "click", function() {
                map.flyTo(current_marker.getLatLng(),10,{'easeLinearity':1.0});
                map.closePopup();
                const builder = async () => {
                    await delay(5000);
                    console.log("load local route data...");
                    let localLayers = L.control.layers();
                    localLayers.addTo(map);
                    buildLocalTripLayer(map,city_id);
                };
                builder();
            });
        })
    };
    display();
}

function displayWeatherOnDestination(city_id){
    const display = async () => {
        retrieveWeatherInformation(city_id).then(function(weather_raw_data) {
            console.log(weather_raw_data);
            for (let i = 1; i <= weather_raw_data.dates.length; i++) {
                document.getElementById('w_'+i.toString()).append(weather_raw_data.dates[i-1]);
                document.getElementById('temp_'+i.toString()).append(weather_raw_data.temps[i-1]);
                document.getElementById('icon_'+i.toString()).src = weather_raw_data.icon_urls[i-1];
            }
        });
    };
    display();
}

function check_existing_weather(city_id,weather_raw_data) {
    //get firebase snapshot of weather data
    let weather = firebase.database().ref("city/weather");
    //access to weather data
    let checkdb = false;
    weather.once("value", function(dataset) {
        dataset.forEach(function(childNodes){
            //check if database element has been updated in the last 24hours
            let last_update = childNodes.val()[0].date;
            let today = new Date().getTime();
            let diff = Math.abs(today - last_update);
            let isFreshWeather = ( diff < (1 * 24 * 60 * 60 * 1000) );
            if(childNodes.key == city_id && isFreshWeather){
                console.log('weather data found in database')
                let day_after = 0;
                childNodes.val().forEach(function(weather_data){
                    let date_tmp = new Date(weather_data.date);
                    let date_str = (date_tmp.getDate() + day_after) + '/' + (date_tmp.getMonth() + 1);
                    weather_raw_data.dates.push(date_str);
                    weather_raw_data.temps.push(weather_data.temp);
                    weather_raw_data.icon_urls.push(weather_data.icon);
                    day_after = day_after + 1;
                })
            }

        });
        checkdb = true;
    });
    const waiter = async () => {
        while(!checkdb){
            console.log('waiting to gather data from database...')
            await delay(100);
        }

    };
    waiter();

    return Promise.resolve();
}

function acceptWeather(trip,condition){
    let isAccepted = true;
    var url_arrival = 'https://api.openweathermap.org/data/2.5/onecall?lat=%lat&lon=%lon&lang=fr&appid=5e0c07d2d939d7a1cbaadf4d6d0ee1bf&units=metric'
        .replace('%lat', trip.arrival_coords[0].toString())
        .replace('%lon', trip.arrival_coords[1].toString());
    var url_departure = 'https://api.openweathermap.org/data/2.5/onecall?lat=%lat&lon=%lon&lang=fr&appid=5e0c07d2d939d7a1cbaadf4d6d0ee1bf&units=metric'
    .replace('%lat', trip.departure_coords[0].toString())
    .replace('%lon', trip.departure_coords[1].toString());
    let departure_data = undefined;
    let arrival_data = undefined;

    $.getJSON(url_departure, function (data) {
        data.daily.forEach(function(daily_data){
            let today_check = new Date(daily_data.dt);
            if(today_check.getDate() === trip.day.split('-')[2]){
                departure_data = daily_data;
            }
            
        })

        $.getJSON(url_arrival, function (data) {
            data.daily.forEach(function(daily_data){
                let today_check = new Date(daily_data.dt);
                if(today_check.getDate() === trip.day.split('-')[2]){
                    arrival_data = daily_data;
                }
            })
            
            if(condition === 'hot'){
                isAccepted = (departure_data.temp.day < (arrival_data.temp.day + 5))
            }else if(condition === 'cold'){
                isAccepted= (departure_data.temp.day > (arrival_data.temp.day + 5))
            }else if(condition === 'sun'){
                isAccepted = arrival_data.weather[0].main == 'Clear';
            }else{
                isAccepted = true;
            }
        });

        console.log(data);
        return isAccepted;
    
    });
}

function retrieveWeatherInformation(city_id){
    //weather data to retrieve
    var weather_raw_data = {
        dates:[],
        temps:[],
        icon_urls: []
    };
    return new Promise(resolve => {
        //asynchronous call to weather API if not in db
        check_existing_weather(city_id,weather_raw_data).then(function(){
            //if no data in current database
            if(weather_raw_data.dates.length === 0 ){
                station.on("value", function(dataset) {
                    dataset.forEach(function(childNodes){
                        if(childNodes.key == city_id){
                            queryAndStoreWeather(city_id,weather_raw_data,childNodes.val());
                        }
                    });
                    const waiter = async () => {
                        while(weather_raw_data.dates.length < 3){
                            console.log('waiting to gather data from api...')
                            await delay(100);

                        }
                        resolve(weather_raw_data);
                    };

                    waiter();
                });
            }

        });
    });
}

function queryAndStoreWeather(city_id,weather_raw_data, data_list) {
    if (data_list !== 0) {
        console.log('location available :  add weather data');
        var lat = data_list[0]['lat'];
        var lon = data_list[0]['lon'];
        var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=%lat&lon=%lon&lang=fr&appid=5e0c07d2d939d7a1cbaadf4d6d0ee1bf&units=metric'
            .replace('%lat', lat.toString())
            .replace('%lon', lon.toString())
        $.getJSON(url, function (data) {
            console.log(data);
            var today = new Date();
            for (let k = 0; k < 3; k++) {
                let date_str = (today.getDate() + k) + '/' + (today.getMonth() + 1);
                let src_url = 'https://openweathermap.org/img/wn/%s@2x.png'.replace('%s', (data['daily'][k]['weather'][0]['icon']).toString())
                weather_raw_data.dates.push(date_str);
                weather_raw_data.temps.push(Math.round(data['daily'][k]['temp']['day']));
                weather_raw_data.icon_urls.push(src_url);
                var object = {'date': new Date().getTime(), 'temp' : Math.round(data['daily'][k]['temp']['day']),'icon':src_url}
                weather.child(city_id).child(k).set(object).then().catch((error) => {
                    console.error(error);
                });
            }
        });
    } else {
        console.log('weather unavailable')
    }
}


