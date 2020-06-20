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
// Load side navigation
$("#side-nav").load("pages/side-nav.html");
// Connect side navigation to collapse button
$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    const div = $('#trip_toggle')
    $('#trip_btn').click(function(ev) {
        console.log('add shaker');
        div.addClass('shaker');
        div.one('animationend', () => {
            div.removeClass('shaker')
        })
        ev.preventDefault();
    });

});


