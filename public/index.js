/******************************************************************************************************************* */
$(document).ready(function() {
$(".dropdown").hover(function() 
{
  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
}, function() {
  $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
});
});
/******************************************************************************************************************* */
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

/******************************************************************************************************************* */
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
/******************************************************************************************************************* */
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
          // Password is invalid
      }
    }
    else
    {
      $('.error-message').text("");
    }
    });
});
/******************************************************************************************************************* */
$(document).ready(function(){
  $('.confirm-password').on('input', function(){
    const inputP = $('.password').val();
    const inputCP= $(this).val();
    if(inputCP.length>0)
    {
      /* $.ajax({
        url: '/signup',
        method: 'get',
        data: { inputP: inputP, inputCP: inputCP},
        success: function(response){ */
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
/******************************************************************************************************************* */
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
    }
  })
});
/******************************************************************************************************************* */
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

/******************************************************************************************************************* */
function chatbot_button_clicked(){
  $('.chatbot_click').css('display', 'none');
  $('.chatbot-body').css('animation-duration', '0.5s');
  $('.chatbot-body').css('animation-name', 'chatbot-body-bottom-to-top-animation');
  $('.chatbot-body').css('display', 'block');
  $('#blur').addClass('blur-background');
}
function chatbot_close_button_clicked(){
  $('.chatbot-body').css('animation-duration', '1s');
  $('.chatbot-body').css('animation-name', 'chatbot-body-top-to-bottom-animation');
  setTimeout(function(){
    $('.chatbot-body').css('display', 'none');
    $('.chatbot_click').css('display', 'block');
  }, 1001);
  $('#blur').removeClass('blur-background');
}
/******************************************************************************************************************* */

let input;
let searchResult;

$(document).ready(function() 
{
      $('.search-station').on('focus', function(){
        console.log($(this).hasClass('source') + "for source");
        console.log($(this).hasClass('destination') + "for destination");
        if ($(this).hasClass('source')) {
          input = $('.source');
          searchResult = $('.autocom-source');
        } 
        if ($(this).hasClass('destination')) {
          input = $('.destination');
          searchResult = $('.autocom-destination');
        }
        console.log(input + "   input");
        console.log(searchResult+ "    searchResult");
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
        console.log(e.key);
        const searchValue = input.val();
        $.ajax({
            url: '/station-search',
            method: 'post',
            data: { input: searchValue},
            success: function(response)
            {
                console.log(response);
                let filteredSuggestions = response;
                console.log("filteredSuggestions array: " + filteredSuggestions);
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
                console.log(currentFocus); 
            }
        });
    }, 300);
  }); 
};

/******************************************************************************************************************* */
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
  setTimeout(function() {
    $('#train_number, #train_name, #from_station, #to_station').text("");
    $('#train-info-stoppages').empty();
    $('#train-info-output').css('display', 'none');
    $('#blur, #navbar-blur').css('filter', 'blur(0px)');
    $('body').css('overflow', 'auto');
  }, 1001);
}
$('#trainInfoForm').submit(function(event) {
  event.preventDefault();
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
        
        let responseArray = data.trainInfoArray.route;
        let trainNo = data.trainNo;
        let route_length = responseArray.length;
        $('#train_number').text(trainNo);
        $('#train_name').text(value.split(" - ")[1]);
        $('#from_station').text(responseArray[0].station_name);
        $('#to_station').text(responseArray[route_length - 1].station_name);
        
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

/******************************************************************************************************************* */

/******************************************************************************************************************* */

loader = $(".lds-default");
$('#blur').addClass('blur-background');
window.addEventListener("load", function(){
    loader.css('display', 'none');
    $('#blur').removeClass('blur-background');
});

// $(window).on('load', function(){
//   $('.loading').fadeOut(1000);
//   $('.loading').css('display', 'none');
// });

// .loading is the cclass in the loading animation div
// .main is the class in the main div













{/* <button onclick="printDiv()">Print Content</button>

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
 */}























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



$(document).ready(function() {
  $(".print").click(function() {
    var printContent = $(".pnr-top").html();
    var originalContent = $("body").html();
    $("body").html(printContent);
    window.print();
    $("body").html(originalContent);
  });
});

// $(".source").on('input', (e)=>{
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