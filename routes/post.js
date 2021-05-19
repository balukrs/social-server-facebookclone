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

// Getting posts by unique user id
router.get("/userpost/:id", async (req, res) => {
  try {
    const response = await Post.find(
      { userid: req.params.id },
      { content: 1, contentimg: 1 }
    );
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

// Updating the comments
router.post("/comments", async (req, res) => {
  try {
    const posting = await Post.updateOne(
      { _id: req.body.id },
      {
        $push: {
          comments: req.body.comment,
        },
      }
    );
    const response = await Post.findOne({ _id: req.body.id }, { comments: 1 });
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

// Updating Likes
router.post("/likes/:userid/:postid", async (req, res) => {
  try {
    const pst = await Post.findOne({ _id: req.params.postid }, { likes: 1 });
    const likes = pst.likes;

    const unique = likes.length
      ? likes.some((item) => item.userid === req.params.userid)
      : false;

    if (unique) {
      const removelike = await Post.updateOne(
        { _id: req.params.postid },
        {
          $pull: {
            likes: { userid: req.params.userid },
          },
        }
      );
      const removedpst = await Post.findOne(
        { _id: req.params.postid },
        { likes: 1 }
      );
      res.json({ likes: removedpst.likes.length, likestatus: "removed" });
    } else {
      const updatelike = await Post.updateOne(
        { _id: req.params.postid },
        {
          $push: {
            likes: { userid: req.params.userid },
          },
        }
      );

      const updatedpst = await Post.findOne(
        { _id: req.params.postid },
        { likes: 1 }
      );
      res.json({ likes: updatedpst.likes.length, likestatus: "added" });
    }
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

//Deleting post
router.delete("/post/:id", async (req, res) => {
  try {
    const response = await Post.findOneAndDelete({ _id: req.params.id });
    res.json("deleted");
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

module.exports = router;
