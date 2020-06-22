$(document).ready(function() {
    //Retrieve information about stop stations and city

    function populate_menu(city_name,city_index) {
        //console.log(city_name);
        let city_html = $('<li><a id="link_' + city_index + '" style="width: 100.0%; height: 100.0%;" href="destination.html?city=' + city_index + '" target="_blank""><br>' + city_name + '<br></a></li>')[0];
        $("#destSubmenu").append(city_html);
        let city_option = $('<option id="opt_' + city_index + '" value="'+city_index+'" >'+city_name+'</option>')[0];
        $("#destination_select").append(city_option);
    }

    firebase.database().ref().child('city/station').once('value').then(function(datakey){
        count = 0;
        datakey.forEach(function(data){
            city_name = data.val()[0].city;
            populate_menu(city_name,count);
            count = count + 1;
        });
    });

    $("#destSubmenu").scrollTop($('ul > li:nth-child(2)').position().top);



});



