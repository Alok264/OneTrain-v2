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
const cookieParser  = require('cookie-parser') // date added 17/10/2023
const nodemailer = require('nodemailer');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcrypt");
const findOrCreate = require("mongoose-findorcreate");
const saltRound = 8;
const { spawn } = require('child_process');
const app = express();
const fs = require('fs')
const mysql = require('mysql2');


app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"));
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET));
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
  password: {type: String, minlength: 8},
  first_name: String,
  last_name: String,
  googleId: String,
  facebookId: String,
  photo: String,
  contact_no: {type:String, maxlength: 10, minlength: 10, unique: true},
  user_name: {type: String, unique: true},
  OtpVerifyCode: {otp: String, time: Date},
  user_trip: [{type: mongoose.Schema.Types.ObjectId, ref: 'usertrip'}]
});

const userTripSchema = new mongoose.Schema({
  pnr: {type: String, unique: true, maxlength: 10, minlength: 10},
  train_number: String,
  train_name: String,
  source: String,
  source_code: String,
  destination: String,
  destination_code: String,
  date: Date,
  class: String,
  count: Number,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
});

const TrainSchema = new mongoose.Schema({
  trainNo: String,
  trainName: String,
});

const IndianTrains = new mongoose.Schema({
  trainName: String,
  trainDetails: String,
  trainImage: [String]
});

userSchema.plugin(passportLM, {usernameField: "email", usernameLowerCase: true});
userSchema.plugin(findOrCreate);

const stationList = new mongoose.model('list', StationSchema);
const User = new mongoose.model('user', userSchema);
const Train = new mongoose.model('train', TrainSchema);
const IndianTrain = new mongoose.model('indiantrain', IndianTrains);
const Usertrip = new mongoose.model('usertrip', userTripSchema);

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
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOne({googleId: profile.id}).then((currentUser)=>{
    if(currentUser){
      User.updateOne({googleId: profile.id}, {$set: {user_name: profile.displayName, email: profile.emails[0].value, photo: profile.photos[0].value}})
      return cb(null, currentUser);
    }
    else
    {
      const newUser = new User({
            googleId: profile.id,
            user_name: profile.displayName,
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
          User.updateOne({facebookId: profile.id}, {$set: {email:profile.emails[0].value, user_name: profile.displayName}}); // update the email and username
          return cb(null, founduser);
        } else {
            const newUser = new User({
              facebookId: profile.id,
              email: profile.emails[0].value,
              user_name: profile.displayName,
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
  console.log("Cookies: ", req.cookies);
  console.log("Session: ", req.session);
  console.log("Signed Cookies: ", req.signedCookies); 
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
  try{
    if(req.isAuthenticated())
    {
      res.render('PNR', {alert: alert});
      alert = "";
    }
    else
    {
        res.redirect('/login');
    }
  }
  catch(error)
  {
    console.log(error);
    alert = "Internal server error.";
    res.redirect('/pnr-status');
  }
})

app.get("/pnr-check/:pnr", (req, res)=>{
  try{
    res.render("Check", {
      response: PassengerPNR
    });
  }
  catch(error)
  {
    console.log(error);
    alert = "Internal server error.";
    res.redirect('/pnr-status');
  }
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
  try{
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
  }
  catch(error)
  {
    console.log(error);
    res.json({logedIn: false});
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
      res.status(500).send("There is some error in the chatbot. Please try again later.");
    } else {
      res.status(200).send(output);
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

app.get('/upcomingJourney', async (req, res) => {
  try{
    if (req.isAuthenticated()) {
      const userID = req.user.id;
      const foundUser = User.findById(userID);
      if (foundUser) {
        const trips = await Usertrip.find({ user: foundUser._id, date: { $gte: new Date() } }).sort({ date: 1 });
        res.status(200).send({ success: true, message: trips });
      } else {
        res.status(400).send({ success: false, message: "User not found." });
      }
    } else {
      res.redirect('/login');
    }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error." });
  }
})

app.get('/pastJourney', async (req, res) => {
  try{
    if (req.isAuthenticated()) {
      const userID = req.user.id;
      const foundUser = User.findById(userID);
      if (foundUser) {
        const trips = await Usertrip.find({ user: foundUser._id, date: { $lt: new Date() } }).sort({ date: -1 });
        res.status(200).send({ success: true, message: trips });
      } else {
        res.status(400).send({ success: false, message: "User not found." });
      }
    } else {
      res.redirect('/login');
    }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error." });
  }
})



app.post("/pnr-status", async (req, res) =>
{
  try{
    const userID = req.user.id;
    pnr = req.body.pnrcheck.trim();
    if(pnr)
    {
      const response = await PNRapiCall(pnr);
      if(response.data.data.TrainNo === null)
      {
        alert = "Not A valid PNR";
        res.redirect("/pnr-status");
      }
      else
      {
        const saveResponse = await savePNR(userID, response.data.data);
        if(saveResponse.status === 200)
        {
          alert = "";
          PassengerPNR = response.data.data;
          res.redirect(`/pnr-check/${pnr}`);
        }
        else
        {
          alert = saveResponse.message;
          res.redirect("/pnr-status");
        }
      }
    }
    else
    {
      alert = "Please enter a valid PNR";
      res.redirect("/pnr-status");
    }
  }
  catch(error)
  {
    console.log(error);
    alert = "Internal server error.";
    res.redirect("/pnr-status");
  }

}
);

async function savePNR(userID, response) {
  try {
    let Pnrsavemessage;
    let status;
    const foundUser = await User.findById(userID);
    if (foundUser) {
      const trippnr = response.Pnr;
      const train_name = response.TrainName;
      const train_number = response.TrainNo;
      const source = response.BoardingStationName;
      const source_code = response.From;
      const destination = response.ReservationUptoName;
      const destination_code = response.To;
      const [day, month, year] = response.Doj.split('-');
      const [hour, minute] = response.ScheduledDeparture.split(':');
      const date = new Date(parseInt(year), parseInt(month - 1), parseInt(day), parseInt(hour), parseInt(minute));
      const Class = response.Class;
      const count = response.PassengerCount;

      const existingTrip = await Usertrip.findOne({ pnr: trippnr, user: foundUser._id });
      if (existingTrip) {
        existingTrip.train_number = train_number;
        existingTrip.train_name = train_name;
        existingTrip.source = source;
        existingTrip.source_code = source_code;
        existingTrip.destination = destination;
        existingTrip.destination_code = destination_code;
        existingTrip.date = date;
        existingTrip.class = Class;
        existingTrip.count = count;
        await existingTrip.save();
        Pnrsavemessage = "Existing trip updated.";
        status = 200;
      } else {
        const newTrip = new Usertrip({
          pnr: trippnr,
          train_number: train_number,
          train_name: train_name,
          source: source,
          source_code: source_code,
          destination: destination,
          destination_code: destination_code,
          date: date,
          class: Class,
          count: count,
          user: foundUser._id
        });
        await newTrip.save();
        Pnrsavemessage = "New trip saved.";
        status = 200;
      }
    } else {
      status = 400;
      Pnrsavemessage = "User not found.";
    }
    return { status: status, message: Pnrsavemessage };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Internal server error." };
  }
}

app.post('/chatPNR', async (req, res) => {
  try {
    const Chatpnr = req.body.pnr;
    const response = await PNRapiCall(Chatpnr);
    if (response.data.data.TrainNo === null) {
      res.status(404).send({ success: false, message: "Not a valid PNR." });
    } else {
      res.status(200).send({ success: true, message: response.data.data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error." });
  }
})

async function PNRapiCall(pnr) {
  const options = {
    method: 'GET',
    url: 'https://irctc1.p.rapidapi.com/api/v3/getPNRStatus',
    params: {pnrNumber: pnr},
    headers: {
      'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
      'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

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

app.post('/station-search', (req, res) => {
  const value = req.body.input.trim();
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
      res.status(200).send(docs.slice(0, 8));
    }).catch(function (err) {
      console.log(err);
      res.status(500).send("Server side error, please try again later.");
    });
  } else {
    res.status(400).send([]);
  }
});


app.post('/train-search', function (req, res) {
  const value = req.body.input.trim();
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
      res.status(200).send(docs.slice(0, 8));
    }).catch(function (err) {
      console.log(err);
      res.status(500).send("An error occurred");
    });
  } else {
    res.status(400).send([]);
  }
});

app.post('/train-info', (req, res)=>{
  const trainNo = req.body.trainNo.trim();
  if(trainNo){
    TrainInfoAPIoutput(res, trainNo).then((trainInfoArray) => {
        res.status(200).send({ success: true, trainInfoArray: trainInfoArray, trainNo: trainNo });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send({ success: false, trainInfoArray: "Internal server error.", trainNo: trainNo });
      });
  }
  else{
    res.status(400).send({ success: false, trainInfoArray: "Please enter a valid train number.", trainNo: trainNo });
  }
})


app.post('/login', async (req, res) => {
  try{
    const userEmail = req.body.email.trim().toLowerCase();
    const foundUser = await User.findOne({ email: userEmail });
    if(foundUser)
    {
      if(foundUser.googleId)
      {
        return handleGoogleLogin(req, res);
      }
      else if(foundUser.facebookId)
      {
        return handleFacebookLogin(req, res);
      }
      else
      {
        return handleLocalLogin(req, res);
      }
    }
    else
    {
      return handleNotRegisteredUser(req, res);
    }
  }
  catch(error)
  {
    console.log(error);
    userLoginWarning = "Internal server error.";
    return res.redirect('/login');
  }
})

function handleGoogleLogin(req, res) {
  userLoginWarning = "This email address is registered with Google. Please login with Google.";
  return res.redirect('/login');
}

function handleFacebookLogin(req, res) {
  userLoginWarning = "This email address is registered with Facebook. Please login with Facebook.";
  return res.redirect('/login');
}

function handleNotRegisteredUser(req, res) {
  userLoginWarning = "This email address is not registered. Please Sign Up first.";
  return res.redirect('/login');
}

function handleLocalLogin(req, res) {
  passport.authenticate('local', (err, user, info) => {
          if (err) {
            console.log("Error during authentication:", err);
            userLoginWarning = "Internal server error.";
            return res.redirect('/login');
          }
          if (!user) {
            console.log("Authentication failed:", info.message);
            userLoginWarning = "Invalid username or password.";
            return res.redirect('/login');
          }
          req.logIn(user, function(err) {
            if (err) {
              console.log("Error during login:", err);
              userLoginWarning = "Internal server error.";
              return res.redirect('/login');
            }
            userLoginWarning = "";
            logedIn = true;
            return res.redirect('/');
          });
        })(req, res);
}


app.post('/signup', async (req, res) => {
  try{
    const userEmail = req.body.username.trim().toLowerCase();
    console.log(userEmail);
    const foundUser = await User.findOne({ email: userEmail });
    console.log(foundUser);
    if(foundUser)
    {
      userWarning = "This email address is already registered. Please try another.";
      res.redirect('/signup');
    }
    else
    {
      userWarning = "";
      const Newuser = new User({
        email: userEmail,
        user_name: userEmail,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      });
      console.log(Newuser)
      await User.register(Newuser, req.body.password, async (err, newUser) => {
      if (err) {
        console.log(err + " Cannot register new user");
        userWarning = "Internal server error.";
        res.redirect('/signup');
      } else {
        req.logIn(newUser, function(err) {
          if (err) {
            console.log(err + " Cannot log in with the new user");
            return res.redirect('/signup');
          }

          logedIn = true;
          console.log("New user logged in");
          return res.redirect('/');
        });
      }
    });
    }
  }
  catch(error)
  {
    console.log(error + "Cannot register new user Catch Error, exception in main try block");
    userWarning = "Internal server error.";
    res.redirect('/signup');
  }
  
})

app.post('/usernameExistOrNot', async (req, res) => {
  try{
    const userName = req.body.username;
    let userID = "";
    if (req.isAuthenticated()) {
      userID = req.user.id;
    }
    else
    {
      res.redirect('/login');
    }
    const currentUser = await User.findOne({_id: userID})
    const currentUsername = currentUser.user_name;
    if(currentUsername === userName)
    {
      res.status(200).send({success: false, message: "This username is available."});
    }
    else
    {
      const foundUser = await User.findOne({user_name: userName});
      if(foundUser)
      {
        res.status(200).send({success: true, message: "This username is already taken. Please try another."});
      }
      else
      {
        res.status(200).send({success: false, message: "This username is available."});
      }
    }
  }
  catch(error)
  {
    console.log(error);
    res.status(500).send({success: false, message: "Internal server error."});
  }
})

app.post('/editprofile', (req, res) => {
  const newFirstName = req.body.fname
  const newLastName = req.body.lname
  const newContact = req.body.contact
  const userName = req.body.userID
  const userEmail = req.body.email
  User.findOne({email: userEmail})
    .then(async (foundUser) => {
      if (foundUser) {
        let foundUserWithUserName = "";
        if(foundUser.user_name !== userName) {
          foundUserWithUserName = await User.findOne({ user_name: userName });
        }
        if (foundUserWithUserName) {
          const warning = 'This username is already taken. Please try another.'
          res.status(400).send(warning);
        }
        const success = 'Profile Updated Successfully.'
        const updatedUser = await User.updateOne({ email: userEmail }, { $set: { first_name: newFirstName, last_name: newLastName, contact_no: newContact, user_name: userName } }, { new: true });
        if(updatedUser) {
          res.status(200).send(success);
        } else {
          res.status(500).send("Internal server error.");
        }
      }
    })
    .catch(err => console.log(err))
})

app.post('/changePassword', async (req, res) => {
  console.log("change password")
  try{
    if(req.isAuthenticated())
    {
      const userID = req.user.id;
      const oldPassword = req.body.oldPassword;
      const newPassword = req.body.newPassword;

      const foundUser = await User.findById(userID);
      console.log(foundUser)
      if(foundUser)
      {
        foundUser.authenticate(oldPassword, async (err, user, passwordErr) => {
          if (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Internal server error." });
          }
          if (!user) {
            console.log(passwordErr)
            res.status(400).send({ success: false, message: "Old password is incorrect." });
          }
          else
          {
            console.log("password changed")
            await foundUser.setPassword(newPassword);
            await foundUser.save();
            res.status(200).send({ success: true, message: "Password changed successfully." });
          }
        });
      }
      else
      {
        res.status(400).send({ success: false, message: "User not found." });
      }
    }
    else
    {
      res.redirect('/login');
    }
  }
  catch(error)
  {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error." });
  }
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
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.COMPANY_ID,
        pass: process.env.APP_PASSWORD
      }
    });
    let mailOptions = {
      from: senderEmail,
      to: receiverEmail,
      subject: subject,
      text: Message,
      html: anyhtml
    };
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        reject(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
}

function getCurrentTime(time)
{
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
  const userEmail = req.body.email.trim();
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
            res.status(200).send({ success: true, message: "Email sent successfully" });
          } else {
            res.status(400).send({ success: false, message: "Email could not be sent. Please check your Email and try Again" });
          }
        }).catch(error => {
          console.error(error);
          res.status(500).send({ success: false, message: "Email could not be sent due to an error. Please try again later." });
        });
      }
    }
    else {
      res.status(400).send({
        success: false,
        message: "This email address is not registered. Please try another."
      });
    }
  }
  )
})

app.post('/verifyOtp', (req, res)=>{
  const userEmail = req.body.email.trim();
  const otp = req.body.otp.trim();
  User.findOne({email: userEmail}).then(
    foundUser => {
      if(foundUser){
        const otpString = otp.toString();
        const hashedOTPString = foundUser.OtpVerifyCode.otp.toString();
        const time = new Date();
        const savedTime = foundUser.OtpVerifyCode.time;
        if(time.getTime() - savedTime.getTime() > 600000) {
          res.status(400).send({success: false, message: "OTP is expired. Please try again."});
        }
        bcrypt.compare(otpString, hashedOTPString).then(
          result => {
            if(result) {
              res.status(200).send({success: true, message: "OTP is verified successfully", userID: foundUser._id});
            } else {
              res.status(400).send({success: false, message: "OTP is incorrect. Please try again."});
            }
          }
        ).catch(err => console.log(err) );  
      } else {
        res.status(400).send({success: false, message: "This email address is not registered. Please try another."});
      }
    }
  );
})

app.post('/resetPassword', async (req, res) => {
  const userID = req.body.userID;
  const newPassword = req.body.newPassword.trim();
  try {
    const foundUser = await User.findById(userID);
    if (foundUser) {
      await foundUser.setPassword(newPassword);
      await foundUser.save();
      res.status(200).send({ success: true, message: "Password reset successfully." });
    } else {
      res.status(400).send({ success: false, message: "User not found." });
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

