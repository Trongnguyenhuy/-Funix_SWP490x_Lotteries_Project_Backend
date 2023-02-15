const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const lotterySchema = new Schema({
  stationId: {
    type: Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
  },
  result: {
    jackpot: [
      {
        type: String,
        required: true,
      },
    ],
    signJackpot: [
      {
        type: String,
      },
    ],
    firstNum: [
      {
        type: String,
        required: true,
      },
    ],
    secondNum: [
      {
        type: String,
        required: true,
      },
    ],
    thirdNum: [
      {
        type: String,
        required: true,
      },
    ],
    fourthNum: [
      {
        type: String,
        required: true,
      },
    ],
    fifthNum: [
      {
        type: String,
        required: true,
      },
    ],
    sixthNum: [
      {
        type: String,
        required: true,
      },
    ],
    seventhNum: [
      {
        type: String,
        required: true,
      },
    ],
    eighthNum: [
      {
        type: String,
      },
    ],
  },
});

module.exports = mongoose.model("Lottery", lotterySchema);
