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

function populate_menu(city_name,city_index) {
    let city_html = $('<li><a id="link_' + city_index + '" style="width: 100.0%; height: 100.0%;" href="destination.html?city=' + city_index + '" target="_blank""><br>' + city_name + '<br></a></li>')[0];
    $("#destSubmenu").append(city_html);
    let city_option = $('<option id="opt_' + city_index + '" value="'+city_index+'" >'+city_name+'</option>')[0];
    $("#destination_select").append(city_option);
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
    if (isMobileDisplay) {
        $('#mobileContent').removeAttr('hidden');
        $('#btnLogin').hide();
        $('#btnGuest').hide();
    }
    
    $("#myModal").modal('show');
    
    $('#sidebarCollapse').on('click', function () {
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

    // let calendar_html = '<table id="calendar-table">'
    //         +'<tr>'
    //         +    '<th>08:00</th>'
    //         +    '<td colspan="4" rowspan="2" class="stage-saturn">Welcome</td>'
    //         +'</tr>'
    //         +'<tr>'
    //         +    '<th>08:30</th>'
    //         +'</tr>'
    //         +'<tr>'
    //         +    '<th>09:00</th>'
    //         +    '<td colspan="4" class="stage-earth">Speaker One <span>Earth Stage</span></td>'
    //         +'</tr>'
    //         +'</table>';

    // //adding additional information embedded in the map
    // var info = L.control({
    //     position : 'bottomleft'
    // });

    // info.onAdd = function (map) {
    //     this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    //     this.update();
    //     return this._div;
    // };

    // // method that we will use to update the control based on feature properties passed
    // info.update = function (props) {
    //     this._div.innerHTML = calendar_html;
    // };

    // info.addTo(map);

});



