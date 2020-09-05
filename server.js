'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const crypto = require('crypto');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => console.log(error));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Url Model...
const Url = require('./models/urlModel');

// Check Connection
app.get("/is-mongoose-ok", function(req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

//Function to create a hash
const hash = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

// your first API endpoint... 
app.post("/api/shorturl/new", function(req, res) {
  if(!req.body.url){
    return res.json({"error": "Url Parameter Can not be empty"});
  }
  const { url } = req.body;
  const original_url = url.replace(/^https?\:\/\//i, "");
  console.log(original_url);
  // check if url is valid
  dns.lookup(original_url, {family: 4}, (err, address, family) => {
    if(err){
      return res.json({"error": "invalid URL"});
    }

    const short_url = new Url({url: original_url, hash: hash(url)});
    res.json({ "original_url": original_url, "short_url": short_url.hash.slice(0,10) })
  })
});




app.listen(port, function() {
  console.log('Node.js listening ...');
});