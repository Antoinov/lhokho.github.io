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
//to use if want to remove data from db
//firebase.database().ref("city/train").remove();

var auth = new firebase.auth();

var login = false;

function googleSignIn(){
    base_provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(base_provider).then(function(result){
        $('#btnLogin').hide();
        $('#logoutOpt').removeAttr('hidden');
        $("#myModal").modal('toggle');
        login = true;
        // The signed-in user info.
        var user = result.user;
        console.log(user);
    }).catch(function(err){
        console.log(err);
    });
}

function googleSignOut(){
    auth.signOut().then(function() {
        // Sign-out successful
        location.reload();
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
    current.setMinutes(current.getMinutes()+5);
    const timeinterval = setInterval(() => {
        const t = current.getTime() - new Date().getTime();
        if (t <= 0 || !login) {
            clearInterval(timeinterval);
            googleSignOut()
        }
    },30000);
}


