const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  ticket: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  timeCheck: {
    type: String,
    required: true,
  },
  station: {
    type: String,
    required: true,
  },
  zoneCode: {
    type: String,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true
  },
  lotteryId: {
    type: Schema.Types.ObjectId,
    ref: "Lottery",
    require: true
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
