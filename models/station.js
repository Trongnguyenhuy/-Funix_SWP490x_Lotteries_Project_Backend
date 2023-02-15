const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  zoneCode: {
    type: String,
    required: true,
  },
  baseUrlAPI: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  status: {
    type: Boolean,
  },
  open: {
    weekDay: [
      {
        type: String,
        required: true,
      },
    ],
    time: {
      type: String,
      required: true,
    },
  },
  descriptions: {
    address: String,
    phoneNum: String,
    webSite: String,
  },
});

module.exports = mongoose.model("Station", stationSchema);
