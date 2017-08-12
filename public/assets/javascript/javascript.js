//JS File
$(document).ready(function(){
 
 //initial google map value: LA
  var googleUrl;
  $('[data-toggle="tooltip"]').tooltip();
  initMap(34,-118);

  // Add smooth scrolling 
  $(".navbar a, footer a[href='#myPage']").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function(){
   
        
        window.location.hash = hash;
      });
    } 
  });

//firebase credentials
var config = {
    apiKey: "AIzaSyAzDUc12b5jeppJAN8wrxZfGPIZdB-U18I",
    authDomain: "black-team-project.firebaseapp.com",
    databaseURL: "https://black-team-project.firebaseio.com",
    projectId: "black-team-project",
    storageBucket: "black-team-project.appspot.com",
    messagingSenderId: "84435578063"
  }
  firebase.initializeApp(config);
  var database = firebase.database();

//Runs Api call to usda api with user enter zip value
  $("#zipSubmit").on("click", function(){
    event.preventDefault();
    $('#result').empty();
    var patt = /^\d{5}(?:[-\s]\d{4})?$/;
    var res = patt.test($('#zipcode').val().trim());
    if(res){
    var queryURL = "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + $('#zipcode').val().trim();
    $.ajax({
            url: queryURL,
            method: "GET"
          }).done(function(result){
            $("#info").empty();
            for(i = 0; i < result.results.length; i++){
              var row = $("<tr>");
              var cell = $("<td>");
              var marketbutton = $("<button>");
              marketbutton.addClass("btn");
              marketbutton.addClass("btn-secondary");
              marketbutton.addClass("btn-md");
              marketbutton.attr("data-val" , result.results[i].id);
              marketbutton.attr("style", "margin: 5px")
              marketbutton.html(result.results[i].marketname);
              $("#info").append(row);
              row.append(cell);
              cell.append(marketbutton);
            }

        })
      }else{
        $("#result").html("ERROR: INVALID ZIP")
      }
  });

//Gets the specific zip for whichever area the user clicks on and fills result with that areas data.
  $(".SpecificArea").on("click", function(){
    event.preventDefault();
    $('#result').empty();
    var queryURL = "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + $(this).attr("data-zip");
    $.ajax({
        url: queryURL,
        method: "GET"
      }).done(function(result){
        $("#info").empty();
        for(i = 0; i < result.results.length; i++){
          var row = $("<tr>");
          var cell = $("<td>");
          var marketbutton = $("<button>");
          marketbutton.addClass("btn");
          marketbutton.addClass("btn-secondary");
          marketbutton.addClass("btn-md");
          marketbutton.attr("data-val" , result.results[i].id);
          marketbutton.attr("style", "margin: 5px")
          marketbutton.html(result.results[i].marketname);
          $("#info").append(row);
          row.append(cell);
          cell.append(marketbutton);
        }
      })
  });


//When a user clicks one of the buttons, second api call is made and information about that specific farmer's market is displayed
  $("#info").on("click", ".btn-secondary", function(){
    $("#result").empty();
    var queryURL2 = "https://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + $(this).attr("data-val");
    $.ajax({
      url: queryURL2,
      method: "GET"
    }).done(function(result){
      var ptag1 = $("<p>");
      var ptag3 = $("<p>");
      var ptag4 = $("<p>");
      ptag1.html("Address: <a href='" + result.marketdetails.GoogleLink+"' target='_blank'>" +result.marketdetails.Address + " </a><br/>");
      if(result.marketdetails.Products.trim() !== ""){
        ptag3.html("Products: " + result.marketdetails.Products + "<br/>");
      }
      if(result.marketdetails.Schedule.replace(/<br>/g," ").trim() !== ""){
         var regex = /(Sun|Mon|Tue|Wed|Thur|Fri|Sat):.*$/;
         var sched = result.marketdetails.Schedule;
         var index = sched.search(regex);
         console.log(index);
         var schedSplit = sched.slice(index, sched.length);
         console.log(schedSplit);
         ptag4.html("Schedule: " + schedSplit);
      }
      $("#result").append(ptag1);
      $("#result").append(ptag3);
      $("#result").append(ptag4);
      var source = result.marketdetails.GoogleLink;
      var firstNum = source.slice('?');
      getCoordinate(firstNum);
    })
  });


//sets up map with lat and long coordinates given after splicing the string url
  function initMap(lt, lg) {
      console.log("Event: ");       
       var irvine = {lat: lt, lng: lg};
       var map = new google.maps.Map(document.getElementById('googleMap'), {
         zoom: 10,
         center: irvine
       });
       var marker = new google.maps.Marker({
         position: irvine,
         map: map
      });
     }

  var getCoordinate = function(longString){   
    var arraySrc = longString.split("=");
    console.log(arraySrc);
    var arraySplitAgain = decodeURIComponent(arraySrc[1]).split(' ');
    console.log(arraySplitAgain);

    //get the first 2 elems of the array.
    var strlat = arraySplitAgain[0].replace(/,/ , '');
    lat = parseFloat(strlat);
    console.log(lat);
    var strlng = arraySplitAgain[1];
    lng = parseFloat(strlng);
    console.log(lng);
    initMap(lat, lng);
  }

// Form validation and submission function
// Form is submitted to both firebase and to mailchimp api
  $("#formSubmit").on("click", function(){


    event.preventDefault();
    // NEED TO DO CHECKS
    var Fname = $("#Fname").val().trim();
    var Lname = $("#Lname").val().trim();
    var email = $("#emailInput").val().trim();
    var comment = $("#comments").val().trim();
    var checkFname = (/^[a-z ,.'-]+$/i.test(Fname));
    var checkLname = (/^[a-z ,.'-]+$/i.test(Lname));
    var checkemail = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
 
    if (checkFname && checkLname && checkemail) {
      $("#invalid").html("")
      var newsletter = null;
      if($("#newsletter").is(":checked")){
        newsletter = "subscribed";
      }else{
        newsletter = "unsubscribed";
      }

      var JsonObject = {"emailInput":email , "newsletter": newsletter, "FName": Fname, "LName": Lname }

      $.ajax({
        type: "POST",
        url: "/signup",
        data: JsonObject,
        success: function(response){console.log(response);}
      });


      database.ref().push({
          FirstName: Fname,
            LastName: Lname,
            Email: email,
            Comment: comment,
            Newsletter: newsletter

        });

        database.ref().on("child_added", function(snapshot) {
          FirstName = snapshot.val().Fname;
          LastName = snapshot.val().Lname;
          Email = snapshot.val().email;
          Comment = snapshot.val().comment;
          Newsletter = snapshot.val().newsletter;
        }, function(error){
          console.log(error);
        });

        $(".form-control").val("");
        $("#Thanks").html("Thanks you for joining our newsletter!")

    }else{
      $("#Thanks").html("");
      $("#invalid").html("Error: Invalid Input");
    }
  });
});