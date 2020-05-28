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

    function getCityBackground(city_name){
        //get rid of spaces
        background_name = city_name.replace('-','_');
        //get rid of accents
        background_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        $('#background').css({'background-image': 'url(images/city/'+background_name+'.jpg)'});
    }

    function getCityInformation(city_name) {

        const toTitleCase = (phrase) => {
            return phrase
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        let modified_name = city_name;
        modified_name = modified_name.replace("_"," ").replace("-"," ");
        modified_name = modified_name.replace("_"," ").replace("-"," ");
        modified_name = modified_name.replace("_"," ").replace("-"," ");
        modified_name = toTitleCase(modified_name);
        modified_name = modified_name.replace(/\s/g,'');
        console.log("city name is: "+modified_name);

        firebase.database().ref("city").orderByChild("ville").on("value", function(snapshot) {
            snapshot.forEach(function(childNodes){
                let city = childNodes.val().ville;
                city = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                city = city.replace("_"," ").replace("-"," ");
                city = city.replace("-"," ");
                city = city.replace(/\s/g,'');
                city = city.trim();
                modified_name = modified_name.trim();
                console.log(city)
                console.log(modified_name)
                console.log(modified_name == city)
                if(city == modified_name){
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
                }
            });

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

            if (data !== null && data !== undefined && data.length > 0) {
                console.log(data)
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

    function getBeerInformation(city_name){

    }

    getCityInformation(city_name);
    getCityBackground(city_name);
    getBeerInformation(city_name);
});


