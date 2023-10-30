//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const https = require("https");
const axios = require("axios");
const lodash = require("lodash");
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const passport = require("passport");
const session = require("express-session");
const passportLM = require("passport-local-mongoose");
const passportL = require("passport-local");
const cookieParser  = require('cookie-parser') // date added 17/10/2023
const nodemailer = require('nodemailer');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcrypt");
const findOrCreate = require("mongoose-findorcreate");
const saltRound = 15;
const { spawn } = require('child_process');
const app = express();
const fs = require('fs')
const mysql = require('mysql2');
const { resolve } = require('path');
const { rejects } = require('assert');

app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended: true}));
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
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

connectDB().then(() => { 
  app.listen(process.env.PORT || 12331, () => {
    console.log("listening for requests on port 12331 or other port");
  });
});

const StationSchema = new mongoose.Schema({
  A: String,
  B: String
});
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, minLength: 8},
  first_name: String,
  last_name: String,
  googleId: String,
  facebookId: String,
  photo: String,
  contact_no: {type:String, maxlength: 10, minlength: 10, unique: true},
  username: {type: String, unique: true},
  OtpVerifyCode: {otp: String, time: Date},
  user_trip: [{
    pnr: {type: String, unique: true, maxlength: 10, minlength: 10},
    train_number: String,
    train_name: String,
    source: String,
    destination: String,
    date: Date,
    class: String,
    count: Number,
  }]
})
const TrainSchema = new mongoose.Schema({
  trainNo: String,
  trainName: String,
});
const IndianTrains = new mongoose.Schema({
  trainName: String,
  trainDetails: String,
  trainImage: [String]
});

userSchema.plugin(passportLM);
userSchema.plugin(findOrCreate);

const stationList = new mongoose.model('list', StationSchema);
const User = new mongoose.model('user', userSchema);
const Train = new mongoose.model('train', TrainSchema);
const IndianTrain = new mongoose.model('indiantrain', IndianTrains)

let pnr = 1
let alert = ''
let PassengerPNR = []
let TBWS_trains = []
let trainInfo = []
let logedIn
let userWarning
let notFoundWarning
let userLoginWarning
let trainList
let stationInformation
let stationSearchError

passport.use(User.createStrategy());  
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(id, done){
  User.findById(id).then(function(user){
    done(null, user);
  }).catch((err)=> console.log(err));
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOne({googleId: profile.id}).then((currentUser)=>{
    if(currentUser){
      User.updateOne({googleId: profile.id}, {$set: {username: profile.displayName, email: profile.emails[0].value, photo: profile.photos[0].value}})
      return cb(null, currentUser);
    }
    else
    {
      const newUser = new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
        });
        newUser.save().then(() => {
            return cb(null, newUser);
        }).catch((err) => {
            cb(err);
        });
    }
  })
}
));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'photos', 'email', 'first_name', 'last_name'],
},
 function(accessToken, refreshToken, profile, cb) {
    User.findOne({ facebookId: profile.id }).then((founduser) => {
        if (founduser) {
          User.updateOne({facebookId: profile.id}, {$set: {email:profile.emails[0].vaalue, username: profile.displayName}}); // update the email and username
          return cb(null, founduser);
        } else {
            const newUser = new User({
              facebookId: profile.id,
              email: profile.emails[0].value,
              username: profile.displayName,
              photo: profile.photos[0].value,
              first_name: profile._json.first_name,
              last_name: profile._json.last_name,
          });
          newUser.save().then(() => {
              return cb(null, newUser);
          }).catch((err) => {
              cb(err);
          });
        }
      }).catch((err) => { cb(err); });
    }
));


app.get("/", function(req, res){
  if(req.isAuthenticated())
  {
    logedIn = true;
  }
  res.render("home");
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account'}));
app.get('/auth/google/OneTrain', passport.authenticate('google', { failureRedirect: '/singup' }), function(req, res) {
   
    res.redirect('/');
  });

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'], authType: 'reauthenticate', prompt: 'select_account' }));

app.get('/auth/facebook/OneTrain',
  passport.authenticate('facebook', { failureRedirect: '/signup' }),
  function(req, res) {
    res.redirect('/');
  });


app.get("/pnr-status", (req, res)=>{
  if(req.isAuthenticated())
    {
      res.render('PNR', {alert: alert});
      alert = "";
    }
    else
    {
        res.redirect('/login');
    }
})

app.get("/pnr-check/:pnr", (req, res)=>{
  res.render("Check", {
    response: PassengerPNR
  });
})

app.get('/TBWS', function(req, res){
  res.render('TBWS');
})

app.get('/TBWS/:from/:to', (req, res)=>{
  res.render('TBWSoutput', {source: lodash.upperCase(req.params.from), destination: lodash.upperCase(req.params.to), docs: TBWS_trains});
})

app.get('/train-info', (req, res)=> {
  res.render('trainInfo', {trainNo: null, response: null});
})

app.get('/train-info/:train', (req, res)=> {
  res.render('trainInfoOutput');
})

app.get('/running-status', (req, res)=> {
  if(req.isAuthenticated())
  {
    res.render('runningStatus');
  }
  else
  {
    res.redirect('/login');
  }
})

app.get('/station-info', (req, res)=>{
    res.render('stationInfo', {stationSearchError: stationSearchError});
})

app.get('/fare', (req, res)=>{
  res.render('fareCal');
})

app.get('/ticket-avail', (req, res)=>{
  if(req.isAuthenticated())
  {
    res.render('TicketAvailability');
  }
  else
  {
    res.redirect('/login');
  }
})

app.get('/emergency', (req, res)=>{
  res.render('Emergency');
})

app.get('/login', (req, res)=>{
  res.render('login', {userLoginWarning: userLoginWarning});
  userLoginWarning = "";
})

app.get('/signup', (req, res)=>{
  res.render('signup', {userWarning: userWarning});
  userWarning = "";
});


app.get('/logout', (req, res)=> {
  req.logout((err)=> {
        if(err)
            console.log(err);
    });
    logedIn = false;
    res.redirect('/');
})

app.get('/isLogedIn', (req, res)=> {
  if(logedIn===true)
  {
    const userId = req.user.id;
    User.findById(userId).then((foundUser)=>{
      if(foundUser)
      {
        const username = foundUser.first_name + " " + foundUser.last_name;
        const photourl = foundUser.photo;
        logedIn = true;
        res.json({logedIn: logedIn, username: username, photourl: photourl});
      }
    }).catch((err)=> console.log(err));
  }
  else
  {
    res.json({logedIn: logedIn});
  }
});

app.get('/forgotPassword', (req, res)=>{
  res.render('forgotPassword', {notFoundWarning: notFoundWarning});
  notFoundWarning = "";
});

app.get('/profile', (req, res)=>{
  if(req.isAuthenticated())
  {
    const userId = req.user.id;
    User.findById(userId).then((foundUser)=>{
      if(foundUser)
      {
        res.render('profile', {user: foundUser});
      }
    }).catch((err)=> console.log(err));
  }
  else
  {
    res.redirect('/login');
  }
});

app.get('/chat', (req, res) => {
  let userMessage = req.query.userMessage;
  const chat_process = spawn('python', ['./public/Chatbot/chat.py', userMessage]);
  let error = false;
  let output = "";
  chat_process.stdout.on('data', (data) => {
    output = data;
  });
  chat_process.stderr.on('data', (data) => {
    console.log(`error ${data}`);
    error = true;
  });
  chat_process.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if(error) {
      res.send("There is some error in the chatbot. Please try again later.");
    } else {
      res.send(output);
    }
  });
})

app.get('/service-not-available', (req, res) => {
  res.render('notAvailable');
})

app.get('/:userID/resetPassword', (req, res) => {
  res.render('resetPassword', { userID: req.params.userID });
})

app.get('/stationSearchInfo', (req, res) => {
  console.log(stationInformation);
  res.render('stationSearchInfo', {stationInformation: stationInformation, trainFromStation: trainList});
});


app.post("/pnr-status", (req, res) =>
{
    const userID = req.user.id;
    pnr = req.body.pnrcheck;
    const options = {
      method: 'GET',
      url: 'https://irctc1.p.rapidapi.com/api/v3/getPNRStatus',
      params: {pnrNumber: pnr},
      headers: {
        'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    };

    axios.request(options).then(function (response) 
    {
      if(response.data.data.TrainNo === null)
      {
        alert = "Not A valid PNR";
        res.redirect("/pnr-status");
      }
      else
      {
        User.findById(userID).then((foundUser)=>{
          if(foundUser)
          {
            foundUser.userPNR.push(pnr);
            foundUser.save();
          }
        }).catch((err)=> console.log(err));
        alert = "";
        PassengerPNR = response.data.data;
        res.redirect(`/pnr-check/${pnr}`);
      }
    }).catch(function (error) 
    {
      console.error(error);
    });
  
})

app.post("/TBWS", function(req, res){
  let source = (req.body.Source);
  const sourceArr = source.split('-');
  const sourceStation = lodash.lowerCase(sourceArr[1]);
  let destination = (req.body.Destination);
  const destinationArr = destination.split('-');
  const destinationStation = lodash.lowerCase(destinationArr[1]);
  let date = req.body.Date;
  TBWSAPIoutput(res, sourceStation, destinationStation, date);
})

app.post('/TBWS/:from/:to', (req, res)=>{
  let source = lodash.lowerCase(req.body.Source);
  let destination = lodash.lowerCase(req.body.Destination);
  TBWSAPIoutput(res, source, destination);
})

app.get("/", function(req, res){
  res.render("home", {docs: docsget});
});

app.post('/station-search', (req, res) => {
  const value = req.body.input;
  if (value) {
    stationList.aggregate([
      {
        $match: {
          $or: [
            { "B": { $regex: new RegExp(`^${value}.*`, "i") } },
            { "A": { $regex: new RegExp(`^${value}.*`, "i") } }
          ]
        }
      },
      {
        $addFields: {
          priority: {
            $cond: {
              if: { $eq: ["$B", value] },
              then: 1,
              else: 2
            }
          }
        }
      },
      {
        $sort: { priority: 1 }
      }
    ]).then(function (docs) {
      res.send(docs.slice(0, 6));
    }).catch(function (err) {
      console.log(err);
      res.status(500).send("An error occurred");
    });
  } else {
    res.send([]);
  }
});


app.post('/train-search', function (req, res) {
  const value = req.body.input;
  if(value)
  {
    Train.aggregate([
      {
        $match: {
          $or: [
            { "trainNo": { $regex: new RegExp(`^${value}.*`, "i") } },
            { "trainName": { $regex: new RegExp(`^${value}.*`, "i") } }
          ]
        }
      },
      {
        $addFields: {
          priority: {
            $cond: {
              if: { $eq: ["$trainNo", value] },
              then: 1,
              else: 2
            }
          }
        }
      },
      {
        $sort: { priority: 1 }
      }
    ]).then(function (docs) {
      docs.sort((a, b) => parseInt(a.trainNo) - parseInt(b.trainNo));
      res.send(docs.slice(0, 8));
    }).catch(function (err) {
      console.log(err);
      res.status(500).send("An error occurred");
    });
  } else {
    res.send([]);
  }
});

app.post('/train-info', (req, res)=>{
  const trainNo = req.body.trainNo;
  TrainInfoAPIoutput(res, trainNo).then((trainInfoArray) => {
      res.send({ trainInfoArray: trainInfoArray, trainNo: trainNo });
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(500);
    });
})


app.post('/login', (req, res) => {
  User.findOne({ email: lodash.toLower(req.body.username) })
    .then(user => {
      if (user) {
        if (user.googleId) {
          userLoginWarning =
            'This Email Address is registered with Google. Please Login with Google.'
          res.redirect('/login')
        } else if (user.facebookId) {
          userLoginWarning =
            'This Email Address is registered with Facebook. Please Login with Facebook.'
          res.redirect('/login')
        } else {
          userWarning = ''
          const existUser = new User({
            email: lodash.toLower(req.body.username),
            password: req.body.password
          })
          const rememberMe = req.body.rememberMe; 
          req.login(existUser, function (err) {
            if (err) {
              console.log(err)
              res.redirect('/login')
            } else {
              passport.authenticate('local')(req, res, function () {
                logedIn = true
                res.redirect('/')
              });
              if(rememberMe === 'on') {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; 
              } else {
                req.session.cookie.expires = false;
              }
            }
          })
        }
      } else {
        userLoginWarning =
          'This Email Address is not registered. Please Sign Up or use registered email address.'
        res.redirect('/login')
      }
    })
    .catch(err => console.log(err))
  // find user in database
})

app.post('/signup', (req, res) => {
  User.findOne({ email: lodash.toLower(req.body.username) })
    .then(user => {
      if (user) {
        userWarning =
          'This Email Address is already registered. Please Login or use another email address.'
        res.redirect('/signup')
      } else {
        userWarning = ''
        User.register(
          {
            username: lodash.toLower(req.body.username),
            email: lodash.toLower(req.body.username),
            last_name: lodash.upperFirst(lodash.toLower(req.body.last_name)),
            first_name: lodash.upperFirst(lodash.toLower(req.body.first_name))
          },
          req.body.password,
          function (err, user) {
            if (err) {
              console.log(err)
              res.redirect('/signup')
            } else {
              passport.authenticate('local')(req, res, function () {
                logedIn = true
                res.redirect('/')
              })
            }
          }
        )
      }
    })
    .catch(err => {
      console.log(err)
    })
  // must give a unique username and also write username: req.body.username. This is must. and also, write req.body.password remember password must include
})

app.post('/editprofile', (req, res) => {
  const userId = req.user.id
  const newFirstName = req.body.fname
  const newLastName = req.body.lname
  const newContact = req.body.contact
  const userName = req.body.userID
  const userEmail = req.body.email
  User.findById(userId)
    .then(foundUser => {
      if (foundUser) {
        let foundUserWithUserEmail = null;
        let foundUserWithUserName = null;
        if(foundUser.email !== userEmail) {
          foundUserWithUserEmail = User.findOne({ email: userEmail });
        }
        if(foundUser.username !== userName) {
          foundUserWithUserName = User.findOne({ username: userName });
        }
        if (foundUserWithUserName) {
          const warning = 'This username is already taken. Please try another.'
          res.send(warning);
        } else if (foundUserWithUserEmail) {
          const warning = 'This email is already taken. Please try another.'
          res.send(warning);
        }
        const success = 'Profile Updated Successfully.'
        foundUser.first_name = newFirstName
        foundUser.last_name = newLastName
        foundUser.contact_no = newContact
        foundUser.username = userName
        foundUser.save()
        res.send(success);
      }
    })
    .catch(err => console.log(err))
})

function generateOTP() {
  let digits = '123456789';
  let OTP = digits[Math.floor(Math.random() * 9)];
  digits = '0123456789';
  for (let i = 0; i < 5; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

function sendEmail(senderEmail, Message, receiverEmail, subject, anyhtml) {
  return new Promise((resolve, reject) => {
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
    transporter.sendMail(mailOptions, function(error, info) {
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

function getCurrentTime(time)
{
  const x = new Date();
  x.get
  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();
  const date = time.getDate();
  const month = time.getMonth();
  const year = time.getFullYear();
  const currentTime = hour+ ' : ' + minute + ' : ' + second;
  const Todaydate = date+ '/'+ month+'/'+year;
  return {currentTime: currentTime, Todaydate: Todaydate}; 
}

app.post('/forgotPassword', (req, res)=>{
  const userEmail = req.body.email;
  User.findOne({email: userEmail})
  .then(foundUser => {
    if(foundUser) {
      if(foundUser.googleId) {
        res.send({success: false, message: "This email address is registered with Google. Please login with Google."});
      } else if(foundUser.facebookId) {
        res.send({success: false, message: "This email address is registered with Facebook. Please login with Facebook."});
      }
      else
      {
        const otp = generateOTP();
        foundUser.OtpVerifyCode.otp = bcrypt.hashSync(otp, saltRound);
        foundUser.OtpVerifyCode.time = new Date();
        foundUser.save();
        const time = getCurrentTime(new Date());
        const html = `<h1>OneTrain</h1><br><h2>Your ONE TRAIN account OTP for password reset is  ${otp} , and valid for only 10 minutes. \n\n
        (Generated at ${time.Todaydate}  ${time.currentTime}) \n\n ********************************** \n This is an auto-generated email. Do not reply to this email.</h2>`;
        const subject = "OTP for password reset";
        const senderEmail = process.env.COMPANY_ID;
        const receiverEmail = userEmail;
        const message = "";
        const emailSent = sendEmail(senderEmail, message, receiverEmail, subject, html);
        emailSent.then(success => {
          if (success) {
            res.send({ success: true, message: "Email sent successfully" });
          } else {
            res.send({ success: false, message: "Email could not be sent. Please check your Email and try Again" });
          }
        }).catch(error => {
          console.error(error);
          res.send({ success: false, message: "Email could not be sent due to an error. Please try again later." });
        });
      }
    }
    else {
      res.send({
        success: false,
        message: "This email address is not registered. Please try another."
      });
    }
  }
  )
})

app.post('/verifyOtp', (req, res)=>{
  const userEmail = req.body.email;
  const otp = req.body.otp;
  console.log(otp+" ***** "+typeof(otp)+ ' **** '+ userEmail);
  User.findOne({email: userEmail}).then(
    foundUser => {
      if(foundUser){
        const otpString = otp.toString();
        const hashedOTPString = foundUser.OtpVerifyCode.otp.toString();
        const time = new Date();
        const savedTime = foundUser.OtpVerifyCode.time;
        if(time.getTime() - savedTime.getTime() > 600000) {
          res.send({success: false, message: "OTP is expired. Please try again."});
        }
        bcrypt.compare(otpString, hashedOTPString).then(
          result => {
            if(result) {
              res.send({success: true, message: "OTP is verified successfully", userID: foundUser._id});
            } else {
              res.send({success: false, message: "OTP is incorrect. Please try again."});
            }
          }
        ).catch(err => console.log(err) );  
      } else {
        res.send({success: false, message: "This email address is not registered. Please try another."});
      }
    }
  );
})

app.post('/resetPassword', async (req, res) => {
  const userID = req.body.userID;
  const newPassword = req.body.newPassword;
  try {
    const foundUser = await User.findById(userID);
    if (foundUser) {
      await foundUser.setPassword(newPassword);
      await foundUser.save();
      res.send({ success: true, message: "Password reset successfully." });
    } else {
      res.send({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error." });
  }
});
const promisePool = pool.promise();

app.post('/stationSearchInfo', async (req, res) => {
  const stationName = req.body.station_info_input;
  const stationNameArr = stationName.split('-');
  const stationCode = lodash.lowerCase(stationNameArr[1]).trim();
  try {
  const [rows, fields] = await promisePool.execute('SELECT * FROM stations_info WHERE station_code = ?', [stationCode]);
    // console.log('Query Results:', rows); // send javascript object to the client
    stationInformation = rows;
  stationInfo(res, req, rows, stationCode);
} catch (error) {
    console.error('Error executing query:', error);
    stationSearchError = "500 Server Error";
    res.redirect('/station-info');
}
});


function stationInfo(res, req, rows, stationCode) {
  const options = {
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

    const response = axios.request(options).then(
      function (response) {
        trainList = response.data.data;
        stationSearchError = '';
        res.redirect('/stationSearchInfo');
      }
    ).catch( (error)=> {
    console.error(error);
    stationSearchError = "500 Server Error"
    res.redirect('/station-info');
  }
    );
}


function TBWSAPIoutput(res, source, destination, date){

  const options = {
    method: 'GET',
    url: 'https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations',
    params: {fromStationCode: source, toStationCode: destination,dateOfJourney: date},
    headers: {
      'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
      'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
  };

    axios.request(options).then(function (response) 
    {
      TBWS_trains =  response.data.data;      
      res.redirect(`/TBWS/${source}/${destination}`);
    }).catch(function (error){
      console.error(error);
    });
};
function TrainInfoAPIoutput(res, train_number) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: 'https://irctc1.p.rapidapi.com/api/v1/getTrainSchedule',
      params: { trainNo: train_number },
      headers: {
        'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    };

    axios.request(options)
      .then(function (response) {
        const trainInfo = response.data.data;
        resolve(trainInfo);
      })
      .catch(function (error) {
        console.error(error);
        reject(error);
      });
  });
}
function TrainFindByNumberAPI(res, train_number){
  return new Promise(function (resolve, reject) {
      const options = {
        method: 'GET',
        url: 'https://irctc1.p.rapidapi.com/api/v1/searchTrain',
        params: {query: train_number},
        headers: {
          'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
          'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
        }
      };

      axios.request(options)
      .then(function (response) {
        const trainInfo = response.data.data;
        resolve(trainInfo);
      })
      .catch(function (error) {
        console.error(error);
        reject(error);
      });
});
}

