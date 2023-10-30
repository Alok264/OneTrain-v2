"use strict";

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

var GoogleStrategy = require("passport-google-oauth20").Strategy;

var FacebookStrategy = require("passport-facebook").Strategy;

var findOrCreate = require("mongoose-findorcreate");

var _require2 = require('child_process'),
    spawn = _require2.spawn;

var app = express();
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
  contactInfo: String,
  username: String,
  userPNR: [String]
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
var pnr = 1;
var alert = "";
var PassengerPNR = [];
var TBWS_trains = [];
var trainInfo = [];
var logedIn;
var userWarning;
var notFoundWarning;
var userLoginWarning;
var searchTrains = [];
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
  res.render('stationInfo');
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
    email: req.body.username
  }).then(function (user) {
    if (user) {
      userWarning = "";
      var existUser = new User({
        email: req.body.username,
        password: req.body.password
      });
      req.login(existUser, function (err) {
        if (err) {
          console.log(err);
          res.redirect('/login');
        } else {
          passport.authenticate("local")(req, res, function () {
            logedIn = true;
            res.redirect('/');
          });
        }
      });
    } else {
      userLoginWarning = "This Email Address is not registered. Please Sign Up or use registered email address.";
      res.redirect('/login');
    }
  })["catch"](function (err) {
    return console.log(err);
  });
});
app.post('/signup', function (req, res) {
  User.findOne({
    email: req.body.username
  }).then(function (user) {
    if (user) {
      userWarning = "This Email Address is already registered. Please Login or use another email address.";
      res.redirect('/signup');
    } else {
      userWarning = "";
      User.register({
        username: req.body.username,
        email: req.body.username,
        last_name: req.body.last_name,
        first_name: req.body.first_name
      }, req.body.password, function (err, user) {
        if (err) {
          console.log(err);
          res.redirect('/signup');
        } else {
          passport.authenticate("local")(req, res, function () {
            logedIn = true;
            res.redirect('/');
          });
        }
      });
    }
  })["catch"](function (err) {
    console.log(err);
  });
});

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