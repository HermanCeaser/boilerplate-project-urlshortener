const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  "url": String,
  "hash": String
});

const UrlModel = mongoose.model("UrlModel", urlSchema);

module.exports =  UrlModel;