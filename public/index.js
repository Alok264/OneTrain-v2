$(document).ready(function() {
$(".dropdown").hover(function() 
{
  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
}, function() {
  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
});
});

$(document).ready(function () {
  $(window).scroll(function () {
    var top =  $(".goto-top");
        if ( $('body').height() <= (    $(window).height() + $(window).scrollTop() + 200 )) {
  top.animate({"margin-left": "0px"},1500);
        } else {
            top.animate({"margin-left": "-100%"},1500);
        }
    });

    $(".goto-top").on('click', function () {
        $("html, body").animate({scrollTop: 0}, 400);
    });
});


var count = 0;
$(document).ready(function() {
var button = $(".more-button").on("click", function(){
  count++;
  if(count%2!=0)
  {
      $(".status").css("display", "flex");
      $(".status").css("animation-name", "more-top-to-bottom-translation");
      button.text("Less");
  }
  else
  {
      $(".status").css("display", "none");
      button.text("More");
  }
});
});

$(document).ready(function() {
  $('.password').on('blur', function(){
    let password = $(this).val();
    if(password.length>0)
    {
      let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z!@#$%^&*()_+])(?!.*\s).{8,20}$/;
      if (regex.test(password)) {
          $('.error-message').text("");
      } 
      else 
      {
          $('.error-message').text("Password must contain atleast 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character");
          
      }
    }
    else
    {
      $('.error-message').text("");
    }
    });
});

$(document).ready(function(){
  $('.confirm-password').on('input', function(){
    const inputP = $('.password').val();
    const inputCP= $(this).val();
    if(inputCP.length>0)
    {
          if(inputCP != inputP)
          {
            $('.signup-button').attr('disabled', 'disabled');
          }
          else{
            $('.signup-button').removeAttr('disabled');
            $('.confirm-error-message').text("");
          }
    }
    else
    {
      $('.confirm-error-message').text("");
    }
  })
})

$(document).ready(function(){
  $.ajax({
    url: '/isLogedIn',
    method: 'GET',
    success: function(response){
      if(response.logedIn === true)
      {
        $('.login_img').attr('src', response.photourl);
        $('.login_img').css('display', 'block');
        $('.login_dropdown').addClass("dropdown");
        $('.login_username').find('span').text(response.username);
        $('#login_user').attr('data-bs-toggle', 'dropdown');
      }
      else{
        $('.login_img').css('display', 'none');
        $('.login_dropdown').removeClass("dropdown");
        $('.login_username').find('span').text("Login/Signup");
        $('#login_user').removeAttr('data-bs-toggle');
      }
    },
    error: function(error){
        console.log("IsLoggedIn response error from server side, a get request has been made to check whether the user is logedin or not");
    }
  })
});

$(document).ready(function(){
  $('.pnr-input').on('input', function(){
    let pnr = $(this).val();
    if(pnr.length < 10 || pnr.length > 10)
    {
      if(pnr.length<10)
      {
        $('.alert-message').css('color', 'blue');
      }
      else
      {
        $('.alert-message').css('color', 'red');
      }
      $('.alert-message').text("PNR must be of 10 digits"+" Enter Remaining "+(10-pnr.length)+" digits");
      $('.alert-message').css('display', 'block');
      $('.pnr-button').attr('disabled', 'disabled');
    }
    else
    {
      $('.alert-message').css('color', 'green');
      $('.alert-message').text("Hurrah! You can check your PNR status now");
      $('.alert-message').css('display', 'block');
      $('.pnr-button').removeAttr('disabled');
    }
  })
})

function chatbot_button_clicked(){
  $('.chatbot_click').css('display', 'none');
  $('.chatbot-body').css('animation-duration', '0.5s');
  $('.chatbot-body').css('animation-name', 'chatbot-body-bottom-to-top-animation');
  $('.chatbot-body').css('display', 'block');
  $('#blur, #navbar-blur').addClass('blur-background');
  $('#userInput').focus();
  $('body').css('overflow-y', 'hidden');

}
function chatbot_close_button_clicked(){
  $('.chatbot-body').css('animation-duration', '1s');
  $('.chatbot-body').css('animation-name', 'chatbot-body-top-to-bottom-animation');
  setTimeout(function(){
    $('.chatbot-body').css('display', 'none');
    $('.chatbot_click').css('display', 'block');
  }, 1001);
  $('#blur, #navbar-blur').removeClass('blur-background');
  $('body').css('overflow-y', 'auto');
}


function chat_response() {
  let userMessage = $("#userInput").val();
  $("#userInput").val("");
  let userHtml = '<div class="chat09-container-user text09"><div class="chat09-container-text-user"><span class="chat09-container-user-text">' + userMessage + '</span></div></div>';
  $("#chatbox").append(userHtml);
  loadingAnimation(true);
  console.log(userMessage);
  $.ajax({
    method: "GET",
    url: "/chat",
    data: { userMessage: userMessage },
    success: function (response) {
      loadingAnimation(false);
      let botMessage = response;
      console.log(botMessage);
      let botHtml = '<div class="chat09-container-system text09"><div class="chat09-container-text-system"><span class="chat09-container-system-text">' + botMessage + '</span></div></div>';
      $("#chatbox").append(botHtml);
      $("#chatbox").scrollTop($("#chatbox").prop("scrollHeight"));

    },
    error: function (error) {
      console.log(error);
    },
  });
  return false;
}

function loadingAnimation(show) {
  let loadingHtml = '<div class="scaling-dots"><div></div><div></div><div></div><div></div></div>'
  if (show) {
    $("#chatbox").append(loadingHtml);
  } else {
    $(".scaling-dots").remove();
  }
} 

let input;
let searchResult;

$(document).ready(function() 
{
      $('.search-station').on('focus', function(){
        if ($(this).hasClass('source')) {
          input = $('.source');
          searchResult = $('.autocom-source');
        } 
        if ($(this).hasClass('destination')) {
          input = $('.destination');
          searchResult = $('.autocom-destination');
        }
        Active(input, searchResult);
      });
  });

function Active(input, searchResult) {
let currentFocus = -1;
let previous_child;
let next_child;
let current_child;
let debounceTimer;

input.on('keyup', function (e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchValue = input.val();
        $.ajax({
            url: '/station-search',
            method: 'POST',
            data: { input: searchValue},
            success: function(response)
            {
                let filteredSuggestions = response;
                const listtlength = Math.min(filteredSuggestions.length, 6);
                searchResult.empty();
                if (searchValue) {
                    filteredSuggestions.slice(0, listtlength).forEach(suggestion => {;
                        searchResult.append(`<li type="none" class="search-list">${suggestion.A +" - "+ suggestion.B}</li>`);
                    });
                    searchResult.show();
                } else {
                    searchResult.hide();
                }
                
                const listItems = searchResult.find('li');
                const first_child = listItems.first();
                
                $('li').on('click', function(){
                    input.val($(this).text());
                    searchResult.hide();
                    input.next('input').focus();
                })

                if (e.key === "ArrowDown") {
                    if (currentFocus === listtlength-1) {
                        currentFocus = -1;
                    }
                    if (currentFocus === -1) {
                        currentFocus = 0;
                        first_child.addClass('highlight');
                    } else {
                        previous_child = listItems.eq(currentFocus);
                        previous_child.removeClass('highlight');
                        currentFocus++;
                        current_child = listItems.eq(currentFocus);
                        current_child.addClass('highlight');
                    }
                }
                if (e.key === "ArrowUp") {
                    if (currentFocus === 0) {
                        currentFocus = listtlength;
                    }
                    if (currentFocus === -1) {
                        currentFocus = listtlength-1;
                        listItems.eq(currentFocus).addClass('highlight');
                    } else {
                        previous_child = listItems.eq(currentFocus);
                        previous_child.removeClass('highlight');
                        currentFocus--;
                        current_child = listItems.eq(currentFocus);
                        current_child.addClass('highlight');
                    }
                }
                if (e.key === "Enter") {
                    e.preventDefault(); // Prevent form submission
                    if (current_child) {
                        input.val(current_child.text());
                        searchResult.hide();
                    }
                    input.next('input').focus();
                }
            },
            error: function(error){
                console.log("Server response error in station search");
            }
        });
    }, 300);
  }); 
};

let train_search_input;
let train_search_result;
$(document).ready(function(){
  $('.search-train').on('focus', function(){
          train_search_input = $('.train-number-name');
          train_search_result = $('.autocom-box-train-search');
        TrainSearch(train_search_input, train_search_result);
      });
  });

function TrainSearch(train_search_input, train_search_result)
{
  let currentFocus = -1;
  let previous_child;
  let next_child;
  let current_child;
  let debounceTimer;
    train_search_input.on('keyup focus', function(e)
    {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const searchValue = $(this).val();
        if(searchValue.length > 0)
        {
          $.ajax({
              url: '/train-search',
              method: 'POST',
              data: { input: searchValue},
              success: function(response)
              {
                let filteredSuggestions = response;
                const listtlength = Math.min(filteredSuggestions.length, 8);
                train_search_result.empty();

                if (searchValue) {
                    filteredSuggestions.slice(0, listtlength).forEach(suggestion => {;
                        train_search_result.append(`<li type="none" class="search-list">${suggestion.trainNo +" - "+ suggestion.trainName}</li>`);
                    });
                    train_search_result.show();
                } else {
                    train_search_result.hide();
                }
                
                const listItems = train_search_result.find('li');
                const first_child = listItems.first();
                $('li').on('click', function(){
                    train_search_input.val($(this).text());
                    train_search_result.hide();
                })

                if (e.key === "ArrowDown") {
                    if (currentFocus === listtlength-1) {
                        currentFocus = -1;
                    }
                    if (currentFocus === -1) {
                        currentFocus = 0;
                        first_child.addClass('highlight');
                    } else {
                        previous_child = listItems.eq(currentFocus);
                        previous_child.removeClass('highlight');
                        currentFocus++;
                        current_child = listItems.eq(currentFocus);
                        current_child.addClass('highlight');
                    }
                }
                if (e.key === "ArrowUp") {
                    if (currentFocus === 0) {
                        currentFocus = listtlength;
                    }
                    if (currentFocus === -1) {
                        currentFocus = listtlength-1;
                        listItems.eq(currentFocus).addClass('highlight');
                    } else {
                        previous_child = listItems.eq(currentFocus);
                        previous_child.removeClass('highlight');
                        currentFocus--;
                        current_child = listItems.eq(currentFocus);
                        current_child.addClass('highlight');
                    }
                }
                if (e.key === "Enter") {
                    e.preventDefault(); // Prevent form submission
                    if (current_child) {
                        train_search_input.val(current_child.text());
                        train_search_result.hide();
                    }
                } 
            },
            error: function(error){
                console.log("Server response error in train search");
            }
          });
        }
        else
        {
          train_search_result.empty();
          train_search_result.hide();
        }
      }, 300);
    });
};

function close_train_info_output() {
  $('.train-info-output').css('animation-name', 'train-info-output-out-animation');
  setTimeout(function() {
    $('#train_number, #train_name, #from_station, #to_station').text("");
    $('#train-info-stoppages').empty();
    $('#train-info-output').css('display', 'none');
    $('#blur, #navbar-blur').css('filter', 'blur(0px)');
    $('body').css('overflow', 'auto');
  }, 1001);
}
$('#trainInfoForm').submit(function(event) {
  event.preventDefault();  //prevent reloading of page after form submission
  let value = $('.train-number-name').val();
  let trainNumber = value;
  if(value.length > 6)
  {
      trainNumber = value.split(" - ")[0];
  }
  console.log(trainNumber);
  if(trainNumber.length > 0)
  {
    $.ajax({
      url: '/train-info',
      method: 'POST',
      data: { trainNo: trainNumber },
      success: function(data) {
        $('.train-info-output').css('animation-name', 'train-info-output-in-animation');
        $('#train-info-output').css('display', 'block');
        $('#blur, #navbar-blur').css('filter', 'blur(5px)');
        $('body').css('overflow', 'hidden');
        let response = data.trainInfoArray;
        let responseArray = response.route;
        let trainNo = data.trainNo;
        let route_length = responseArray.length;
        $('#train_number').text(trainNo);
        $('#train_name').text(response.trainName);
        $('#from_station').text(responseArray[0].station_name);
        $('#to_station').text(responseArray[route_length - 1].station_name);
        let rundays = response.runDays;
        $.each(rundays, function(index, day) {
          if (day === false) {
            $('.'+day).css('background-color','#ff8484');
          }
          else
          {
            $('.'+day).css('background-color','#0DE89F');
          }
        });
        for (let key in rundays) {
          if (rundays.hasOwnProperty(key)) {
              value = rundays[key];
              if (value === false) {
                $('.'+key).css('background-color','#ff8484');
              }
              else
              {
                $('.'+key).css('background-color','#0DE89F');
              }
        }
    }

        
        let SNo = 0;
        $.each(responseArray, function(index, route) {
          if (route.stop === true) {
            SNo++;
            let row = $('<tr class="tr"></tr>');
            row.append('<td>' + SNo + '</td>');
            row.append('<td>' + route.station_code + '</td>');
            row.append('<td>' + route.station_name + '</td>');

            let reference_time = route.today_sta;
            let hours = Math.floor(reference_time / 60);
            let mins = reference_time % 60;
            let arrival_time = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
            let halt = route.std_min - route.sta;
            mins += halt;
            if (mins >= 60) {
              hours += 1;
              mins -= 60;
            }
            let departure_time = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
            if (index == 0) {
              arrival_time = "---";
              halt = "---";
            }
            if (index == route_length - 1) {
              departure_time = "---";
              halt = "---";
            }
            halt = halt.toString().padStart(2, '0')
            row.append('<td>' + arrival_time + '</td>');
            row.append('<td>' + departure_time + '</td>');
            row.append('<td>' + halt + '</td>');
            row.append('<td>' + Math.floor(route.distance_from_source) + '</td>');
            row.append('<td>' + route.day + '</td>');

            $('#train-info-stoppages').append(row);
          }
        });
      },
      error: function(error) {
        console.error(error);
      }
    });
  }
});

loader = $(".lds-default");
$('#blur').addClass('blur-background');
window.addEventListener("load", function(){
    loader.css('display', 'none');
    $('#blur').removeClass('blur-background');
});

$(document).ready(function() {
  $(".print").click(function() {
    var printContent = $(".pnr-top").html();
    var originalContent = $("body").html();
    $("body").html(printContent);
    window.print();
    $("body").html(originalContent);
  });
});
