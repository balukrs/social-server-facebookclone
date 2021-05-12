const express = require("express");
const router = express.Router();
const Post = require("../models/post_model");
const multer = require("multer");
const sharp = require("sharp");

//multer options
const upload = multer({
  type: Buffer,
});

// Creating a Post
router.post("/post", upload.single("contentupload"), async (req, res) => {
  const userid = req.body.userid;
  const username = req.body.username;
  const content = req.body.post;
  const buffer = req.file
    ? await sharp(req.file.buffer).resize({ width: 500 }).webp().toBuffer()
    : null;

  const newPost = new Post({
    userid: userid,
    username: username,
    content: content,
    contentimg: buffer,
  });

  try {
    const response = await newPost.save();
    res.json("uploaded");
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

//Getting all post ids
router.get("/postid", async (req, res) => {
  try {
    const response = await Post.distinct("_id", {});
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

//Getting unique post by post id
router.get("/post/:id", async (req, res) => {
  try {
    const response = await Post.findOne({ _id: req.params.id });
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

// Getting post by unique user id
router.get("/userpost/:id", async (req, res) => {
  try {
    const response = await Post.find({ userid: req.params.id });
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

//Deleting post
router.delete("/post/:id", async (req, res) => {
  try {
    const response = await Post.findByIdAndDelete(req.params.id);
    res.json("file deleted");
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

module.exports = router;
