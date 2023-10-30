"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//jshint esversion:6
require("dotenv").config();

var express = require("express");

var bodyParser = require("body-parser");

var ejs = require("ejs");

var https = require("https");

var axios = require("axios");

var lodash = require("lodash");

var mongoose = require("mongoose");

var _require = require('mongodb'),
    MongoClient = _require.MongoClient,
    ServerApiVersion = _require.ServerApiVersion;

var passport = require("passport");

var session = require("express-session");

var passportLM = require("passport-local-mongoose");

var passportL = require("passport-local");

var cookieParser = require('cookie-parser'); // date added 17/10/2023


var nodemailer = require('nodemailer');

var GoogleStrategy = require("passport-google-oauth20").Strategy;

var FacebookStrategy = require("passport-facebook").Strategy;

var bcrypt = require("bcrypt");

var findOrCreate = require("mongoose-findorcreate");

var saltRound = 15;

var _require2 = require('child_process'),
    spawn = _require2.spawn;

var app = express();

var fs = require('fs');

var mysql = require('mysql2');

var _require3 = require('path'),
    resolve = _require3.resolve;

var _require4 = require('assert'),
    rejects = _require4.rejects;

app.set('view engine', 'ejs');
app.use(express["static"](__dirname + "/public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000
  }
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.set('strictQuery', false);

var connectDB = function connectDB() {
  var conn;
  return regeneratorRuntime.async(function connectDB$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }));

        case 3:
          conn = _context.sent;
          console.log("MongoDB Connected: ".concat(conn.connection.host));
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          process.exit(1);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

var pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
connectDB().then(function () {
  app.listen(process.env.PORT || 12331, function () {
    console.log("listening for requests on port 12331 or other port");
  });
});
var StationSchema = new mongoose.Schema({
  A: String,
  B: String
});
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minLength: 8
  },
  first_name: String,
  last_name: String,
  googleId: String,
  facebookId: String,
  photo: String,
  contact_no: {
    type: String,
    maxlength: 10,
    minlength: 10,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  OtpVerifyCode: {
    otp: String,
    time: Date
  },
  user_trip: [{
    pnr: {
      type: String,
      unique: true,
      maxlength: 10,
      minlength: 10
    },
    train_number: String,
    train_name: String,
    source: String,
    destination: String,
    date: Date,
    "class": String,
    count: Number
  }]
});
var TrainSchema = new mongoose.Schema({
  trainNo: String,
  trainName: String
});
var IndianTrains = new mongoose.Schema({
  trainName: String,
  trainDetails: String,
  trainImage: [String]
});
userSchema.plugin(passportLM);
userSchema.plugin(findOrCreate);
var stationList = new mongoose.model('list', StationSchema);
var User = new mongoose.model('user', userSchema);
var Train = new mongoose.model('train', TrainSchema);
var IndianTrain = new mongoose.model('indiantrain', IndianTrains);
var pnr = 1;
var alert = '';
var PassengerPNR = [];
var TBWS_trains = [];
var trainInfo = [];
var logedIn;
var userWarning;
var notFoundWarning;
var userLoginWarning;
var trainList;
var stationInformation;
var stationSearchError;
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  User.findById(id).then(function (user) {
    done(null, user);
  })["catch"](function (err) {
    return console.log(err);
  });
});
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, function (accessToken, refreshToken, profile, cb) {
  User.findOne({
    googleId: profile.id
  }).then(function (currentUser) {
    if (currentUser) {
      User.updateOne({
        googleId: profile.id
      }, {
        $set: {
          username: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value
        }
      });
      return cb(null, currentUser);
    } else {
      var newUser = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName
      });
      newUser.save().then(function () {
        return cb(null, newUser);
      })["catch"](function (err) {
        cb(err);
      });
    }
  });
}));
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name']
}, function (accessToken, refreshToken, profile, cb) {
  User.findOne({
    facebookId: profile.id
  }).then(function (founduser) {
    if (founduser) {
      User.updateOne({
        facebookId: profile.id
      }, {
        $set: {
          email: profile.emails[0].vaalue,
          username: profile.displayName
        }
      }); // update the email and username

      return cb(null, founduser);
    } else {
      var newUser = new User({
        facebookId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        photo: profile.photos[0].value,
        first_name: profile._json.first_name,
        last_name: profile._json.last_name
      });
      newUser.save().then(function () {
        return cb(null, newUser);
      })["catch"](function (err) {
        cb(err);
      });
    }
  })["catch"](function (err) {
    cb(err);
  });
}));
app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    logedIn = true;
  }

  res.render("home");
});
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));
app.get('/auth/google/OneTrain', passport.authenticate('google', {
  failureRedirect: '/singup'
}), function (req, res) {
  res.redirect('/');
});
app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email'],
  authType: 'reauthenticate',
  prompt: 'select_account'
}));
app.get('/auth/facebook/OneTrain', passport.authenticate('facebook', {
  failureRedirect: '/signup'
}), function (req, res) {
  res.redirect('/');
});
app.get("/pnr-status", function (req, res) {
  if (req.isAuthenticated()) {
    res.render('PNR', {
      alert: alert
    });
    alert = "";
  } else {
    res.redirect('/login');
  }
});
app.get("/pnr-check/:pnr", function (req, res) {
  res.render("Check", {
    response: PassengerPNR
  });
});
app.get('/TBWS', function (req, res) {
  res.render('TBWS');
});
app.get('/TBWS/:from/:to', function (req, res) {
  res.render('TBWSoutput', {
    source: lodash.upperCase(req.params.from),
    destination: lodash.upperCase(req.params.to),
    docs: TBWS_trains
  });
});
app.get('/train-info', function (req, res) {
  res.render('trainInfo', {
    trainNo: null,
    response: null
  });
});
app.get('/train-info/:train', function (req, res) {
  res.render('trainInfoOutput');
});
app.get('/running-status', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('runningStatus');
  } else {
    res.redirect('/login');
  }
});
app.get('/station-info', function (req, res) {
  res.render('stationInfo', {
    stationSearchError: stationSearchError
  });
});
app.get('/fare', function (req, res) {
  res.render('fareCal');
});
app.get('/ticket-avail', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('TicketAvailability');
  } else {
    res.redirect('/login');
  }
});
app.get('/emergency', function (req, res) {
  res.render('Emergency');
});
app.get('/login', function (req, res) {
  res.render('login', {
    userLoginWarning: userLoginWarning
  });
  userLoginWarning = "";
});
app.get('/signup', function (req, res) {
  res.render('signup', {
    userWarning: userWarning
  });
  userWarning = "";
});
app.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) console.log(err);
  });
  logedIn = false;
  res.redirect('/');
});
app.get('/isLogedIn', function (req, res) {
  if (logedIn === true) {
    var userId = req.user.id;
    User.findById(userId).then(function (foundUser) {
      if (foundUser) {
        var username = foundUser.first_name + " " + foundUser.last_name;
        var photourl = foundUser.photo;
        logedIn = true;
        res.json({
          logedIn: logedIn,
          username: username,
          photourl: photourl
        });
      }
    })["catch"](function (err) {
      return console.log(err);
    });
  } else {
    res.json({
      logedIn: logedIn
    });
  }
});
app.get('/forgotPassword', function (req, res) {
  res.render('forgotPassword', {
    notFoundWarning: notFoundWarning
  });
  notFoundWarning = "";
});
app.get('/profile', function (req, res) {
  if (req.isAuthenticated()) {
    var userId = req.user.id;
    User.findById(userId).then(function (foundUser) {
      if (foundUser) {
        res.render('profile', {
          user: foundUser
        });
      }
    })["catch"](function (err) {
      return console.log(err);
    });
  } else {
    res.redirect('/login');
  }
});
app.get('/chat', function (req, res) {
  var userMessage = req.query.userMessage;
  var chat_process = spawn('python', ['./public/Chatbot/chat.py', userMessage]);
  var error = false;
  var output = "";
  chat_process.stdout.on('data', function (data) {
    output = data;
  });
  chat_process.stderr.on('data', function (data) {
    console.log("error ".concat(data));
    error = true;
  });
  chat_process.on('close', function (code) {
    console.log("child process exited with code ".concat(code));

    if (error) {
      res.send("There is some error in the chatbot. Please try again later.");
    } else {
      res.send(output);
    }
  });
});
app.get('/service-not-available', function (req, res) {
  res.render('notAvailable');
});
app.get('/:userID/resetPassword', function (req, res) {
  res.render('resetPassword', {
    userID: req.params.userID
  });
});
app.get('/stationSearchInfo', function (req, res) {
  console.log(stationInformation);
  res.render('stationSearchInfo', {
    stationInformation: stationInformation,
    trainFromStation: trainList
  });
});
app.post("/pnr-status", function (req, res) {
  var userID = req.user.id;
  pnr = req.body.pnrcheck;
  var options = {
    method: 'GET',
    url: 'https://irctc1.p.rapidapi.com/api/v3/getPNRStatus',
    params: {
      pnrNumber: pnr
    },
    headers: {
      'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
      'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
  };
  axios.request(options).then(function (response) {
    if (response.data.data.TrainNo === null) {
      alert = "Not A valid PNR";
      res.redirect("/pnr-status");
    } else {
      User.findById(userID).then(function (foundUser) {
        if (foundUser) {
          foundUser.userPNR.push(pnr);
          foundUser.save();
        }
      })["catch"](function (err) {
        return console.log(err);
      });
      alert = "";
      PassengerPNR = response.data.data;
      res.redirect("/pnr-check/".concat(pnr));
    }
  })["catch"](function (error) {
    console.error(error);
  });
});
app.post("/TBWS", function (req, res) {
  var source = req.body.Source;
  var sourceArr = source.split('-');
  var sourceStation = lodash.lowerCase(sourceArr[1]);
  var destination = req.body.Destination;
  var destinationArr = destination.split('-');
  var destinationStation = lodash.lowerCase(destinationArr[1]);
  var date = req.body.Date;
  TBWSAPIoutput(res, sourceStation, destinationStation, date);
});
app.post('/TBWS/:from/:to', function (req, res) {
  var source = lodash.lowerCase(req.body.Source);
  var destination = lodash.lowerCase(req.body.Destination);
  TBWSAPIoutput(res, source, destination);
});
app.get("/", function (req, res) {
  res.render("home", {
    docs: docsget
  });
});
app.post('/station-search', function (req, res) {
  var value = req.body.input;

  if (value) {
    stationList.aggregate([{
      $match: {
        $or: [{
          "B": {
            $regex: new RegExp("^".concat(value, ".*"), "i")
          }
        }, {
          "A": {
            $regex: new RegExp("^".concat(value, ".*"), "i")
          }
        }]
      }
    }, {
      $addFields: {
        priority: {
          $cond: {
            "if": {
              $eq: ["$B", value]
            },
            then: 1,
            "else": 2
          }
        }
      }
    }, {
      $sort: {
        priority: 1
      }
    }]).then(function (docs) {
      res.send(docs.slice(0, 6));
    })["catch"](function (err) {
      console.log(err);
      res.status(500).send("An error occurred");
    });
  } else {
    res.send([]);
  }
});
app.post('/train-search', function (req, res) {
  var value = req.body.input;

  if (value) {
    Train.aggregate([{
      $match: {
        $or: [{
          "trainNo": {
            $regex: new RegExp("^".concat(value, ".*"), "i")
          }
        }, {
          "trainName": {
            $regex: new RegExp("^".concat(value, ".*"), "i")
          }
        }]
      }
    }, {
      $addFields: {
        priority: {
          $cond: {
            "if": {
              $eq: ["$trainNo", value]
            },
            then: 1,
            "else": 2
          }
        }
      }
    }, {
      $sort: {
        priority: 1
      }
    }]).then(function (docs) {
      docs.sort(function (a, b) {
        return parseInt(a.trainNo) - parseInt(b.trainNo);
      });
      res.send(docs.slice(0, 8));
    })["catch"](function (err) {
      console.log(err);
      res.status(500).send("An error occurred");
    });
  } else {
    res.send([]);
  }
});
app.post('/train-info', function (req, res) {
  var trainNo = req.body.trainNo;
  TrainInfoAPIoutput(res, trainNo).then(function (trainInfoArray) {
    res.send({
      trainInfoArray: trainInfoArray,
      trainNo: trainNo
    });
  })["catch"](function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});
app.post('/login', function (req, res) {
  User.findOne({
    email: lodash.toLower(req.body.username)
  }).then(function (user) {
    if (user) {
      if (user.googleId) {
        userLoginWarning = 'This Email Address is registered with Google. Please Login with Google.';
        res.redirect('/login');
      } else if (user.facebookId) {
        userLoginWarning = 'This Email Address is registered with Facebook. Please Login with Facebook.';
        res.redirect('/login');
      } else {
        userWarning = '';
        var existUser = new User({
          email: lodash.toLower(req.body.username),
          password: req.body.password
        });
        var rememberMe = req.body.rememberMe;
        req.login(existUser, function (err) {
          if (err) {
            console.log(err);
            res.redirect('/login');
          } else {
            passport.authenticate('local')(req, res, function () {
              logedIn = true;
              res.redirect('/');
            });

            if (rememberMe === 'on') {
              req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
              req.session.cookie.expires = false;
            }
          }
        });
      }
    } else {
      userLoginWarning = 'This Email Address is not registered. Please Sign Up or use registered email address.';
      res.redirect('/login');
    }
  })["catch"](function (err) {
    return console.log(err);
  }); // find user in database
});
app.post('/signup', function (req, res) {
  User.findOne({
    email: lodash.toLower(req.body.username)
  }).then(function (user) {
    if (user) {
      userWarning = 'This Email Address is already registered. Please Login or use another email address.';
      res.redirect('/signup');
    } else {
      userWarning = '';
      User.register({
        username: lodash.toLower(req.body.username),
        email: lodash.toLower(req.body.username),
        last_name: lodash.upperFirst(lodash.toLower(req.body.last_name)),
        first_name: lodash.upperFirst(lodash.toLower(req.body.first_name))
      }, req.body.password, function (err, user) {
        if (err) {
          console.log(err);
          res.redirect('/signup');
        } else {
          passport.authenticate('local')(req, res, function () {
            logedIn = true;
            res.redirect('/');
          });
        }
      });
    }
  })["catch"](function (err) {
    console.log(err);
  }); // must give a unique username and also write username: req.body.username. This is must. and also, write req.body.password remember password must include
});
app.post('/editprofile', function (req, res) {
  var userId = req.user.id;
  var newFirstName = req.body.fname;
  var newLastName = req.body.lname;
  var newContact = req.body.contact;
  var userName = req.body.userID;
  var userEmail = req.body.email;
  User.findById(userId).then(function (foundUser) {
    if (foundUser) {
      var foundUserWithUserEmail = null;
      var foundUserWithUserName = null;

      if (foundUser.email !== userEmail) {
        foundUserWithUserEmail = User.findOne({
          email: userEmail
        });
      }

      if (foundUser.username !== userName) {
        foundUserWithUserName = User.findOne({
          username: userName
        });
      }

      if (foundUserWithUserName) {
        var warning = 'This username is already taken. Please try another.';
        res.send(warning);
      } else if (foundUserWithUserEmail) {
        var _warning = 'This email is already taken. Please try another.';
        res.send(_warning);
      }

      var success = 'Profile Updated Successfully.';
      foundUser.first_name = newFirstName;
      foundUser.last_name = newLastName;
      foundUser.contact_no = newContact;
      foundUser.username = userName;
      foundUser.save();
      res.send(success);
    }
  })["catch"](function (err) {
    return console.log(err);
  });
});

function generateOTP() {
  var digits = '123456789';
  var OTP = digits[Math.floor(Math.random() * 9)];
  digits = '0123456789';

  for (var i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
}

function sendEmail(senderEmail, Message, receiverEmail, subject, anyhtml) {
  return new Promise(function (resolve, reject) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.COMPANY_ID,
        pass: process.env.APP_PASSWORD
      }
    });
    var mailOptions = {
      from: senderEmail,
      to: receiverEmail,
      subject: subject,
      text: Message,
      html: anyhtml
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        reject(false); // Email sending failed, reject the promise with false
      } else {
        console.log("Email sent: " + info.response);
        resolve(true); // Email sent successfully, resolve the promise with true
      }
    });
  });
}

function getCurrentTime(time) {
  var x = new Date();
  x.get;
  var hour = time.getHours();
  var minute = time.getMinutes();
  var second = time.getSeconds();
  var date = time.getDate();
  var month = time.getMonth();
  var year = time.getFullYear();
  var currentTime = hour + ' : ' + minute + ' : ' + second;
  var Todaydate = date + '/' + month + '/' + year;
  return {
    currentTime: currentTime,
    Todaydate: Todaydate
  };
}

app.post('/forgotPassword', function (req, res) {
  var userEmail = req.body.email;
  User.findOne({
    email: userEmail
  }).then(function (foundUser) {
    if (foundUser) {
      var otp = generateOTP();
      foundUser.OtpVerifyCode.otp = bcrypt.hashSync(otp, saltRound);
      foundUser.OtpVerifyCode.time = new Date();
      foundUser.save();
      var time = getCurrentTime(new Date());
      var html = "<h1>OneTrain</h1><br><h2>Your ONE TRAIN account OTP for password reset is  ".concat(otp, " , and valid for only 10 minutes. \n\n\n      (Generated at ").concat(time.Todaydate, "  ").concat(time.currentTime, ") \n\n ********************************** \n This is an auto-generated email. Do not reply to this email.</h2>");
      var subject = "OTP for password reset";
      var senderEmail = process.env.COMPANY_ID;
      var receiverEmail = userEmail;
      var message = "";
      var emailSent = sendEmail(senderEmail, message, receiverEmail, subject, html);
      emailSent.then(function (success) {
        if (success) {
          res.send({
            success: true,
            message: "Email sent successfully"
          });
        } else {
          res.send({
            success: false,
            message: "Email could not be sent. Please check your Email and try Again"
          });
        }
      })["catch"](function (error) {
        console.error(error);
        res.send({
          success: false,
          message: "Email could not be sent due to an error. Please try again later."
        });
      });
    } else {
      res.send({
        success: false,
        message: "This email address is not registered. Please try another."
      });
    }
  });
});
app.post('/verifyOtp', function (req, res) {
  var userEmail = req.body.email;
  var otp = req.body.otp;
  console.log(otp + " ***** " + _typeof(otp) + ' **** ' + userEmail);
  User.findOne({
    email: userEmail
  }).then(function (foundUser) {
    if (foundUser) {
      var otpString = otp.toString();
      var hashedOTPString = foundUser.OtpVerifyCode.otp.toString();
      var time = new Date();
      var savedTime = foundUser.OtpVerifyCode.time;

      if (time.getTime() - savedTime.getTime() > 600000) {
        res.send({
          success: false,
          message: "OTP is expired. Please try again."
        });
      }

      bcrypt.compare(otpString, hashedOTPString).then(function (result) {
        if (result) {
          res.send({
            success: true,
            message: "OTP is verified successfully",
            userID: foundUser._id
          });
        } else {
          res.send({
            success: false,
            message: "OTP is incorrect. Please try again."
          });
        }
      })["catch"](function (err) {
        return console.log(err);
      });
    } else {
      res.send({
        success: false,
        message: "This email address is not registered. Please try another."
      });
    }
  });
});
app.post('/resetPassword', function _callee(req, res) {
  var userID, newPassword, foundUser;
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          userID = req.body.userID;
          newPassword = req.body.newPassword;
          _context2.prev = 2;
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findById(userID));

        case 5:
          foundUser = _context2.sent;

          if (!foundUser) {
            _context2.next = 14;
            break;
          }

          _context2.next = 9;
          return regeneratorRuntime.awrap(foundUser.setPassword(newPassword));

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(foundUser.save());

        case 11:
          res.send({
            success: true,
            message: "Password reset successfully."
          });
          _context2.next = 15;
          break;

        case 14:
          res.send({
            success: false,
            message: "User not found."
          });

        case 15:
          _context2.next = 21;
          break;

        case 17:
          _context2.prev = 17;
          _context2.t0 = _context2["catch"](2);
          console.error(_context2.t0);
          res.status(500).send({
            success: false,
            message: "Internal server error."
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 17]]);
});
var promisePool = pool.promise();
app.post('/stationSearchInfo', function _callee2(req, res) {
  var stationName, stationNameArr, stationCode, _ref, _ref2, rows, fields;

  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          stationName = req.body.station_info_input;
          stationNameArr = stationName.split('-');
          stationCode = lodash.lowerCase(stationNameArr[1]).trim();
          _context3.prev = 3;
          _context3.next = 6;
          return regeneratorRuntime.awrap(promisePool.execute('SELECT * FROM stations_info WHERE station_code = ?', [stationCode]));

        case 6:
          _ref = _context3.sent;
          _ref2 = _slicedToArray(_ref, 2);
          rows = _ref2[0];
          fields = _ref2[1];
          // console.log('Query Results:', rows); // send javascript object to the client
          stationInformation = rows;
          stationInfo(res, req, rows, stationCode);
          _context3.next = 19;
          break;

        case 14:
          _context3.prev = 14;
          _context3.t0 = _context3["catch"](3);
          console.error('Error executing query:', _context3.t0);
          stationSearchError = "500 Server Error";
          res.redirect('/station-info');

        case 19:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[3, 14]]);
});

function stationInfo(res, req, rows, stationCode) {
  var options = {
    method: 'GET',
    url: 'https://irctc1.p.rapidapi.com/api/v3/getTrainsByStation',
    params: {
      stationCode: stationCode
    },
    headers: {
      'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
      'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
  };
  var response = axios.request(options).then(function (response) {
    trainList = response.data.data;
    stationSearchError = '';
    res.redirect('/stationSearchInfo');
  })["catch"](function (error) {
    console.error(error);
    stationSearchError = "500 Server Error";
    res.redirect('/station-info');
  });
}

function TBWSAPIoutput(res, source, destination, date) {
  var options = {
    method: 'GET',
    url: 'https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations',
    params: {
      fromStationCode: source,
      toStationCode: destination,
      dateOfJourney: date
    },
    headers: {
      'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
      'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
  };
  axios.request(options).then(function (response) {
    TBWS_trains = response.data.data;
    res.redirect("/TBWS/".concat(source, "/").concat(destination));
  })["catch"](function (error) {
    console.error(error);
  });
}

;

function TrainInfoAPIoutput(res, train_number) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: 'GET',
      url: 'https://irctc1.p.rapidapi.com/api/v1/getTrainSchedule',
      params: {
        trainNo: train_number
      },
      headers: {
        'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    };
    axios.request(options).then(function (response) {
      var trainInfo = response.data.data;
      resolve(trainInfo);
    })["catch"](function (error) {
      console.error(error);
      reject(error);
    });
  });
}

function TrainFindByNumberAPI(res, train_number) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: 'GET',
      url: 'https://irctc1.p.rapidapi.com/api/v1/searchTrain',
      params: {
        query: train_number
      },
      headers: {
        'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    };
    axios.request(options).then(function (response) {
      var trainInfo = response.data.data;
      resolve(trainInfo);
    })["catch"](function (error) {
      console.error(error);
      reject(error);
    });
  });
}