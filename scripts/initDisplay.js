/**
 *
 * File containing methods to set up website display
 *
 * @summary set up main display
 * @author Makitsu 
 *
 */
//Load side navigation html
$("#side-nav").load("pages/side-nav.html");
//Check mobile app 
var isMobileDisplay = L.Browser.mobile;
if (isMobileDisplay) {screen.orientation.lock('landscape');}
function populate_menu(city_name,city_index) {
    let city_html = $('<li><a id="link_' + city_index + '" style="width: 100.0%; height: 100.0%;" href="destination.html?city=' + city_index + '" target="_blank""><br>' + city_name + '<br></a></li>')[0];
    $("#destSubmenu").append(city_html);
    let city_option = '<option id="opt_' + city_index + '" value="'+city_name+'" data-value="'+city_index+'" ></option>'
    $("#destination_browser").append(city_option);
}

$(document).ready(function() {
    
    $('#myModal').on('show.bs.modal', function (e) {
        $('body').addClass("example-open");
    }).on('hide.bs.modal', function (e) {
        $('body').removeClass("example-open");
    })
    $("#myModal").modal({
        backdrop: 'static',
        keyboard: false
    });
    //disable site access if phone display detected
/*    if (isMobileDisplay) {
        $('#mobileContent').removeAttr('hidden');
        $('#btnLogin').hide();
        $('#btnGuest').hide();
    }*/
    
    $("#myModal").modal('show');
    
    $('#sidebarCollapse').on('click touchend', function () {
        $('#sidebar').toggleClass('active');
    });
    const div = $('#trip_toggle');
    
    $('#trip_btn').click(function(ev) {
        console.log('add shaker');
        div.addClass('shaker');
        div.one('animationend', () => {
            div.removeClass('shaker')
        })
        ev.preventDefault();
    });

    //Retrieve information about stop stations and city
    firebase.database().ref().child('city/station').once('value').then(function(datakey){
        count = 0;
        datakey.forEach(function(data){
            city_name = data.val()[0].city;
            populate_menu(city_name,count);
            count = count + 1;
        });
        if(datakey.length > 0 ){
            $("#destSubmenu").scrollTop($('ul > li:nth-child(2)').position().top);
        }
    });

    

});



