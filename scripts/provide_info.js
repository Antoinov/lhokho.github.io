$(document).ready(function(){
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyDTzIHmzLtV18PlC_rhmUlVBoj0FMty2U8",
        authDomain: "lhokho.firebaseapp.com",
        databaseURL: "https://lhokho.firebaseio.com",
        projectId: "lhokho",
        storageBucket: "lhokho.appspot.com",
        messagingSenderId: "914809444198",
        appId: "1:914809444198:web:35ffb12ed619dd2de41aa7",
        measurementId: "G-KEBX9V4BPX"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    var city_name = window.location.search.substr(1).split("=")[1];
    background_name = city_name.replace('-','_')
    $('#background').css({'background-image': 'url(images/city/'+background_name+'.jpg)'});


    function getCityInformation(city_name) {

        city_name = city_name.charAt(0).toUpperCase() + city_name.slice(1);
        city_name = city_name.replace("_"," ");


        firebase.database().ref("city").orderByChild("ville").equalTo(city_name).on("value", function(snapshot) {
            console.log(snapshot.val())
            var data = snapshot.val();
            data = data[Object.keys(data)[0]];
            console.log(data)
            console.log('retrieve general information in database')
            $( "#city_welcome" ).append(data['ville']);
            $( "#city_region" ).append(data['region']);
            $( "#city_departement" ).append(data['departement']);
            $( "#city_population" ).append(data['population']);
            $( "#city_densite" ).append(data['densite']);
            $( "#city_gentile" ).append(data['gentile']);
            $( "#city_altitude" ).append(data['altitude']);
            $( "#city_superficie" ).append(data['superficie']);
        });
        //get items and interests information
        firebase.database().ref("items").orderByChild("ville").equalTo(city_name.toLowerCase()).on("value", function(snapshot) {
            var data = [];
            snapshot.forEach(function(item) {
                var itemVal = item.val();
                data.push(itemVal);
            });

            data = data.sort(func);

            function func(a, b) {
                return Math.random();
            }

            if (data != null) {
               console.log("items available")
               for (let i = 0; i < 11; i++){
                   let focus = data[i];
                   console.log(focus);
                   let str = "img_src_%s".replace('%s',(i + 1).toString())
                   let str2 = "img_title_%s".replace('%s',(i + 1).toString())
                   document.getElementById(str).title = focus['name'];
                   document.getElementById(str).onclick = function() {window.open(focus['wiki_link'], '_blank')};
                   document.getElementById(str).src = focus['image_src'];
                   document.getElementById(str2).append(focus['name']);
               }
           } else {
               document.getElementById("items_container").style.display = "none";
               $("#items-link").hide();
           }
        });
    }

    getCityInformation(city_name)
});



//
//$(document).ready(function() {
//    //get first arg
//
//    console.log(city_name);
//
//    $.ajax({
//        url: "/station/info",
//        type: "POST",
//        data: {
//            'city_name': city_name
//        },
//        success: function(answer) {
//            data = answer
//            console.log('function provide info launched')
//            $( "#city_welcome" ).append(data['city_name']);
//            $( "#city_region" ).append(data['region']);
//            $( "#city_departement" ).append(data['departement']);
//            $( "#city_population" ).append(data['population']);
//            $( "#city_densite" ).append(data['densite']);
//            $( "#city_gentile" ).append(data['gentile']);
//            $( "#city_altitude" ).append(data['altitude']);
//            $( "#city_superficie" ).append(data['superficie']);
//            $('#background').css({'background-image': data['city_img']});
//
//            if (data['beer']['availability'] != 0) {
//                console.log('beer available')
//                $( "#av_HH" ).append(data['beer']['average_price_HH']);
//                $( "#av_nHH" ).append(data['beer']['average_price_nHH']);
//                $( "#min_HH" ).append(data['beer']['cheapest_price_HH']);
//                $( "#min_nHH" ).append(data['beer']['cheapest_price_nHH']);
//                dict = data['beer']['beer_ranking']
//                console.log(dict)
//                for(var key in dict) {
//                    var value = dict[key];
//                    console.log(value);
//                    var key = key;
//                    console.log(key);
//                    document.getElementById("ranking").append(key);
//                    document.getElementById("ranking").appendChild(document.createElement('br'));
//                }
//
//            } else {
//                console.log('beer unavailable')
//                document.getElementById("beer_container").style.display = "none";
//            }
//            },
//        error: function(output){
//            console.log('error');
//        },
//    });
//});

