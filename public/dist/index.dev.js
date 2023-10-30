"use strict";

/******************************************************************************************************************* */
// Adding python file
// spawn is a function that takes two arguments: the first is the command to run, and the second is an array containing the command line arguments to pass to the command. The function returns a ChildProcess object.
$(document).ready(function () {
  $('.dropdown').hover(function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
  }, function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
  });
});
/******************************************************************************************************************* */

$(document).ready(function () {
  $(window).scroll(function () {
    var top = $('.goto-top');

    if ($('body').height() <= $(window).height() + $(window).scrollTop() + 200) {
      top.animate({
        'margin-left': '0px'
      }, 1500);
    } else {
      top.animate({
        'margin-left': '-100%'
      }, 1500);
    }
  });
  $('.goto-top').on('click', function () {
    $('html, body').animate({
      scrollTop: 0
    }, 400);
  });
});
/******************************************************************************************************************* */

var count = 0;
$(document).ready(function () {
  var button = $('.more-button').on('click', function () {
    count++;

    if (count % 2 != 0) {
      $('.status').css('display', 'flex');
      $('.status').css('animation-name', 'more-top-to-bottom-translation');
      button.text('Less');
    } else {
      $('.status').css('display', 'none');
      button.text('More');
    }
  });
});
/******************************************************************************************************************* */

/******************************************************************************************************************* */

/******************************************************************************************************************* */

$(document).ready(function () {
  $.ajax({
    url: '/isLogedIn',
    method: 'GET',
    success: function success(response) {
      if (response.logedIn === true) {
        $('.login_img').attr('src', response.photourl);
        $('.login_img').css('display', 'block');
        $('.login_dropdown').addClass('dropdown');
        $('.login_username').find('span').text(response.username);
        $('#login_user').attr('data-bs-toggle', 'dropdown');
      } else {
        $('.login_img').css('display', 'none');
        $('.login_dropdown').removeClass('dropdown');
        $('.login_username').find('span').text('Login/Signup');
        $('#login_user').removeAttr('data-bs-toggle');
      }
    }
  });
});
/******************************************************************************************************************* */

$(document).ready(function () {
  $('.pnr-input').on('input', function () {
    var pnr = $(this).val();

    if (pnr.length < 10 || pnr.length > 10) {
      if (pnr.length < 10) {
        $('.alert-message').css('color', 'blue');
      } else {
        $('.alert-message').css('color', 'red');
      }

      $('.alert-message').text('PNR must be of 10 digits' + ' Enter Remaining ' + (10 - pnr.length) + ' digits');
      $('.alert-message').css('display', 'block');
      $('.pnr-button').attr('disabled', 'disabled');
    } else {
      $('.alert-message').css('color', 'green');
      $('.alert-message').text('Hurrah! You can check your PNR status now');
      $('.alert-message').css('display', 'block');
      $('.pnr-button').removeAttr('disabled');
    }
  });
});
/********************************************************************************************************************************/

/********************************************************************************************************************************/

/***************************Chatbot**************************************************************************************** */

function chatbot_button_clicked() {
  $('.chatbot_click').css('display', 'none');
  $('.chatbot-body').css('animation-duration', '0.5s');
  $('.chatbot-body').css('animation-name', 'chatbot-body-bottom-to-top-animation');
  $('.chatbot-body').css('display', 'block');
  $('#blur, #navbar-blur').addClass('blur-background');
  $('#userInput').focus();
  $('body').css('overflow-y', 'hidden');
}

function chatbot_close_button_clicked() {
  $('.chatbot-body').css('animation-duration', '1s');
  $('.chatbot-body').css('animation-name', 'chatbot-body-top-to-bottom-animation');
  setTimeout(function () {
    $('.chatbot-body').css('display', 'none');
    $('.chatbot_click').css('display', 'block');
  }, 1001);
  $('#blur, #navbar-blur').removeClass('blur-background');
  $('body').css('overflow-y', 'auto');
}

function chat_response() {
  var userMessage = $('#userInput').val();
  $('#userInput').val('');
  var userHtml = '<div class="chat09-container-user text09"><div class="chat09-container-text-user"><span class="chat09-container-user-text">' + userMessage + '</span></div></div>';
  $('#chatbox').append(userHtml);
  loadingAnimation(true);
  console.log(userMessage);
  $.ajax({
    method: 'GET',
    url: '/chat',
    data: {
      userMessage: userMessage
    },
    success: function success(response) {
      loadingAnimation(false);
      var botMessage = response;
      console.log(botMessage); // <div class="chat09-container-user text09">
      //     <div class="chat09-container-text-user">
      //         <span class="chat09-container-user-text">Hi!</span>
      //     </div>
      // </div>
      // <div class="chat09-container-system text09">
      //     <div class="chat09-container-text-system">
      //         <span class="chat09-container-system-text">Hi, I am One Train. How can I help you?</span>
      //     </div>
      // </div>

      var botHtml = '<div class="chat09-container-system text09"><div class="chat09-container-text-system"><span class="chat09-container-system-text">' + botMessage + '</span></div></div>';
      $('#chatbox').append(botHtml);
      $('#chatbox').scrollTop($('#chatbox').prop('scrollHeight'));
    },
    error: function error(_error) {
      console.log(_error);
    }
  });
  return false;
}

function loadingAnimation(show) {
  var loadingHtml = '<div class="scaling-dots"><div></div><div></div><div></div><div></div></div>';

  if (show) {
    $('#chatbox').append(loadingHtml);
  } else {
    $('.scaling-dots').remove();
  }
}
/******************************************************************************************************************* */


var input;
var searchResult;
$(document).ready(function () {
  $('.search-station').on('focus', function () {
    console.log($(this).hasClass('source') + 'for source');
    console.log($(this).hasClass('destination') + 'for destination');

    if ($(this).hasClass('source')) {
      input = $('.source');
      searchResult = $('.autocom-source');
    }

    if ($(this).hasClass('destination')) {
      input = $('.destination');
      searchResult = $('.autocom-destination');
    }

    console.log(input + '   input');
    console.log(searchResult + '    searchResult');
    Active(input, searchResult);
  });
});

function Active(input, searchResult) {
  var currentFocus = -1;
  var previous_child;
  var next_child;
  var current_child;
  var debounceTimer;
  input.on('keyup', function (e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      console.log(e.key);
      var searchValue = input.val();
      $.ajax({
        url: '/station-search',
        method: 'POST',
        data: {
          input: searchValue
        },
        success: function success(response) {
          var filteredSuggestions = response;
          console.log('filteredSuggestions array: ' + filteredSuggestions);
          var listtlength = Math.min(filteredSuggestions.length, 6);
          searchResult.empty();

          if (searchValue) {
            filteredSuggestions.slice(0, listtlength).forEach(function (suggestion) {
              searchResult.append("<li type=\"none\" class=\"search-list\">".concat(suggestion.A + ' - ' + suggestion.B, "</li>"));
            });
            searchResult.show();
          } else {
            searchResult.hide();
          }

          var listItems = searchResult.find('li');
          var first_child = listItems.first();
          $('li').on('click', function () {
            input.val($(this).text());
            searchResult.hide();
            input.next('input').focus();
          });

          if (e.key === 'ArrowDown') {
            if (currentFocus === listtlength - 1) {
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

          if (e.key === 'ArrowUp') {
            if (currentFocus === 0) {
              currentFocus = listtlength;
            }

            if (currentFocus === -1) {
              currentFocus = listtlength - 1;
              listItems.eq(currentFocus).addClass('highlight');
            } else {
              previous_child = listItems.eq(currentFocus);
              previous_child.removeClass('highlight');
              currentFocus--;
              current_child = listItems.eq(currentFocus);
              current_child.addClass('highlight');
            }
          }

          if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission

            if (current_child) {
              input.val(current_child.text());
              searchResult.hide();
            }

            input.next('input').focus();
          }

          console.log(currentFocus);
        },
        error: function error(_error2) {
          console.log(_error2);
        }
      });
    }, 300);
  });
}
/******************************************************************************************************************* */


var train_search_input;
var train_search_result;
$(document).ready(function () {
  $('.search-train').on('focus', function () {
    train_search_input = $('.train-number-name');
    train_search_result = $('.autocom-box-train-search');
    TrainSearch(train_search_input, train_search_result);
  });
});

function TrainSearch(train_search_input, train_search_result) {
  var currentFocus = -1;
  var previous_child;
  var next_child;
  var current_child;
  var debounceTimer;
  train_search_input.on('keyup focus', function (e) {
    var _this = this;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      var searchValue = $(_this).val();

      if (searchValue.length > 0) {
        $.ajax({
          url: '/train-search',
          method: 'POST',
          data: {
            input: searchValue
          },
          success: function success(response) {
            var filteredSuggestions = response;
            var listtlength = Math.min(filteredSuggestions.length, 8);
            train_search_result.empty();

            if (searchValue) {
              filteredSuggestions.slice(0, listtlength).forEach(function (suggestion) {
                train_search_result.append("<li type=\"none\" class=\"search-list\">".concat(suggestion.trainNo + ' - ' + suggestion.trainName, "</li>"));
              });
              train_search_result.show();
            } else {
              train_search_result.hide();
            }

            var listItems = train_search_result.find('li');
            var first_child = listItems.first();
            $('li').on('click', function () {
              train_search_input.val($(this).text());
              train_search_result.hide();
            });

            if (e.key === 'ArrowDown') {
              if (currentFocus === listtlength - 1) {
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

            if (e.key === 'ArrowUp') {
              if (currentFocus === 0) {
                currentFocus = listtlength;
              }

              if (currentFocus === -1) {
                currentFocus = listtlength - 1;
                listItems.eq(currentFocus).addClass('highlight');
              } else {
                previous_child = listItems.eq(currentFocus);
                previous_child.removeClass('highlight');
                currentFocus--;
                current_child = listItems.eq(currentFocus);
                current_child.addClass('highlight');
              }
            }

            if (e.key === 'Enter') {
              e.preventDefault(); // Prevent form submission

              if (current_child) {
                train_search_input.val(current_child.text());
                train_search_result.hide();
              }
            }
          }
        });
      } else {
        train_search_result.empty();
        train_search_result.hide();
      }
    }, 300);
  });
}
/* $(document).ready(function () {
  $(document).on('focus', '.search-train', function () {
    const train_search_input = $(this);
    const train_search_result = $('.autocom-box-train-search');
    TrainSearch(train_search_input, train_search_result);
  });

  $(document).on('focus', '.search-station', function () {
    const input = $(this);
    const searchResult = input.hasClass('source') ? $('.autocom-source') : $('.autocom-destination');
    Active(input, searchResult);
  });
});

function TrainSearch(train_search_input, train_search_result) {
  let currentFocus = -1;
  let current_child;

  train_search_input.on('keyup focus', _.debounce(function (e) {
    const searchValue = train_search_input.val();
    if (searchValue.length > 0) {
      $.ajax({
        url: '/train-search',
        method: 'POST',
        data: { input: searchValue },
        success: function (response) {
          const filteredSuggestions = response.slice(0, 8);
          const listItems = filteredSuggestions.map(suggestion => `<li type="none" class="search-list">${suggestion.trainNo} - ${suggestion.trainName}</li>`);

          train_search_result.empty().append(listItems).show();

          currentFocus = -1;
          current_child = null;
        }
      });
    } else {
      train_search_result.empty().hide();
      currentFocus = -1;
      current_child = null;
    }
  }, 300));

  $(document).on('click', '.autocom-box-train-search li', function () {
    train_search_input.val($(this).text());
    train_search_result.hide();
  });

  $(document).on('keydown', '.search-train', function (e) {
    const key = e.key;
    const listItems = train_search_result.find('li');
    const listLength = listItems.length;

    if (key === 'ArrowDown') {
      currentFocus = Math.min(currentFocus + 1, listLength - 1);
      current_child = listItems.eq(currentFocus);
    } else if (key === 'ArrowUp') {
      currentFocus = Math.max(currentFocus - 1, 0);
      current_child = listItems.eq(currentFocus);
    } else if (key === 'Enter' && current_child) {
      train_search_input.val(current_child.text());
      train_search_result.hide();
    }

    listItems.removeClass('highlight');
    if (current_child) {
      current_child.addClass('highlight');
    }
  });
}

function Active(input, searchResult) {
  let currentFocus = -1;
  let current_child;

  input.on('keyup', function (e) {
    const searchValue = input.val();
    if (searchValue.length > 0) {
      $.ajax({
        url: '/station-search',
        method: 'post',
        data: { input: searchValue },
        success: function (response) {
          const filteredSuggestions = response.slice(0, 6);
          const listItems = filteredSuggestions.map(suggestion => `<li type="none" class="search-list">${suggestion.A} - ${suggestion.B}</li>`);

          searchResult.empty().append(listItems).show();

          currentFocus = -1;
          current_child = null;
        }
      });
    } else {
      searchResult.empty().hide();
      currentFocus = -1;
      current_child = null;
    }
  });

  $(document).on('click', '.autocom-source li, .autocom-destination li', function () {
    input.val($(this).text());
    searchResult.hide();
    input.next('input').focus();
  });

  $(document).on('keydown', '.search-station', function (e) {
    const key = e.key;
    const listItems = searchResult.find('li');
    const listLength = listItems.length;

    if (key === 'ArrowDown') {
      currentFocus = Math.min(currentFocus + 1, listLength - 1);
      current_child = listItems.eq(currentFocus);
    } else if (key === 'ArrowUp') {
      currentFocus = Math.max(currentFocus - 1, 0);
      current_child = listItems.eq(currentFocus);
    } else if (key === 'Enter' && current_child) {
      input.val(current_child.text());
      searchResult.hide();
      input.next('input').focus();
    }

    listItems.removeClass('highlight');
    if (current_child) {
      current_child.addClass('highlight');
    }
  });
} */

/******************************************************************************************************************* */
// function operate_train_button_clicked(){
//   $('.train-info-output').css('animation-name', 'train-info-output-in-animation');
//   $('#train-info-output').css('display', 'block');
//   $('#blur').css('filter', 'blur(5px)');
//   $('#navbar-blur').css('filter', 'blur(5px)');
//   $('body').css('overflow', 'hidden');
// }


function close_train_info_output() {
  $('.train-info-output').css('animation-name', 'train-info-output-out-animation');
  setTimeout(function () {
    $('#train_number, #train_name, #from_station, #to_station').text('');
    $('#train-info-stoppages').empty();
    $('#train-info-output').css('display', 'none');
    $('#blur, #navbar-blur').css('filter', 'blur(0px)');
    $('body').css('overflow', 'auto');
  }, 1001);
}

$('#trainInfoForm').submit(function (event) {
  event.preventDefault(); //prevent reloading of page after form submission

  var value = $('.train-number-name').val();
  var trainNumber = value;

  if (value.length > 6) {
    trainNumber = value.split(' - ')[0];
  }

  console.log(trainNumber);

  if (trainNumber.length > 0) {
    $.ajax({
      url: '/train-info',
      method: 'POST',
      data: {
        trainNo: trainNumber
      },
      success: function success(data) {
        $('.train-info-output').css('animation-name', 'train-info-output-in-animation');
        $('#train-info-output').css('display', 'block');
        $('#blur, #navbar-blur').css('filter', 'blur(5px)');
        $('body').css('overflow', 'hidden');
        var response = data.trainInfoArray;
        var responseArray = response.route;
        var trainNo = data.trainNo;
        var route_length = responseArray.length;
        $('#train_number').text(trainNo);
        $('#train_name').text(response.trainName);
        $('#from_station').text(responseArray[0].station_name);
        $('#to_station').text(responseArray[route_length - 1].station_name);
        var rundays = response.runDays;
        $.each(rundays, function (index, day) {
          if (day === false) {
            $('.' + day).css('background-color', '#ff8484');
          } else {
            $('.' + day).css('background-color', '#0DE89F');
          }
        });

        for (var key in rundays) {
          if (rundays.hasOwnProperty(key)) {
            value = rundays[key];

            if (value === false) {
              $('.' + key).css('background-color', '#ff8484');
            } else {
              $('.' + key).css('background-color', '#0DE89F');
            }
          }
        }

        var SNo = 0;
        $.each(responseArray, function (index, route) {
          if (route.stop === true) {
            SNo++;
            var row = $('<tr class="tr"></tr>');
            row.append('<td>' + SNo + '</td>');
            row.append('<td>' + route.station_code + '</td>');
            row.append('<td>' + route.station_name + '</td>');
            var reference_time = route.today_sta;
            var hours = Math.floor(reference_time / 60);
            var mins = reference_time % 60;
            var arrival_time = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
            var halt = route.std_min - route.sta;
            mins += halt;

            if (mins >= 60) {
              hours += 1;
              mins -= 60;
            }

            var departure_time = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');

            if (index == 0) {
              arrival_time = '---';
              halt = '---';
            }

            if (index == route_length - 1) {
              departure_time = '---';
              halt = '---';
            }

            halt = halt.toString().padStart(2, '0');
            row.append('<td>' + arrival_time + '</td>');
            row.append('<td>' + departure_time + '</td>');
            row.append('<td>' + halt + '</td>');
            row.append('<td>' + Math.floor(route.distance_from_source) + '</td>');
            row.append('<td>' + route.day + '</td>');
            $('#train-info-stoppages').append(row);
          }
        });
      },
      error: function error(_error3) {
        console.error(_error3);
      }
    });
  }
});
/******************************************************************************************************************* */

/******************************************************************************************************************* */

loader = $('.lds-default');
$('#blur').addClass('blur-background');
window.addEventListener('load', function () {
  loader.css('display', 'none');
  $('#blur').removeClass('blur-background');
}); // $(window).on('load', function(){
//   $('.loading').fadeOut(1000);
//   $('.loading').css('display', 'none');
// });
// .loading is the cclass in the loading animation div
// .main is the class in the main div

/******************************************************************************************************************* */

/* profile page*/

/******************************************************************************************************************* */
//   function editProfile(){
//     let profile = $('.Profile');
//     let editprofile = $('.edit_form');
//     profile.css('display', 'none');
//     editprofile.css('display', 'block');
//   }

function profile() {
  var profile = $('.edit_form');
  profile.css('display', 'block');
  var profilepiclabel = $('.profilepiclabel');
  profilepiclabel.css('display', 'none');
  var profilefile = $('#profilefile');
  profilefile.prop('disabled', true);
  var edit_input = $('.edit_input');
  edit_input.prop('disabled', true);
  var editProfileButton = $('#editProfileButton');
  editProfileButton.css('display', 'none');
  var changePassword = $('.change_password');
  changePassword.css('display', 'none');
}

function editProfile() {
  var profile = $('.edit_form');
  profile.css('display', 'block');
  var profilepiclabel = $('.profilepiclabel');
  profilepiclabel.css('display', 'block');
  var profilefile = $('#profilefile');
  profilefile.prop('disabled', false);
  var edit_input = $('.edit_input');
  edit_input.prop('disabled', false);
  var editProfileButton = $('#editProfileButton');
  editProfileButton.css('display', 'block');
  var changePassword = $('.change_password');
  changePassword.css('display', 'none');
}

function email_validation(emailID) {
  var email = $('#' + emailID).val();

  if (email.length > 0) {
    var regex = /^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+)\.([a-z]{2,8})(.[a-z]{2,8})?$/;

    if (!regex.test(email)) {
      var message = 'Invalid Email';
      createAlert(message);
      e.preventDefault();
    }
  }
}

function createAlert(message) {
  var alert_box = $('.universalAlertboxpopup');
  alert_box.css('display', 'block');
  var alert_box_content = $('.alert_message_box');
  alert_box_content.html("<div class=\"alert_message\" role=\"alert\" id=\"alert_box\">\n            <strong>Oops! </strong>".concat(message, "\n        </div>"));
}

function closeAlertBox() {
  var alert_box = $('.universalAlertboxpopup');
  alert_box.css('display', 'none');
}

function contactValidation(contactID) {
  var contact = $('#' + contactID);
  var input_value = contact.val();
  var sanitizedInput = input_value.replace(/\D/g, '');
  sanitizedInput = sanitizedInput.slice(0, 10);
  contact.val(sanitizedInput);
}

function passwordValidation(passwordID, confirmID) {
  var password = $('#' + passwordID).val();
  var confirm = $('#' + confirmID);
  var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z!@#$%^&*()_+])(?!.*\s).{8,20}$/;

  if (password.length > 0) {
    if (!regex.test(password)) {
      var message = 'Password must contain atleast 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character';
      createAlert(message);
      confirm.prop('disabled', true);
      return false;
    } else {
      confirm.prop('disabled', false);
      return true;
    }
  } else {
    confirm.prop('disabled', true);
  }
}

function confirmPassword(confirmID, passwordID, buttonID) {
  var password = $('#' + passwordID).val();
  var confirm = $('#' + confirmID).val();
  var button = $('#' + buttonID);

  if (confirm !== password) {
    button.prop('disabled', true);
  } else {
    button.prop('disabled', false);
  }
}

function changePassword() {
  var profile = $('.edit_form');
  profile.css('display', 'none');
  var changePassword = $('.change_password');
  changePassword.css('display', 'block');
}

function showPassword(inputID, iconID) {
  var input = $('#' + inputID);
  var icon = $('#' + iconID);

  if (input.attr('type') == 'password') {
    input.attr('type', 'text');
    icon.addClass('fa-eye-slash');
    icon.removeClass('fa-eye');
  } else {
    input.attr('type', 'password');
    icon.addClass('fa-eye');
    icon.removeClass('fa-eye-slash');
  }
}

function editFormSubmitted(imageID, userID, fnameID, lnameID, emailID, contactID, e) {
  var image = $('#' + imageID).val();
  var userID_value = $('#' + userID).val();
  var fname = $('#' + fnameID).val();
  var lname = $('#' + lnameID).val();
  var email = $('#' + emailID).val();
  var contact = $('#' + contactID).val(); // if(image.length > 0){
  //   let extension = image.split('.').pop().toLowerCase();
  //   if(jQuery.inArray(extension, ['gif', 'png', 'jpg', 'jpeg']) == -1){
  //     window.alert('Invalid Image File');
  //     return false;
  //   }
  // }

  console.log(fname + ' ' + lname + ' ' + email + ' ' + contact + ' ' + userID_value);

  if (fname.length > 0) {
    if (!isNaN(fname)) {
      window.alert('First Name cannot be a number');
      return false;
    }
  }

  if (lname.length > 0) {
    if (!isNaN(lname)) {
      window.alert('Last Name cannot be a number');
      return false;
    }
  }

  $.ajax({
    url: '/editprofile',
    method: 'POST',
    data: {
      userID: userID_value,
      fname: fname,
      lname: lname,
      email: email,
      contact: contact
    },
    success: function success(response) {
      setTimeout(function () {
        window.alert(response);
      }, 5000);
      window.location.href = '/profile';
    },
    error: function error(_error4) {
      console.log(_error4);
      e.preventDefault();
    }
  });
}

function onlyLowerCaseInput(inputID) {
  var input = $('#' + inputID);
  var input_value = input.val(); // the input value should contain only lowercase letters and numbers and should not start with numbers

  var sanitizedInput = input_value.replace(/[^a-z0-9@.]/g, '');
  sanitizedInput = sanitizedInput.slice(0, 25);
  input.val(sanitizedInput);
}

function forgotPassword(emailID, e) {
  e.preventDefault();
  $('.otpSentAnimation').css('display', 'block');
  $('#otpsent').text('Sending OTP...');
  $('#otpsenticon').removeClass('fa-circle-check');
  $('#otpsenticon').addClass('fa-circle-notch fa-spin');
  var userVerificationEmail = $('#' + emailID).val();
  console.log(userVerificationEmail);
  $.ajax({
    url: '/forgotPassword',
    method: 'POST',
    data: {
      email: userVerificationEmail
    },
    success: function success(response) {
      var success_status = response.success;
      console.log(success_status);

      if (success_status === true) {
        $('#otpsent').text('OTP Sent');
        $('#otpsenticon').removeClass('fa-circle-notch fa-spin');
        $('#otpsenticon').addClass('fa-circle-check');
        setTimeout(function () {
          $('.otpSentAnimation').css('display', 'none');
          var otpbox = $('.otpPopUp');
          otpbox.css('display', 'block');
          resendTimer();
          $('#blur, #navbar-blur').addClass('blur-background');
        }, 3000);
      } else {
        var message = response.message;
        createAlert(message);
        return;
      }
    },
    error: function error(_error5) {
      console.log(_error5);
    }
  });
}

function resendOtp(event) {
  event.preventDefault();
  var userVerificationEmail = $('#forgot_password_email').val();
  var did_not_received_otp = $('.did_not_received_otp');
  did_not_received_otp.css('display', 'none');
  var Otptimer = $('.Otptimer');
  Otptimer.css('display', 'block');
  $('.timermessage').css('display', 'none');
  $('#sendingotpicon').css('display', 'block');
  $.ajax({
    url: '/forgotPassword',
    method: 'POST',
    data: {
      email: userVerificationEmail
    },
    success: function success(response) {
      var success_status = response.success;

      if (success_status === true) {
        $('#sendingotpicon').css('display', 'none');
        $('.otpsentmessage').css('display', 'block');
        setTimeout(function () {
          var otpbox = $('.otpPopUp');
          $('.timermessage').css('display', 'block');
          $('.otpsentmessage').css('display', 'none');
          otpbox.css('display', 'block');
          resendTimer();
        }, 5000);
      } else {
        var message = response.message;
        createAlert(message);
      }
    },
    error: function error(_error6) {
      console.log(_error6);
    }
  });
}

function verifyOtp(emailID, otpClasses, e) {
  e.preventDefault();
  $('.otpsubmitanimation').css('display', 'block');
  $('#otpsubmiticon').removeClass('fa-circle-check');
  $('#otpsubmiticon').addClass('fa-circle-notch fa-spin');
  var userVerificationEmail = $('#' + emailID).val();
  var userVerificationOtp = '';
  var otparray = $('.' + otpClasses).toArray();
  otparray.forEach(function (otpElement) {
    userVerificationOtp += $(otpElement).val();
  });
  console.log(userVerificationEmail + "*******" + userVerificationOtp);
  $.ajax({
    url: '/verifyOtp',
    method: 'POST',
    data: {
      email: userVerificationEmail,
      otp: userVerificationOtp
    },
    success: function success(response) {
      var success_status = response.success;

      if (success_status) {
        $('#otpsubmiticon').removeClass('fa-circle-notch fa-spin');
        $('#otpsubmiticon').addClass('fa-circle-check');
        setTimeout(function () {
          $('.otpsubmitanimation').css('display', 'none');
          var otpbox = $('.otpPopUp');
          otpbox.css('display', 'none');
          $('#blur, #navbar-blur').removeClass('blur-background');
          var resetPassword = $('.resetPassword');
          resetPassword.css('display', 'block');
          console.log('OTP verification success');
          window.location.href = "/".concat(response.userID, "/resetPassword");
        }, 2000);
      } else {
        $('.otpsubmitanimation').css('display', 'none');
        var message = response.message;
        createAlert(message);
      }
    },
    error: function error(_error7) {
      console.log(_error7);
    }
  });
}

function resetPassword(passwordID, userID, event) {
  event.preventDefault();
  var resetNewPassword = $('#' + passwordID).val();
  var userID_value = userID;
  $('.resetPasswordanimation').css('display', 'block');
  $.ajax({
    url: '/resetPassword',
    method: 'POST',
    data: {
      userID: userID_value,
      newPassword: resetNewPassword
    },
    success: function success(response) {
      var success_status = response.success;

      if (success_status) {
        var message = response.message;
        $('#resetSubmitmessage').text(message);
        $('#resetSubmiticon').removeClass('fa-circle-notch fa-spin');
        $('#resetSubmiticon').addClass('fa-circle-check');
        setTimeout(function () {
          $('.resetPasswordanimation').css('display', 'none');
          $('#resetSubmitmessage').text('Setting Password . . . . .');
          $('#resetSubmiticon').removeClass('fa-circle-check');
          $('#resetSubmiticon').addClass('fa-circle-notch fa-spin');
        }, 3000);
        setTimeout(function () {
          window.location.href = '/login';
        }, 1000);
      } else {
        var _message = response.message;
        createAlert(_message);
      }
    },
    error: function error(_error8) {
      console.log(_error8);
    }
  });
}

function otpKeyPressed(inputID, event) {
  var inputElement = $('#' + inputID);
  var keyDownValue = event.key;
  event.preventDefault(); // Prevent non-numeric characters and spaces

  if (keyDownValue === 'Backspace') {
    if (inputID === 'digit1') {
      inputElement.val('');
      return;
    } else if (inputID === 'digit6') {
      var dig6 = inputElement.val();

      if (dig6.length == 0) {
        var previousInputID = 'digit' + (parseInt(inputID.substring(5, 6)) - 1);
        var previousInput = $('#' + previousInputID);
        var prevValue = previousInput.val();
        previousInput.focus();
      } else inputElement.val('');

      return;
    } else {
      var dig = inputElement.val();

      if (dig.length == 0) {
        var _previousInputID = 'digit' + (parseInt(inputID.substring(5, 6)) - 1);

        var _previousInput = $('#' + _previousInputID);

        var _prevValue = _previousInput.val();

        _previousInput.focus();
      } else inputElement.val('');

      return;
    }
  } else {
    if (!isNaN(keyDownValue) && keyDownValue !== " ") {
      var digvalue = inputElement.val();

      if (inputID === 'digit6') {
        if (digvalue.length == 0) {
          inputElement.val(keyDownValue);
          return;
        } else {
          inputElement.val(digvalue.substring(0, 1));
          return;
        }
      } else {
        if (digvalue.length == 0) {
          inputElement.val(keyDownValue);
          return;
        } else {
          inputElement.val(digvalue.substring(0, 1));
          var nextInputID = 'digit' + (parseInt(inputID.substring(5, 6)) + 1);
          var nextInput = $('#' + nextInputID);
          nextInput.focus();
          return;
        }
      }
    } else {
      if (keyDownValue !== 'Enter') {
        inputElement.val('');
      } else {
        if (inputID == 'digit6' && keyDownValue === 'Enter') {
          var form = $('.otpInputForm');
          form.submit();
        }
      }

      return;
    }

    return;
  }
}

function keyDown(inputID, event) {
  var key = event.key;
  if ((isNaN(key) || key === " ") && key !== 'Backspace') event.preventDefault();
}

function resendTimer() {
  var timerDuration = 60;
  var timer = timerDuration;
  var timerElement = $('#timer');
  $('.timermessage').css('display', 'block');
  $('.otpsentmessage').css('display', 'none');

  function updateTimer() {
    timerElement.text(timer + ' seconds');
    timer--;

    if (timer < 0) {
      clearInterval(timerInterval);
      var otptime = $('.Otptimer');
      timerElement.text('');
      timer = timerDuration;
      otptime.css('display', 'none');
      var resendotpdiv = $('.did_not_received_otp');
      resendotpdiv.css('display', 'block');
      return;
    }
  }

  var timerInterval = setInterval(function () {
    updateTimer();
  }, 1000);
}

function home(e) {
  window.location.href = '/';
}

function logout(e) {
  window.location.href = '/logout';
}

function arrowDownIconClicked(tbodyID, iconclass, event) {
  var downicon = $('.' + iconclass);
  downicon.toggleClass('rotateDownIcon');
  var tableBody = $('#' + tbodyID);

  if (tableBody.css('display') === 'none') {
    tableBody.css('display', 'contents');
  } else {
    tableBody.css('display', 'none');
  }
}
/* <button onclick="printDiv()">Print Content</button>
<script>
function printDiv() {
var divContents = document.getElementById("printableDiv").innerHTML;
var a = window.open('', '', 'height=500, width=500');
a.document.write('<html>');
a.document.write('<body >');
a.document.write(divContents);
a.document.write('</body></html>');
a.document.close();
a.print();
}
</script>
In the printDiv() function, first we get the innerHTML of the div using getElementById() method. Then, we open a new window using window.open() method and write the div contents to it using document.write() method. After that, we close the document using document.close() method and print it using print() method.
*/

/* $('#input').on('input', function() {
    let value = $(this).val();
    $.ajax({
      url: '/',
      method: 'POST',
      data: { input: value },
      success: function(response) {
        console.log('Server response:', response);
      }
    });
 });
 */

/* $(".password").on('blur', (e)=>{
  let password = $('#password').val();
  console.log(password);
  let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z!@#$%^&*()_+])(?!.*\s).{8,20}$/;
  console.log(regex.test(password));
    if (regex.test(password)) {
        $('.signup-button').removeAttr('disabled');
        $('.error-message').text("");
    } 
    else 
    {
        $('.error-message').text("Password must contain atleast 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character");
        // Password is invalid
    }
}) */

/* $(".password").on('input', (e)=>{
  let password = e.target.value;
  console.log(password);
  $(".confirm-password").on('input', (c)=>{
    let confirmPassword = c.target.value;
    console.log(confirmPassword);
    if(password == confirmPassword)
    {
      $('.signup-button').removeAttr('disabled');
    }
    else{
      $('.signup-button').attr('disabled', 'disabled');
    }
  })
}); */

/* const animateOnScroll = () => {
  const element = document.querySelector('.animate-on-scroll');
  const elementTop = element.getBoundingClientRect().top;
  const elementHeight = element.offsetHeight;
  const windowHeight = window.innerHeight;

  if (elementTop <= windowHeight - elementHeight / 2) {
    element.classList.add('animate');
    setTimeout(function(){
      element.classList.remove('animate');
    }, 800);
    $(window).off('scroll', animateOnScroll);
  }
};

$(".service-head").on('scroll', function(){
  $(window).on('scroll', animateOnScroll);
}) */

/* const OnScroll = () => {
  const element1 = document.querySelector('.on-scroll');
  const elementTop1 = element1.getBoundingClientRect().top;
  const elementHeight1 = element1.offsetHeight;
  const windowHeight1 = window.innerHeight;

  if (elementTop1 <= windowHeight1 - elementHeight1 / 2) {
    element1.classList.add('animate');
    setTimeout(function(){
      element1.classList.remove('animate');
    }, 800);
    $(window).off('scroll', OnScroll);
  }
};
$(".info-head").on('scroll', function(){
  $(window).on('scroll', OnScroll);
}) */


$(document).ready(function () {
  $('.print').click(function () {
    var printContent = $('.pnr-top').html();
    var originalContent = $('body').html();
    $('body').html(printContent);
    window.print();
    $('body').html(originalContent);
  });
}); // $(".source").on('input', (e)=>{
//   var source = e.target.value;
//   console.log(source);});

/*  var codes;
$.getJSON('Name-Code.json', function(data) {
  // store the data in a variable for later use
  codes = data;
});

$('.source').on('input', function(E) {
  // get the current value of the input field
  var userInput = E.target.value;
  // filter the codes based on the user input
  var filteredCodes = codes.filter(function(item) {
    var keys = Object.keys(item.B);
    var match = false;
    
    keys.forEach(function(key) {
      if (item[key].startsWith(userInput.toUpperCase())) {
        match = true;
      }
    });
    
    return match;
  });
  
  // create a list of options to show to the user
  var optionsList = '';
  
  filteredCodes.forEach(function(item) {
    var keys = Object.keys(item);
    keys.forEach(function(key) {
      optionsList += '<li>' + item[key] + '</li>';
    });
  });
  
  // display the list of options to the user
  console.log(optionsList);
});
 */
// $(document).ready(function(){
//   let width = $(window).width();
//   console.log(width);
//   if(width<=576)
//   {
//     $(".TBWS_from").addClass("order-1 col-sm-6");
//     $(".TBWS_to").addClass("order-2 col-sm-6");
//     $(".TBWS_CR").addClass("order-3 col-sm-12");
//   }
// })