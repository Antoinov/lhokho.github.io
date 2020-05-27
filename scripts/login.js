
 $(document).on('click','#signin',function() {
    let user = $('#user').val();
    let password = $('#password').val();

    if($('#signin').text() == 'Sign in'){
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

        //Check if any users exist
        firebase.database().ref('users').orderByChild("ID").equalTo(user).once("value",snapshot => {
            if (snapshot.exists()){
                var data = snapshot.val();
                data = data[Object.keys(data)[0]];
                console.log("exists!");
                if(data['password'] === password){
                    $('#infos').text("Bon retour, "+user+" ,prêt à voyager ?");
                    $("#infos").show();
                    $("#user").hide();
                    $("#password").hide();
                    $("#signup").hide();
                    $("#signin").text('Log out');

                }else{
                    $("#password").val("");
                    alert("Wrong password, try again ! ")
                }
            }

            $("#user").val("");
            $("#password").val("");
            $('#user_msg').html("<p> User not registered </p>");
            $('#myModal').show();
        });

        if(response == 'user not registered'){

        }
        else if(response == 'wrong password'){

        }else{

            window.location.reload();

        }

    }else{
        alert('log out')
        location.reload();
        $("#user").val("");
        $("#password").val("");
        $('#infos').text("")
        $("#user").show();
        $("#password").show();
        $("#signin").text('Sign in');
        $("#signup").show();
    }

});

$(document).on('click','#signup',function() {
    let user = $('#user').val();
    let password = $('#password').val();


});

$(document).ready(function() {

});

