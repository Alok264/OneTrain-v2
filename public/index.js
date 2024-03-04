

$(document).ready(function () {
  $('.dropdown').hover(
    function () {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500)
    },
    function () {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500)
    }
  )
})
/******************************************************************************************************************* */
$(document).ready(function () {
  $(window).scroll(function () {
    var top = $('.goto-top')
    if (
      $('body').height() <=
      $(window).height() + $(window).scrollTop() + 200
    ) {
      top.animate({ 'margin-left': '0px' }, 1500)
    } else {
      top.animate({ 'margin-left': '-100%' }, 1500)
    }
  })

  $('.goto-top').on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 400)
  })
})

/******************************************************************************************************************* */
var count = 0
$(document).ready(function () {
  var button = $('.more-button').on('click', function () {
    count++
    if (count % 2 != 0) {
      $('.status').css('display', 'flex')
      $('.status').css('animation-name', 'more-top-to-bottom-translation')
      button.text('Less')
    } else {
      $('.status').css('display', 'none')
      button.text('More')
    }
  })
})
/******************************************************************************************************************* */

/******************************************************************************************************************* */

/******************************************************************************************************************* */
$(document).ready(function () {
  $.ajax({
    url: '/isLogedIn',
    method: 'GET',
    success: function (response) {
      if (response.logedIn === true) {
        $('.login_img').attr('src', response.photourl)
        $('.login_img').css('display', 'block')
        $('.login_dropdown').addClass('dropdown')
        $('.login_username').find('span').text(response.username)
        $('#login_user').attr('data-bs-toggle', 'dropdown')
      } else {
        $('.login_img').css('display', 'none')
        $('.login_dropdown').removeClass('dropdown')
        $('.login_username').find('span').text('Login/Signup')
        $('#login_user').removeAttr('data-bs-toggle')
      }
    }
  })
})
/******************************************************************************************************************* */
$(document).ready(function () {
  $('.pnr-input').on('input', function () {
    let pnr = $(this).val()
    if (pnr.length < 10 || pnr.length > 10) {
      if (pnr.length < 10) {
        $('.alert-message').css('color', 'blue')
      } else {
        $('.alert-message').css('color', 'red')
      }
      $('.alert-message').text(
        'PNR must be of 10 digits' +
          ' Enter Remaining ' +
          (10 - pnr.length) +
          ' digits'
      )
      $('.alert-message').css('display', 'block')
      $('.pnr-button').attr('disabled', 'disabled')
    } else {
      $('.alert-message').css('color', 'green')
      $('.alert-message').text('Hurrah! You can check your PNR status now')
      $('.alert-message').css('display', 'block')
      $('.pnr-button').removeAttr('disabled')
    }
  })
})
/********************************************************************************************************************************/


/********************************************************************************************************************************/

/***************************Chatbot**************************************************************************************** */
function chatbot_button_clicked () {
  $('.chatbot_click').css('display', 'none')
  $('.chatbot-body').css('animation-duration', '0.5s')
  $('.chatbot-body').css(
    'animation-name',
    'chatbot-body-bottom-to-top-animation'
  )
  $('.chatbot-body').css('display', 'block')
  $('#blur, #navbar-blur').addClass('blur-background')
  $('#userInput').focus()
  $('body').css('overflow-y', 'hidden')
}
function chatbot_close_button_clicked () {
  $('.chatbot-body').css('animation-duration', '1s')
  $('.chatbot-body').css(
    'animation-name',
    'chatbot-body-top-to-bottom-animation'
  )
  setTimeout(function () {
    $('.chatbot-body').css('display', 'none')
    $('.chatbot_click').css('display', 'block')
  }, 1001)
  $('#blur, #navbar-blur').removeClass('blur-background')
  $('body').css('overflow-y', 'auto')
}

let chatBotFunction = "";

function chat_response (e) {
  e.preventDefault()
  let userMessage = $('#userInput').val().trim()
  $('#userInput').val('')
  if(userMessage.length==0) return false;
  let userHtml =
    '<div class="chat09-container-user text09"><div class="chat09-container-text-user"><span class="chat09-container-user-text">' +
    userMessage +
    '</span></div></div>'
  $('#chatbox').append(userHtml)
  $('#chatbox').scrollTop($('#chatbox').prop('scrollHeight'))
  loadingAnimation(true)
  console.log(userMessage)
  if(chatBotFunction === '09pnrstatus'){
    handleChatPNR(userMessage);}
  else if(chatBotFunction === '09trainstatus'){
    handleChatTrain(userMessage);}
  else if(chatBotFunction === '09farecalculator'){
    handleChatFare(userMessage);}
  else if(chatBotFunction === '09irctc'){
    handleChatIRCTC();}
  else{
    handleChat(userMessage);}
}

function handleChat(userMessage){
  $.ajax({
    method: 'GET',
    url: '/chat',
    data: { userMessage: userMessage },
    success: function (response) {
      loadingAnimation(false)
      let botMessage = response;
      botResponse(botMessage)
    },
    error: function (error) {
      console.log(error)
      loadingAnimation(false)
      let botMessage = "Server Error";
      botResponse(botMessage)
    }
  });
}

function handleChatPNR(userMessage){
  if(userMessage.length !== 10){
    loadingAnimation(false)
    let botMessage = "Invalid PNR, Click PNR status to try again";
    botResponse(botMessage)
    chatBotFunction = "";
    return;
  }
  try{
    userMessage = parseInt(userMessage);
  }
  catch(error){
    loadingAnimation(false)
    let botMessage = "Invalid PNR, Click PNR status to try again";
    botResponse(botMessage)
    chatBotFunction = "";
    return;
  }
  $.ajax({
    method: 'GET',
    url: '/chatPNR',
    data: { userMessage: userMessage },
    success: function (response) {
      if(response.success)
      {
        response = response.message;
        loadingAnimation(false)
        let botMessage = `<div class=chatpnrcontainer>
                            <div class="common">
                              <p>PNR Status</p>
                              <p>${response.Pnr}</p>
                            </div>
                            <div class="common">
                              <p>${response.TrainNo}</p>
                              <p>${response.TrainName}</p>
                            </div>
                            <div class="common">
                              <p>DOJ</p>
                              <p>${response.Doj}</p>
                            </div>
                            <div class="common">
                              <p>${response.From}</p>
                              <p>To</p>
                              <p>${response.To}</p>
                            </div>
                            <div class="common">
                              <p>${response.DepartureTime}</p>
                              <p>${response.ArrivalTime}</p>
                            </div>
                            <div class="tablediv">
                              <table>
                                <thead class="chatpnrth">
                                  <th>Id</th>
                                  <th>BS</th>
                                  <th>CS</th>
                                  <th>Coach</th>
                                  <th>Berth</th>
                                  <th>BT</th>
                                </thead>
                                <tbody>
                                  <div>
                                  ${
                                    response.PassengerStatus.map((passenger) => {
                                      return `<tr class="chatpnrtr">
                                                <td>${passenger.Number}</td>
                                                <td>${passenger.BookingStatus}</td>
                                                <td>${passenger.CurrentStatus}</td>
                                                <td>${passenger.Coach?passenger.Coach:"---"}</td>
                                                <td>${passenger.Berth?passenger.Berth:"---"}</td>
                                                <td>${passenger.BookingBerthCode?passenger.BookingBerthCode:"---"}</td>
                                              </tr>`
                                    }).join('')
                                  }
                                  </div>
                                </tbody>
                              </table>
                            </div>
                          </div>`
        botResponse(botMessage)
      }
      else{
        loadingAnimation(false)
        let botMessage = response.message;
        botResponse(botMessage)
      }
    },
    error: function (error) {
      console.log(error)
      loadingAnimation(false)
      let botMessage = response.message;
      botResponse(botMessage)
    }
  });
  chatBotFunction = "";
}

function handleChatTrain(userMessage){
  $.ajax({
    method: 'GET',
    url: '/chatTrain',
    data: { userMessage: userMessage },
    success: function (response){
      if(response.success){
        response = response.message;
        loadingAnimation(false)
        const botMessage = `
            <div class=chatpnrcontainer>
                            <div class="common">
                              <p>Train Info.</p>
                              <p>${response.trainNumber}</p>
                            </div>
                            <div class="common">
                              <p>${response.trainName}</p>
                            </div>
                            <div class="common">
                              <p>Train Type</p>
                              <p>${response.trainType}</p>
                            </div>
                            <div class="common">
                              ${
                                  con
                              }
                            </div>
                            <div class="common">
                              <p>${response.DepartureTime}</p>
                              <p>${response.ArrivalTime}</p>
                            </div>
                            <div class="tablediv">
                              <table>
                                <thead class="chatpnrth">
                                  <th>Id</th>
                                  <th>BS</th>
                                  <th>CS</th>
                                  <th>Coach</th>
                                  <th>Berth</th>
                                  <th>BT</th>
                                </thead>
                                <tbody>
                                  <div>
                                  ${
                                    response.PassengerStatus.map((passenger) => {
                                      return `<tr class="chatpnrtr">
                                                <td>${passenger.Number}</td>
                                                <td>${passenger.BookingStatus}</td>
                                                <td>${passenger.CurrentStatus}</td>
                                                <td>${passenger.Coach?passenger.Coach:"---"}</td>
                                                <td>${passenger.Berth?passenger.Berth:"---"}</td>
                                                <td>${passenger.BookingBerthCode?passenger.BookingBerthCode:"---"}</td>
                                              </tr>`
                                    }).join('')
                                  }
                                  </div>
                                </tbody>
                              </table>
                            </div>
                          </div>
        
              `
      }
      else
      {
        loadingAnimation(false)
        let botMessage = response.message;
        botResponse(botMessage)
      }
    },
    error: function (error) {
      console.log(error)
      loadingAnimation(false)
      let botMessage = response.message;
      botResponse(botMessage)
    }
  });
  chatBotFunction = "";
}




function handleChatButton(event){
  const buttonID = event.target.id;
  chatBotFunction = buttonID;
  let message = '';
  if(buttonID === '09pnrstatus'){
    message = 'Enter your 10 digit PNR number';}
  else if(buttonID === '09trainstatus'){
    message = 'Enter your train number';}
  else if(buttonID === '09farecalculator'){
    message = 'Enter your train number';}
  else if(buttonID === '09irctc'){
    message = "<a href='https://www.irctc.co.in/nget/train-search' target='_blank'>Click here</a> to book your ticket";}
  botResponse(message);
}

function botResponse(message){
  if(message){
    let botHtml =
          '<div class="chat09-container-system text09"><div class="chat09-container-text-system"><span class="chat09-container-system-text">' +
          message +
          '</span></div></div>'
        $('#chatbox').append(botHtml)
        $('#chatbox').scrollTop($('#chatbox').prop('scrollHeight'))}
  else{
    let botHtml =
          '<div class="chat09-container-system text09"><div class="chat09-container-text-system"><span class="chat09-container-system-text">Sorry, I did not understand that. Please try again.</span></div></div>'
        $('#chatbox').append(botHtml)
        $('#chatbox').scrollTop($('#chatbox').prop('scrollHeight'))}
}

function loadingAnimation (show) {
  let loadingHtml =
    '<div class="scaling-dots"><div></div><div></div><div></div><div></div></div>'
  if (show) {
    $('#chatbox').append(loadingHtml)
  } else {
    $('.scaling-dots').remove()
  }
}

/******************************************************************************************************************* */

let input
let searchResult

$(document).ready(function () {
  $('.search-station').on('focus', function () {
    if ($(this).hasClass('source')) {
      input = $('.source')
      searchResult = $('.autocom-source')
    }
    if ($(this).hasClass('destination')) {
      input = $('.destination')
      searchResult = $('.autocom-destination')
    }
    console.log(input + '   input')
    console.log(searchResult + '    searchResult')
    Active(input, searchResult)
  })
})

function Active (input, searchResult) {
  let currentFocus = -1
  let previous_child
  let next_child
  let current_child
  let debounceTimer

  input.on('keyup', function (e) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const searchValue = input.val()
      $.ajax({
        url: '/station-search',
        method: 'POST',
        data: { input: searchValue },
        success: function (response) {
          let filteredSuggestions = response
          console.log('filteredSuggestions array: ' + filteredSuggestions)
          const listtlength = Math.min(filteredSuggestions.length, 6)
          searchResult.empty()

          if (searchValue) {
            filteredSuggestions.slice(0, listtlength).forEach(suggestion => {
              searchResult.append(
                `<li type="none" class="search-list">${
                  suggestion.A + ' - ' + suggestion.B
                }</li>`
              )
            })
            searchResult.show()
          } else {
            searchResult.hide()
          }

          const listItems = searchResult.find('li')
          const first_child = listItems.first()

          $('.search-list').on('click', function () {
            input.val($(this).text())
            searchResult.hide()
            input.next('input').focus()
          })

          if (e.key === 'ArrowDown') {
            if (currentFocus === listtlength - 1) {
              currentFocus = -1
            }
            if (currentFocus === -1) {
              currentFocus = 0
              first_child.addClass('highlight')
            } else {
              previous_child = listItems.eq(currentFocus)
              previous_child.removeClass('highlight')
              currentFocus++
              current_child = listItems.eq(currentFocus)
              current_child.addClass('highlight')
            }
          }
          if (e.key === 'ArrowUp') {
            if (currentFocus === 0) {
              currentFocus = listtlength
            }
            if (currentFocus === -1) {
              currentFocus = listtlength - 1
              listItems.eq(currentFocus).addClass('highlight')
            } else {
              previous_child = listItems.eq(currentFocus)
              previous_child.removeClass('highlight')
              currentFocus--
              current_child = listItems.eq(currentFocus)
              current_child.addClass('highlight')
            }
          }
          if (e.key === 'Enter') {
            e.preventDefault() // Prevent form submission
            if (current_child) {
              input.val(current_child.text())
              searchResult.hide()
            }
            input.next('input').focus()
          }
          console.log(currentFocus)
        },
        error: function (error) {
          console.log(error)
        }
      })
    }, 300)
  })
}

/******************************************************************************************************************* */
let train_search_input
let train_search_result
$(document).ready(function () {
  $('.search-train').on('focus', function () {
    train_search_input = $('.train-number-name')
    train_search_result = $('.autocom-box-train-search')
    TrainSearch(train_search_input, train_search_result)
  })
})

function TrainSearch (train_search_input, train_search_result) {
  let currentFocus = -1
  let previous_child
  let next_child
  let current_child
  let debounceTimer
  train_search_input.on('keyup focus', function (e) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const searchValue = $(this).val()
      if (searchValue.length > 0) {
        $.ajax({
          url: '/train-search',
          method: 'POST',
          data: { input: searchValue },
          success: function (response) {
            let filteredSuggestions = response
            const listtlength = Math.min(filteredSuggestions.length, 8)
            train_search_result.empty()

            if (searchValue) {
              filteredSuggestions.slice(0, listtlength).forEach(suggestion => {
                train_search_result.append(
                  `<li type="none" class="search-list">${
                    suggestion.trainNo + ' - ' + suggestion.trainName
                  }</li>`
                )
              })
              train_search_result.show()
            } else {
              train_search_result.hide()
            }

            const listItems = train_search_result.find('li')
            const first_child = listItems.first()
            $('.search-list').on('click', function () {
              train_search_input.val($(this).text())
              train_search_result.hide()
            })

            if (e.key === 'ArrowDown') {
              if (currentFocus === listtlength - 1) {
                currentFocus = -1
              }
              if (currentFocus === -1) {
                currentFocus = 0
                first_child.addClass('highlight')
              } else {
                previous_child = listItems.eq(currentFocus)
                previous_child.removeClass('highlight')
                currentFocus++
                current_child = listItems.eq(currentFocus)
                current_child.addClass('highlight')
              }
            }
            if (e.key === 'ArrowUp') {
              if (currentFocus === 0) {
                currentFocus = listtlength
              }
              if (currentFocus === -1) {
                currentFocus = listtlength - 1
                listItems.eq(currentFocus).addClass('highlight')
              } else {
                previous_child = listItems.eq(currentFocus)
                previous_child.removeClass('highlight')
                currentFocus--
                current_child = listItems.eq(currentFocus)
                current_child.addClass('highlight')
              }
            }
            if (e.key === 'Enter') {
              e.preventDefault() // Prevent form submission
              if (current_child) {
                train_search_input.val(current_child.text())
                train_search_result.hide()
              }
            }
          }
        })
      } else {
        train_search_result.empty()
        train_search_result.hide()
      }
    }, 300)
  })
}


function close_train_info_output () {
  $('.train-info-output').css(
    'animation-name',
    'train-info-output-out-animation'
  )
  setTimeout(function () {
    $('#train_number, #train_name, #from_station, #to_station').text('')
    $('#train-info-stoppages').empty()
    $('#train-info-output').css('display', 'none')
    $('#blur, #navbar-blur').css('filter', 'blur(0px)')
    $('body').css('overflow', 'auto')
  }, 1001)
}
$('#trainInfoForm').submit(function (event) {
  event.preventDefault() //prevent reloading of page after form submission
  let value = $('.train-number-name').val()
  let trainNumber = value
  if (value.length > 6) {
    trainNumber = value.split(' - ')[0]
  }
  console.log(trainNumber)
  if (trainNumber.length > 0) {
    $.ajax({
      url: '/train-info',
      method: 'POST',
      data: { trainNo: trainNumber },
      success: function (data) {
        $('.train-info-output').css(
          'animation-name',
          'train-info-output-in-animation'
        )
        $('#train-info-output').css('display', 'block')
        $('#blur, #navbar-blur').css('filter', 'blur(5px)')
        $('body').css('overflow', 'hidden')
        let response = data.trainInfoArray
        let responseArray = response.route
        let trainNo = data.trainNo
        let route_length = responseArray.length
        $('#train_number').text(trainNo)
        $('#train_name').text(response.trainName)
        $('#from_station').text(responseArray[0].station_name)
        $('#to_station').text(responseArray[route_length - 1].station_name)
        let rundays = response.runDays
        $.each(rundays, function (index, day) {
          if (day === false) {
            $('.' + day).css('background-color', '#ff8484')
          } else {
            $('.' + day).css('background-color', '#0DE89F')
          }
        })
        for (let key in rundays) {
          if (rundays.hasOwnProperty(key)) {
            value = rundays[key]
            if (value === false) {
              $('.' + key).css('background-color', '#ff8484')
            } else {
              $('.' + key).css('background-color', '#0DE89F')
            }
          }
        }

        let SNo = 0
        $.each(responseArray, function (index, route) {
          if (route.stop === true) {
            SNo++
            let row = $('<tr class="tr"></tr>')
            row.append('<td>' + SNo + '</td>')
            row.append('<td>' + route.station_code + '</td>')
            row.append('<td>' + route.station_name + '</td>')

            let reference_time = route.today_sta
            let hours = Math.floor(reference_time / 60)
            let mins = reference_time % 60
            let arrival_time =
              hours.toString().padStart(2, '0') +
              ':' +
              mins.toString().padStart(2, '0')
            let halt = route.std_min - route.sta
            mins += halt
            if (mins >= 60) {
              hours += 1
              mins -= 60
            }
            let departure_time =
              hours.toString().padStart(2, '0') +
              ':' +
              mins.toString().padStart(2, '0')
            if (index == 0) {
              arrival_time = '---'
              halt = '---'
            }
            if (index == route_length - 1) {
              departure_time = '---'
              halt = '---'
            }
            halt = halt.toString().padStart(2, '0')
            row.append('<td>' + arrival_time + '</td>')
            row.append('<td>' + departure_time + '</td>')
            row.append('<td>' + halt + '</td>')
            row.append(
              '<td>' + Math.floor(route.distance_from_source) + '</td>'
            )
            row.append('<td>' + route.day + '</td>')

            $('#train-info-stoppages').append(row)
          }
        })
      },
      error: function (error) {
        console.error(error)
      }
    })
  }
})

/******************************************************************************************************************* */

/******************************************************************************************************************* */

loader = $('.lds-default')
$('#blur').addClass('blur-background')
window.addEventListener('load', function () {
  loader.css('display', 'none')
  $('#blur').removeClass('blur-background')
})

function profile () {
  const editProfileButton = $('#editProfileButton')
  editProfileButton.css('display', 'none')
  const changePassword = $('.change_password')
  changePassword.css('display', 'none')
  const upcomingJourney = $('.upcoming_journey')
  upcomingJourney.css('display', 'none')
  const pastJourney = $('.past_journey')
  pastJourney.css('display', 'none')
  const profile = $('.edit_form')
  profile.css('display', 'block')
  const profilepiclabel = $('.profilepiclabel')
  profilepiclabel.css('display', 'none')
  const profilefile = $('#profilefile')
  profilefile.prop('disabled', true)
  const edit_input = $('.edit_input')
  edit_input.prop('disabled', true)
}

function editProfile () {
  const changePassword = $('.change_password')
  changePassword.css('display', 'none')
  const upcomingJourney = $('.upcoming_journey')
  upcomingJourney.css('display', 'none')
  const pastJourney = $('.past_journey')
  pastJourney.css('display', 'none')
  const profile = $('.edit_form')
  profile.css('display', 'block')
  const profilepiclabel = $('.profilepiclabel')
  profilepiclabel.css('display', 'block')
  const profilefile = $('#profilefile')
  profilefile.prop('disabled', false)
  const edit_input = $('.edit_input')
  edit_input.prop('disabled', false)
  const editProfileButton = $('#editProfileButton')
  editProfileButton.css('display', 'block')
}

async function upcomingJourney(){
  $('.upcoming_journey').empty();
  const profile = $('.edit_form')
  profile.css('display', 'none')
  const changePassword = $('.change_password')
  changePassword.css('display', 'none')
  const pastJourney = $('.past_journey')
  pastJourney.css('display', 'none')
  const upcomingJourney = $('.upcoming_journey')
  upcomingJourney.css('display', 'grid')
  await journey('/upcomingJourney', 'upcoming_journey', 'Upcoming Journey');
}

async function pastJourney(){
  $('.past_journey').empty();
  const profile = $('.edit_form')
  profile.css('display', 'none')
  const changePassword = $('.change_password')
  changePassword.css('display', 'none')
  const upcomingJourney = $('.upcoming_journey')
  upcomingJourney.css('display', 'none')
  const pastJourney = $('.past_journey')
  pastJourney.css('display', 'grid')
  await journey('/pastJourney', 'past_journey', 'Past Journey');
}

async function journey(url, className, name){ 
  try{
    $.ajax({
      url: url,
      method: 'GET',
      success: function(response){
        if(response.success){
          const responseMessage = response.message;
          if(responseMessage.length === 0){
            const journeyHTML = ` <div class="journey_elements">
                                    <div class="journey_data">
                                      <p>No ${name}</p>
                                    </div>
                                  </div>`;
            $('.'+ className).append(journeyHTML);
            return;
          }
          responseMessage.map((journey) => {
            const journeyHTML = `
              <div class="journey_elements">
                <div class="journey_data">
                  <p id="journey_PNR">${journey.pnr}</p>
                  <p style="justify-self: end; cursor:pointer" onclick="copyToClipBoard('journey_PNR')" ><i class="fa-solid fa-copy"></i></p>
                </div>
                <div class="journey_data">
                  <p>${journey.train_number}</p>
                  <p>${journey.train_name}</p>
                </div>
                <div class="journey_data">
                  <p>${journey.source} ${journey.source_code}</p>
                  <p>${journey.destination} ${journey.destination_code}</p>
                </div>
                <div class="journey_data">
                  <p>Doj: ${journey.date}</p>
                  <p>Class: ${journey.class}</p>
                </div>
                <div class="journey_data">
                  <p> Total Passengers: ${journey.count} </p>
                </div>
              </div>
            `;
            $('.'+ className).append(journeyHTML);
          });
        }
        else{
          const message = response.message;
          createAlert(message + "Not found any journey", 'red');
        }
      },
      error: function(error){
        console.log(error);
        createAlert('Server side Error', 'red');
      }
    })
  }
  catch(error){
    console.log(error);
    createAlert('Server side Error', 'red');
  }
}


function copyToClipBoard(elementID) {
  let element = $('#' + elementID);
  let textToCopy = element.text();
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      window.alert('Copied to clipboard');
    })
    .catch((error) => {
      console.log(error);
      const message = 'Failed to copy';
      createAlert(message, "red");
    });
}

function printIt(elementID) {
  let element = $('#' + elementID);
  let textToPrint = element.html();
  let printWindow = window.open('', '', 'height=500,width=800');
  let styles = $('link[rel="stylesheet"]');
  let stylesHTML = '';
  for (const style of styles) {
    stylesHTML += style.outerHTML;
  }
  printWindow.document.write('<html><head><title>PNR</title>');
  printWindow.document.write('<meta name="viewport" content="width=device-width, initial-scale=1">');
  printWindow.document.write('<style>@media print {* {-webkit-print-color-adjust: exact !important; color-adjust: exact !important; }}</style>');
  printWindow.document.write(stylesHTML);
  printWindow.document.write('</head><body >');
  printWindow.document.write(textToPrint);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

function email_validation (emailID) {
  let email = $('#'+ emailID).val()
  if (email.length > 0) {
    let regex = /^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+)\.([a-z]{2,8})(.[a-z]{2,8})?$/
    if (!regex.test(email)) {
      const message = 'Invalid Email';
      createAlert(message, "red");
      e.preventDefault()
    }
  }
}

async function createAlert(message, color){
  const alert_box = $('.universalAlertboxpopup');
  alert_box.css('display', 'block');
  const alert_box_content = $('.alert_message_box');
  await alert_box_content.html(`<div class="alert_message" role="alert" id="alert_box">
            ${message}
        </div>`);
  $('.alert_message').css('color', color);
}
function closeAlertBox(){
  const alert_box = $('.universalAlertboxpopup');
  alert_box.css('display', 'none');
}

function contactValidation(contactID){
  let contact = $('#'+contactID);
  let input_value = contact.val();
  var sanitizedInput = input_value.replace(/\D/g, '')
    sanitizedInput = sanitizedInput.slice(0, 10)
    contact.val(sanitizedInput);
}

function passwordValidation(passwordID, confirmID){
  let password = $('#'+passwordID).val();
  let confirm = $('#'+confirmID);
  let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z!@#$%^&*()_+])(?!.*\s).{8,20}$/;
  if(password.length > 0){
    if(!regex.test(password)){
      const message = 'Password must contain atleast 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character';
      createAlert(message, "red");
      confirm.prop('disabled', true);
      return false;
    }
    else{
      confirm.prop('disabled', false);
      return true;
    }
  }
  else{
    confirm.prop('disabled', true);
  }
}

function confirmPassword(confirmID, passwordID, buttonID){
  let password = $('#'+passwordID).val();
  let confirm = $('#'+confirmID).val();
  const button = $('#'+buttonID);
  if(confirm !== password){
    button.prop('disabled', true);
  }
  else
  {
    button.prop('disabled', false);
  }
}


function changePassword(){
  const profile = $('.edit_form');
  profile.css('display', 'none');
  const upcomingJourney = $('.upcoming_journey');
  upcomingJourney.css('display', 'none');
  const pastJourney = $('.past_journey');
  pastJourney.css('display', 'none');
  const changePassword = $('.change_password');
  changePassword.css('display', 'block');
}

function changePasswordFormSubmitted(oldPasswordID, newPasswordID, confirmNewPasswordID, e){
  try{
    e.preventDefault();
    const oldPassword = $('#'+oldPasswordID).val();
    const newPassword = $('#'+newPasswordID).val();
    const confirmNewPassword = $('#'+confirmNewPasswordID).val();
    if(newPassword !== confirmNewPassword){
      const message = 'New Password and Confirm Password must be same';
      createAlert(message, 'red');
      return false;
    }
    $.ajax({
      url: '/changePassword',
      method: 'POST',
      data: {oldPassword: oldPassword, newPassword: newPassword},
      success: function(response){
        console.log(response);
        const success_status = response.success;
        if(success_status){
          const message = response.message;
          createAlert(message, 'green');
          setTimeout(function(){
            window.location.href = '/profile';
          }, 5000);
          return;
        }
        else{
          const message = response.message;
          createAlert(message, 'red');
          return;
        }
      },
      error: function(error){
        console.log(error.responseJSON.message);
        createAlert(error.responseJSON.message, 'red');
      }
    });
  }
  catch(error){
    console.log(error);
    createAlert('Server side Error', 'red');
  }
}

function showPassword(inputID, iconID){
  const input = $('#'+inputID);
  const icon = $('#'+iconID);
  if(input.attr('type') == 'password'){
    input.attr('type', 'text');
    icon.addClass('fa-eye-slash');
    icon.removeClass('fa-eye');
  }
  else{
    input.attr('type', 'password');
    icon.addClass('fa-eye');
    icon.removeClass('fa-eye-slash');
  }
}

function editFormSubmitted(imageID, userID, fnameID, lnameID, emailID, contactID, e)
{
  e.preventDefault();
  let image = $('#'+imageID).val();
  let userID_value = $('#'+userID).val().trim();
  let fname = $('#'+fnameID).val().trim();
  let lname = $('#'+lnameID).val().trim();
  let email = $('#'+emailID).val().trim();
  let contact = $('#'+contactID).val().trim();

  console.log(fname+' '+lname+' '+email+' '+contact+' '+userID_value);
  if(fname.length > 0){
    if(!isNaN(fname)){
      window.alert('First Name cannot be a number');
      return false;
    }
  }
  if(lname.length > 0){
    if(!isNaN(lname)){
      window.alert('Last Name cannot be a number');
      return false;
    }
  }
  $.ajax({
    url: '/editprofile',
    method: 'POST',
    data: {userID: userID_value, fname: fname, lname: lname, email: email, contact: contact},
    success: function(response){
      setTimeout(function(){
        window.alert(response);
      }, 5000);
      window.location.href = '/profile';
    },
    error: function(error){
      console.log(error);
      e.preventDefault();
    }
  });
}

function onlyLowerCaseInput(inputID){
  if(inputID ==='newusername')
  {
    $('.usernameAlert').css('display', 'none');
  }
  let input = $('#'+inputID);
  let input_value = input.val();
  var sanitizedInput = input_value.replace(/[^a-z0-9@.]/g, '')
  sanitizedInput = sanitizedInput.slice(0, 25)
  input.val(sanitizedInput);
}

function usernameExistOrNot(inputID){
  const userName = $('#'+inputID).val().trim();
  if(userName.length > 0){
    try{
      $.ajax({
        url: '/usernameExistOrNot',
        method: 'POST',
        data: {username: userName},
        success: function(response){
          const success_status = response.success;
          if(success_status){
            const message = response.message;
            const usernameWarningHTML = `<i class="fa-solid fa-circle-xmark"></i> ${message}`;
            $('.usernameAlert').css('display', 'block');
            $('.usernameAlert').css('color', 'red');
            $('.01usernameAlert').html(usernameWarningHTML);
            return;
          }
          else{
            const message = response.message;
            const usernameWarningHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
            $('.usernameAlert').css('display', 'block');
            $('.usernameAlert').css('color', '#006b3e');
            $('.01usernameAlert').html(usernameWarningHTML);
            return;
          }
        },
        error: function(error){
          console.log(error);
        }
      });
    }
    catch(error){
      console.log(error);
    }
  }
  else{
    $('.usernameAlert').css('display', 'none');
  }
}

function forgotPassword(emailID, e)
{
  e.preventDefault();
  $('.otpSentAnimation').css('display', 'block');
  $('#otpsent').text('Sending OTP...');
  $('#otpsenticon').removeClass('fa-circle-check');
  $('#otpsenticon').addClass('fa-circle-notch fa-spin');
  const userVerificationEmail = $('#'+emailID).val();
  console.log(userVerificationEmail);
  $.ajax(
    {
      url: '/forgotPassword',
      method: 'POST',
      data: {email: userVerificationEmail},
      success: function(response){
        const success_status = response.success;
        console.log(success_status);
        if(success_status===true)
        {
          $('#otpsent').text('OTP Sent');
          $('#otpsenticon').removeClass('fa-circle-notch fa-spin');
          $('#otpsenticon').addClass('fa-circle-check');
          setTimeout(function(){
            $('.otpSentAnimation').css('display', 'none');
            const otpbox = $('.otpPopUp');
            otpbox.css('display', 'block');
            resendTimer();
            $('#blur, #navbar-blur').addClass('blur-background');
          }, 3000);
        }
        else{
          const message = response.message;
          $('.otpSentAnimation').css('display', 'none');
          $('#otpsent').text('Send OTP');
          $('#otpsenticon').removeClass('fa-circle-notch fa-spin');
          $('#otpsenticon').addClass('fa-circle-check');
          createAlert(message, 'red');
          setTimeout(function(){
            window.location.href = '/forgotPassword';
          }, 5000);
          return;
        }
      },
      error: function(error){
        console.log(error);
      }
    }
  );
}

function resendOtp(event){ 
  event.preventDefault();
  const userVerificationEmail = $('#forgot_password_email').val();
  const did_not_received_otp = $('.did_not_received_otp');
  did_not_received_otp.css('display', 'none');
  const Otptimer = $('.Otptimer');
  Otptimer.css('display', 'block');
  $('.timermessage').css('display', 'none');
  $('#sendingotpicon').css('display', 'block');
  $.ajax(
    {
      url: '/forgotPassword',
      method: 'POST',
      data: {email: userVerificationEmail},
      success: function(response){
        const success_status = response.success;
        if(success_status===true)
        {
          $('#sendingotpicon').css('display', 'none');
          $('.otpsentmessage').css('display', 'block');
          setTimeout(function(){
            const otpbox = $('.otpPopUp');
            $('.timermessage').css('display', 'block');
            $('.otpsentmessage').css('display', 'none');
            otpbox.css('display', 'block');
            resendTimer();
          }, 5000);
        }
        else{
          const message = response.message;
          createAlert(message, 'red');
        }
      },
      error: function(error){
        console.log(error);
      }
    }
  );
}

function verifyOtp(emailID, otpClasses, e)
{
  e.preventDefault();
  $('.otpsubmitanimation').css('display', 'block');
  $('#otpsubmiticon').removeClass('fa-circle-check');
  $('#otpsubmiticon').addClass('fa-circle-notch fa-spin');
  const userVerificationEmail = $('#'+emailID).val();
  let userVerificationOtp = '';
  const otparray = $('.' + otpClasses).toArray();
  otparray.forEach(function(otpElement) {
    userVerificationOtp += $(otpElement).val();
  });
  console.log(userVerificationEmail+ "*******" + userVerificationOtp);
  $.ajax(
    {
      url: '/verifyOtp',
      method: 'POST',
      data: {email: userVerificationEmail, otp: userVerificationOtp},
      success: function(response){
        const success_status = response.success;
        if(success_status)
        {
          $('#otpsubmiticon').removeClass('fa-circle-notch fa-spin');
          $('#otpsubmiticon').addClass('fa-circle-check');
          setTimeout(function(){
            $('.otpsubmitanimation').css('display', 'none');
            const otpbox = $('.otpPopUp');
            otpbox.css('display', 'none');
            $('#blur, #navbar-blur').removeClass('blur-background');
            const resetPassword = $('.resetPassword');
            resetPassword.css('display', 'block');
            console.log('OTP verification success');
            window.location.href = `/${response.userID}/resetPassword`;
          }, 2000);
        }
        else{
          $('.otpsubmitanimation').css('display', 'none');
          const message = response.message;
          createAlert(message, 'red');
        }
      },
      error: function(error){
        console.log(error);
      }
    }
  );
}

function resetPassword(passwordID, userID, event)
{
  event.preventDefault();
  const resetNewPassword = $('#'+passwordID).val();
  const userID_value = userID;
  $('.resetPasswordanimation').css('display', 'block');
  $.ajax(
    {
      url: '/resetPassword',
      method: 'POST',
      data: {userID: userID_value, newPassword: resetNewPassword},
      success: function(response){
        const success_status = response.success;
        if(success_status)
        {
          const message = response.message;
          $('#resetSubmitmessage').text(message);
          $('#resetSubmiticon').removeClass('fa-circle-notch fa-spin');
          $('#resetSubmiticon').addClass('fa-circle-check');
          setTimeout(function(){
            $('.resetPasswordanimation').css('display', 'none');
            $('#resetSubmitmessage').text('Setting Password . . . . .');
            $('#resetSubmiticon').removeClass('fa-circle-check');
            $('#resetSubmiticon').addClass('fa-circle-notch fa-spin');
          }, 3000);
          setTimeout(function(){
            window.location.href = '/login';
          }, 1000);
        }
        else{
          const message = response.message;
          createAlert(message, 'red');
        }
      },
      error: function(error){
        console.log(error);
      }
    }
  );

}

function otpKeyPressed(inputID, event) {
  const inputElement = $('#' + inputID);
  const keyDownValue = event.key;
  event.preventDefault();
  // Prevent non-numeric characters and spaces
  if (keyDownValue === 'Backspace') 
  {
    if (inputID === 'digit1') {
      inputElement.val('');
      return;
    } else if(inputID ==='digit6'){
      const dig6 = inputElement.val();
      if(dig6.length==0){
        const previousInputID = 'digit' + (parseInt(inputID.substring(5, 6)) - 1);
        const previousInput = $('#' + previousInputID);
        const prevValue = previousInput.val();
        previousInput.focus();
      } else inputElement.val('');
      return;
    }else{
      const dig = inputElement.val();
      if(dig.length==0){
        const previousInputID = 'digit' + (parseInt(inputID.substring(5, 6)) - 1);
        const previousInput = $('#' + previousInputID);
        const prevValue = previousInput.val();
        previousInput.focus();
      }else inputElement.val('');
      return;
    }
  } else{
    if(!isNaN(keyDownValue) && keyDownValue!==" "){
      const digvalue = inputElement.val();
      if(inputID==='digit6'){
        if(digvalue.length==0){
          inputElement.val(keyDownValue);
          return;
        }else{
          inputElement.val(digvalue.substring(0,1));
          return;
        }
      }else{
        if(digvalue.length==0){
          inputElement.val(keyDownValue);
          return;
        }else{
          inputElement.val(digvalue.substring(0,1));
          const nextInputID = 'digit' + (parseInt(inputID.substring(5, 6)) + 1);
          const nextInput = $('#' + nextInputID);
          nextInput.focus();
          return;
        }
      }
    }else{
      if(keyDownValue!=='Enter'){
        inputElement.val('');
      }
      else{
        if(inputID=='digit6' && keyDownValue==='Enter')
        {
          const form = $('.otpInputForm');
          form.submit();
        }
      }
      return;
    }
    return;
  }
}


function keyDown(inputID, event){
  const key = event.key;
  if((isNaN(key) || key===" ") && key!=='Backspace') event.preventDefault();
}

function resendTimer()
{
  const timerDuration = 60
  let timer = timerDuration
  const timerElement = $('#timer')
  $('.timermessage').css('display', 'block')
  $('.otpsentmessage').css('display', 'none')
  
  function updateTimer() {
    timerElement.text(timer + ' seconds')
    timer--

    if (timer < 0) {
      clearInterval(timerInterval)
      const otptime = $('.Otptimer')
      timerElement.text('')
      timer = timerDuration
      otptime.css('display', 'none')
      const resendotpdiv = $('.did_not_received_otp')
      resendotpdiv.css('display', 'block')
      return
    }
  }
  const timerInterval = setInterval(function () {
    updateTimer()
  }, 1000)
}


function home (e) {
  window.location.href = '/'
}

function logout (e) {
  window.location.href = '/logout'
}


function arrowDownIconClicked(tbodyID, iconclass, event)
{
  const downicon = $('.'+ iconclass);
  downicon.toggleClass('rotateDownIcon');
  const tableBody = $('#'+ tbodyID);
  if(tableBody.css('display')==='none')
  {
    tableBody.css('display', 'contents');
  }
  else
  {
    tableBody.css('display', 'none');
  }
}

