"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const crypto = require("crypto");
const pug = require("pug");

var cors = require("cors");

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

app.use("/public", express.static(process.cwd() + "/public"));

app.set("views", "./views");
app.set("view engine", "pug");

app.get("/", function (req, res) {
  res.render("index");
});

// Url Model...
const {
  UrlModel,
  saveUrl,
  findUrls,
  findUrlMatch,
} = require("./models/urlModel");

// Check Connection
app.get("/is-mongoose-ok", function (req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !!mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

//Function to create a hash
const hash = (x) => crypto.createHash("sha256").update(x, "utf8").digest("hex");

// return all the urls from the database
app.get("/api/shorturl/", function (req, res) {
  findUrls((err, data) => {
    if (err) return console.log("Unable to get urls");
    if (!data) {
      console.log("Missing Done argument");
    }

    const result = data.map(function (x) {
      return Object.assign(
        {
          link: `https://${req.headers.host}/api/shorturl/${x.hash}`,
        },
        x
      );
    });

    console.log(result);
    res.render("urlList", { result });
  });
});

app.get("/api/shorturl/:hashed_url", function (req, res) {
  const url = req.params.hashed_url;
  if (url) {
    findUrlMatch(url, (err, data) => {
      if (err) return console.log(err);
      // console.log(data.url);
      res.redirect(302, `http://${data.url}`);
    });
  }
});
// your first API endpoint...
app.post("/api/shorturl/new", function (req, res) {
  if (!req.body.url) {
    return res.json({ error: "Url Parameter Can not be empty" });
  }
  const { url } = req.body;
  const original_url = url.replace(/^https?\:\/\//i, "");
  console.log(original_url);
  // check if url is valid
  dns.lookup(original_url, { family: 4 }, (err, address, family) => {
    if (err) {
      return res.json({ error: "invalid URL" });
    }

    const short_url = new UrlModel({
      url: original_url,
      hash: hash(url).slice(0, 10),
    });

    saveUrl(short_url, (err, data) => {
      if (err) return console.log("could not save the url: " + err);
      res.json({ original_url: data.url, short_url: data.hash });
    });

    //res.json({ "original_url": original_url, "short_url": short_url.hash })
  });
});

app.listen(port, function () {
  console.log("Node.js listening ...");
});
