const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  imgUrl: {
    type: String,
  },
  googleId: {
    type: String,
  }
});

module.exports = mongoose.model("User", userSchema);
