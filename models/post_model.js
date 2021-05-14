const mongoose = require("mongoose");
const { Schema } = mongoose;

const postmodel = new Schema({
  userid: { type: String },
  username: { type: String },
  content: {
    type: String,
    required: true,
    max: 500,
  },
  contentimg: {
    type: Buffer,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      username: { type: String },
      createdAt: { type: Date, default: Date.now },
      content: { type: String },
    },
  ],
  likes: [
    {
      username: { type: String },
    },
  ],
});

const Post = mongoose.model("Post", postmodel);

module.exports = Post;
