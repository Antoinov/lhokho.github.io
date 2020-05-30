$(document).ready(function(){

    var city_id = window.location.search.substr(1).split("=")[1];

    informations = firebase.database().ref("city/info");
    items = firebase.database().ref("city/items");
    beers = firebase.database().ref("city/beer");

    //retrieve general information
    informations.on("value", function(dataset) {
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                console.log(childNodes.val());
                $('#background').css({'background-image': 'url(images/city/bg_'+childNodes.key+'.jpg)'});
                getCityInformation(childNodes.val())
            }
        });
    });

    function getCityInformation(data) {
        console.log('retrieve general information in database')
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
    items.on("value", function(dataset) {
        let data_list = [];
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                console.log(childNodes.val());
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
            console.log(data_list)
            for (let i = 0; i < 12; i++){
                let focus = data_list[i];
                let str = "img_src_%s".replace('%s',(i + 1).toString())
                let str2 = "img_title_%s".replace('%s',(i + 1).toString())
                document.getElementById(str).title = focus['name'];
                document.getElementById(str).onclick = function() {window.open(focus['wiki_link'], '_blank')};
                document.getElementById(str).src = focus['image_src'];
                document.getElementById(str2).append(focus['name']);
            }
            $("#items_container").show();
        } else {
            $("#items-link").hide();
        }
    }

    //retrieve city general beer information if it exists

    beers.on("value", function(dataset) {
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                console.log(childNodes.val());
                getCityBars(childNodes.val())
            }
        });
    });

    function getCityBars(data_list){
        if (data_list !== 0) {
            console.log('beer available')
            $("#av_HH").append(data_list['average_price_HH']);
            $("#av_nHH").append(data_list['average_price_nHH']);
            $("#min_HH").append(data_list['price_min_HH']);
            $("#min_nHH").append(data_list['price_min_nHH']);
            dict = data_list['ranking']
            console.log(dict)
            for (var key in dict) {
                var value = dict[key];
                console.log(value);
                var key = key;
                console.log(key);
                document.getElementById("ranking").append(key);
                document.getElementById("ranking").appendChild(document.createElement('br'));
            }
        }else{
            console.log('beer unavailable')
            document.getElementById("beer_container").style.display = "none";
        }
    }

});


