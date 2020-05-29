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

    var city_id = window.location.search.substr(1).split("=")[1];

    informations = firebase.database().ref("city/info");
    items = firebase.database().ref("city/items");

    informations.on("value", function(dataset) {
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                console.log(childNodes.val());
                $('#background').css({'background-image': 'url(images/city/bg_'+childNodes.key+'.jpg)'});
                getCityInformation(childNodes.val())
            }
        });
    });

    function func(a, b) {
        return Math.random();
    }

    items.on("value", function(dataset) {
        let data_list = [];
        dataset.forEach(function(childNodes){
            if(childNodes.key === city_id){
                console.log(childNodes.val());
                childNodes.forEach(function(item) {
                    var itemVal = item.val();
                    data_list.push(itemVal);
                });

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
        } else {
            document.getElementById("items_container").style.display = "none";
            $("#items-link").hide();
        }
    }


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



});


