const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

mongoose.connect('mongodb://localhost/movie');
let db = mongoose.connection;

db.on('error', function(err){
    console.log(err);
});

db.once('open', function(){
    console.log("Connected to mongodb");
})

const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: 'mashup_secret_key', // Change this to a secure random string
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      mongoUrl: 'mongodb://localhost/movie',
      
    }),
  }));
  

app.use(express.json());
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Error logging out' });
      }
      res.json({ success: true, message: 'Logout successful' });
    });
  });
  

let users=require('./router/users');
app.use('/users',users);

let admin=require('./router/admins');
app.use('/admins',admin);

let movie=require('./router/ticket');
app.use('/ticket',movie);

let booking=require('./router/bookings');
app.use('/bookings',booking);


app.listen(5000, function(){
    console.log('Server started on port 5000...');
})
 