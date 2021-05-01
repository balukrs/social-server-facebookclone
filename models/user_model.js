const mongoose = require("mongoose");
const { Schema } = mongoose;

const userschema = new Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 30,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 30,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  friends: [String],
  img: { data: Buffer, contentType: String },
});

const User = mongoose.model("User", userschema);

module.exports = User;
