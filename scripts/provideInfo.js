$(document).ready(function(){

    var city_id = window.location.search.substr(1).split("=")[1];



    informations = firebase.database().ref("city/info");
    items = firebase.database().ref("city/items");
    beers = firebase.database().ref("city/beer");
    station = firebase.database().ref("city/station");
    weather = firebase.database().ref("city/weather");
    station = firebase.database().ref("city/station")
    weather = firebase.database().ref("city/weather")
    news = firebase.database().ref("city/news")

    //retrieve general information
    informations.on("value", function(dataset) {
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                //console.log(childNodes.val());
                $('#background').css({'background-image': 'url(images/city/bg_'+childNodes.key+'.jpg)'});
                getCityInformation(childNodes.val())
            }
        });
    });
    function check_existing_news() {
            //get firebase snapshot of weather data
            return news.once("value", function(dataset) {
                dataset.forEach(function(childNodes){
                    //check if database element has been updated in the last 24hours
                    let last_update = childNodes.val().date;
                    let today = new Date().getTime();
                    let diff = Math.abs(today - last_update);
                    let isFreshNews = ( diff < (1 * 24 * 60 * 60 * 1000) );
                    if(childNodes.key === city_id && isFreshNews){
                        console.log('news found in database')
                        PopulateCityNews(childNodes.val());
                        isThereNews = true;
                    }
                });
            });
    }
    let isThereNews = false;

    check_existing_news().then(function(){
        if(!isThereNews){
            informations.on("value", function(dataset) {
                dataset.forEach(function(childNodes){
                    if(childNodes.key === city_id){
                        AddCityNews(childNodes.val());
                    }
                });

            });
        }
    }).catch();

    function PopulateCityNews(data_list){
        if (data_list !== undefined) {
            console.log('location available :  populate news data from db');
            const length = data_list['news']['totalResults'] - 1
            for (let i = 0; i < 3; i++){
                let randIndex = Math.floor(Math.random() * length)
                console.log(randIndex)
                let title = "news_title_%s".replace('%s',(i + 1).toString())
                let content = "news_content_%s".replace('%s',(i + 1).toString())
                let link = "news_link_%s".replace('%s',(i + 1).toString())
                let img = "news_img_%s".replace('%s',(i + 1).toString())
                document.getElementById(title).append(data_list['news']['articles'][randIndex]['title']);
                document.getElementById(content).append(data_list['news']['articles'][randIndex]['description']);
                document.getElementById(img).onclick = function() {window.open(data_list['news']['articles'][randIndex]['url'], '_blank')};
                document.getElementById(img).src = data_list['news']['articles'][randIndex]['urlToImage']
            }
        }
    }

    function AddCityNews(data) {
        var city_name = data['ville'];
        var city_dept = data['departement'];
        var today = new Date();
        var to = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var from = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-2);
        var url = 'https://newsapi.org/v2/everything?qInTitle=+%city_name&language=fr&from=%from&to=%to&apiKey=c5eba9aaad354ffd9992eb65f5273c05'.replace('%city_name',city_name.toString()).replace('%from',from.toString()).replace('%to',to.toString())
        $.getJSON(url, function(data){
            console.log('API called');
            console.log(data);
            var length = data['totalResults']
            if (length > 20) {length = 20}
            if (data['totalResults'] > 2) {
                var object = {'date': new Date().getTime(), 'news' : data}
                        news.child(city_id).set(object).then().catch((error) => {
                            console.error(error);
                        });
                for (let i = 0; i < 3; i++){
                        let randIndex = Math.floor(Math.random() * length)
                        console.log(randIndex)
                        let title = "news_title_%s".replace('%s',(i + 1).toString())
                        let content = "news_content_%s".replace('%s',(i + 1).toString())
                        let link = "news_link_%s".replace('%s',(i + 1).toString())
                        let img = "news_img_%s".replace('%s',(i + 1).toString())
                        console.log(data['articles'][randIndex]['title'])
                        console.log(data['articles'][randIndex]['description'])
                        console.log(data['articles'][randIndex]['url'])
                        document.getElementById(title).append(data['articles'][randIndex]['title']);
                        document.getElementById(content).append(data['articles'][randIndex]['description']);
                        document.getElementById(img).onclick = function() {window.open(data['articles'][randIndex]['url'], '_blank')};
                        document.getElementById(img).src = data['articles'][randIndex]['urlToImage']
                        }
            } else { var url_2 = 'https://newsapi.org/v2/everything?q=%city_nameOR%city_dept&language=fr&from=%from&to=%to&apiKey=c5eba9aaad354ffd9992eb65f5273c05'.replace('%city_name',city_name.toString()).replace('%city_dept',city_dept.toString()).replace('%from',from.toString()).replace('%to',to.toString())
                    $.getJSON(url_2, function(new_data) {
                        var object = {'date': new Date().getTime(), 'news' : new_data}
                        news.child(city_id).set(object).then().catch((error) => {
                            console.error(error);
                        });
                        for (let i = 0; i < 3; i++){
                        let randIndex = Math.floor(Math.random() * length)
                        const length = new_data['totalResults']
                        console.log(randIndex)
                        let title = "news_title_%s".replace('%s',(i + 1).toString())
                        let content = "news_content_%s".replace('%s',(i + 1).toString())
                        let link = "news_link_%s".replace('%s',(i + 1).toString())
                        let img = "news_img_%s".replace('%s',(i + 1).toString())
                        document.getElementById(title).append(new_data['articles'][randIndex]['title']);
                        document.getElementById(content).append(new_data['articles'][randIndex]['description']);
                        document.getElementById(link).onclick = function() {window.open(new_data['articles'][randIndex]['url'], '_blank')};
                        document.getElementById(img).src = new_data['articles'][randIndex]['urlToImage']
                        }
                        })
                    }})
        }

    function getCityInformation(data) {
        //console.log('retrieve general information in database')
        $( "#city_welcome" ).append(data["ville"]);
        $( "#city_region" ).append(data["region"]);
        $( "#city_departement" ).append(data["departement"]);
        $( "#city_population" ).append(data["population"]);
        $( "#city_densite" ).append(data["densite"]);
        $( "#city_gentile" ).append(data["gentile"]);
        $( "#city_altitude" ).append(data["altitude"]);
        $( "#city_superficie" ).append(data["superficie"]);
    }

    //retrieve city items if it exists
    let cat = ['monument','lieu','museum','food'];
    items.on("value", function(dataset) {
        let data_list = [];
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                //console.log(childNodes.val());
                childNodes.forEach(function(item) {
                    var itemVal = item.val();
                    data_list.push(itemVal);
                });
                function func(a, b) {
                    return Math.random();
                }
                data_list = data_list.sort(func);
            }
        });
        getCityItem(data_list);
    });

    function getCityItem(data_list){
        if (data_list !== null && data_list !== undefined && data_list.length > 0) {
            //console.log(data_list)
            cr = 0;
            cat.forEach(function(cat){
                idx = 0;
                ct = 0;
                while(ct < 3 || idx === data_list.length-1){
                    let focus = data_list[idx];
                    if(focus['type'] === cat){
                        //console.log(cat);
                        let str = "img_src_%s".replace('%s',(cr + 1).toString())
                        let str2 = "img_title_%s".replace('%s',(cr + 1).toString())
                        document.getElementById(str).title = focus['name'];
                        document.getElementById(str).onclick = function() {window.open(focus['wiki_link'], '_blank')};
                        document.getElementById(str).src = focus['image_src'];
                        document.getElementById(str2).append(focus['name']);
                        ct = ct + 1;
                        cr = cr + 1;
                    }
                    idx = idx + 1;
                }
            })
            $("#items_container").show();
        } else {
            $("#items-link").hide();
        }
    }

    //retrieve city general beer information if it exists

    beers.on("value", function(dataset) {
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                //console.log(childNodes.val());
                getCityBars(childNodes.val())
            }
        });
    });

    function getCityBars(data_list){
        if (data_list !== 0) {
            //console.log('beer available')
            //console.log(data_list['price_min_HH'])
            $("#av_HH").append(data_list['average_price_HH'] !== undefined ? data_list['average_price_HH'] : 'N.A.');
            $("#av_nHH").append(data_list['average_price nHH'] !== undefined ? data_list['average_price nHH'] : 'N.A.');
            $("#min_HH").append(data_list['price_min_HH'] !== undefined ? data_list['price_min_HH'] : 'N.A.');
            $("#min_nHH").append(data_list['price_min_nHH'] !== undefined ? data_list['price_min_nHH'] : 'N.A.');
            dict = data_list['ranking']
            if(dict !== 'None'){
                //console.log(dict)
                for (var key in dict) {
                    var value = dict[key];
                    //console.log(value);
                    var key = key;
                    //console.log(key);
                    document.getElementById("ranking").append(key);
                    document.getElementById("ranking").appendChild(document.createElement('br'));
                }
            }else{
                $("#ranking").hide();
                $("#ranking_label").hide();
            }
            $("#beer_container").show();
        }else{
            //console.log('beer unavailable')
            $("#beer_link").hide();
        }
    }

    //check if weather data already in the database
    let isThereData = false;

    function check_existing_weather() {
        //get firebase snapshot of weather data
        return weather.once("value", function(dataset) {
            dataset.forEach(function(childNodes){
                //check if database element has been updated in the last 24hours
                let last_update = childNodes.val()[0].date;
                let today = new Date().getTime();
                let diff = Math.abs(today - last_update);
                let isFreshWeather = ( diff < (1 * 24 * 60 * 60 * 1000) );
                if(childNodes.key === city_id && isFreshWeather){
                    console.log('weather data found in database')
                    PopulateCityWeather(childNodes.val());
                    isThereData = true;
                }
            });
        });
    }
    //asynchronous call to weather API if not in db
    check_existing_weather().then(function(){
        if(!isThereData){
            station.on("value", function(dataset) {
                dataset.forEach(function(childNodes){
                    if(childNodes.key === city_id){
                        addCityWeather(childNodes.val());
                    }
                });

            });
        }
    }).catch();




    //retrieve city location (lat,lon) information if it exists and populate the weather
    function PopulateCityWeather(data_list){
        if (data_list !== undefined) {
            let day_date = new Date(data_list[0]['date']);
            console.log('location available :  populate weather data from db');
            for (let i = 0; i < 3; i++){
                let date_str = (day_date.getDate()+i)+'/'+(day_date.getMonth()+1);
                let wt = "w_%s".replace('%s',(i + 1).toString())
                let wth = "temp_%s".replace('%s',(i + 1).toString())
                let wth2 = "icon_%s".replace('%s',(i + 1).toString())
                let url = data_list[i]['icon'];
                document.getElementById(wt).append(date_str);
                document.getElementById(wth).append(Math.round(data_list[i]['temp']));
                document.getElementById(wth2).src = url;
            }
        }
    }
    function addCityWeather(data_list){
        if (data_list !== 0) {
            console.log('location available :  add weather data');
            var lat = data_list[0]['coords'][1]
            var lon = data_list[0]['coords'][0]
            var url = 'https://api.openweathermap.org/data/2.5/onecall?lat=%lat&lon=%lon&lang=fr&appid=5e0c07d2d939d7a1cbaadf4d6d0ee1bf&units=metric'.replace('%lat',lat.toString()).replace('%lon',lon.toString())
            $.getJSON(url, function(data){
                console.log(data);
                var today = new Date();
                for (let k = 0; k < 3; k++){
                    let date_str = (today.getDate()+k)+'/'+(today.getMonth()+1);
                    let wt = "w_%s".replace('%s',(k + 1).toString())
                    let wth = "temp_%s".replace('%s',(k + 1).toString())
                    let wth2 = "icon_%s".replace('%s',(k + 1).toString())
                    let url = 'https://openweathermap.org/img/wn/%s@2x.png'.replace('%s',(data['daily'][k]['weather'][0]['icon']).toString())
                    document.getElementById(wt).append(date_str);
                    document.getElementById(wth).append(Math.round(data['daily'][k]['temp']['day']));
                    document.getElementById(wth2).src = url;
                    var object = {'date': new Date().getTime(), 'temp' : Math.round(data['daily'][k]['temp']['day']),'icon':url}
                    weather.child(city_id).child(k).set(object).then().catch((error) => {
                        console.error(error);
                    });
                }
            })
        }else{
            console.log('weather unavailable')
            document.getElementById("weather_container").style.display = "none";
        }
    }



});


