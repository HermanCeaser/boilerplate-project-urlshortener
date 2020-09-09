const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  url: { type: String, required: true },
  hash: String,
});

const UrlModel = mongoose.model("UrlModel", urlSchema);

const saveUrl = (url, done) => {
  if (url) {
    UrlModel.findOneAndUpdate(
      { hash: url.hash },
      { $setOnInsert: url },
      { upsert: true, new: true },
      (err, data) => {
        if (err) return console.error(err);
        done(null, data);
      }
    );
  }
};

const findUrls = (done) => {
  UrlModel.find({}, (err, data) => {
    if (err) return console.log(err);
    done(null, data);
  });
};

const findUrlMatch = (hash, done) => {
  UrlModel.findOne({ hash: hash }, (err, data) => {
    if (err) return console.log(err);
    done(null, data);
  });
};

module.exports = { UrlModel, saveUrl, findUrls, findUrlMatch };
