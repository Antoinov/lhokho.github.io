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

var auth = new firebase.auth();

var login = false;

function googleSignIn(){
    base_provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(base_provider).then(function(result){
        console.log(result);
        $('#btnLogin').hide();
        $('#logoutOpt').removeAttr('hidden');
        $("#myModal").modal('toggle');
        login = true;
    }).catch(function(err){
        console.log(err);
    });
}

function googleSignOut(){
    auth.signOut().then(function() {
        // Sign-out successful
        $('#toggle_tgv').prop('checked', false); 
        $('#logoutOpt').attr("hidden",true);
        $('#btnLogin').show();
        $("#myModal").modal('show');
        login = false;
      }).catch(function(error) {
        // An error happened.
      });
}

function initializeClock() {
    let current = new Date();
    $('#logoutOpt').removeAttr('hidden');
    $("#myModal").modal('toggle');
    login = true;
    //guest user is granted of 15 minutes
    current.setMinutes(current.getMinutes()+15);
    const timeinterval = setInterval(() => {
        console.log('check time')
        const t = current.getTime() - new Date().getTime();
        console.log(t)
        if (t <= 0 || !login) {
            clearInterval(timeinterval);
            googleSignOut()
        }
    },1000);
}



function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }

// Load side navigation
$("#side-nav").load("pages/side-nav.html");
// Connect side navigation to collapse button
$(document).ready(function () {
    $("#myModal").modal({
        backdrop: 'static',
        keyboard: false
    });
    $("#myModal").modal('show');
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


