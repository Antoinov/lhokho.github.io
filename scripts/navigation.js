$(document).ready(function() {
    //Retrieve information about stop stations and city

    function populate_menu(city_name,city_index) {
        //console.log(city_name);
        let city_html = $('<li><a id="link_' + city_index + '" style="width: 100.0%; height: 100.0%;" href="destination?city=' + city_index + '" target="_blank""><br>' + city_name + '<br></a></li>')[0];
        $("#destSubmenu").append(city_html);
    }

    firebase.database().ref().child('city/station').once('value').then(function(datakey){
        datakey.forEach(function(data,index){
            city_name = data.val()[0].city;
            //console.log(city_name)
            populate_menu(city_name,index);
        });
    });

    $("#destSubmenu").scrollTop($('ul > li:nth-child(2)').position().top);

});
