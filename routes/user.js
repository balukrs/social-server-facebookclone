const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// multer options
const multer = require("multer");
const sharp = require("sharp");
const upload = multer({
  type: Buffer,
});

// Model
const User = require("../models/user_model");

// Validation
const {
  registervalidate,
  loginvalidate,
  editpassword,
} = require("./validation/validation");

//Creating new user//Register
router.post("/register", async (req, res) => {
  // Validation for register
  const { error, value } = registervalidate(req);

  if (error) {
    return res.send(error);
  }

  // Checking if the user is already in database
  const usercheck = await User.findOne({ email: req.body.email });

  if (usercheck) {
    return res.send("Email already exist ");
  }

  //Hash Password
  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hashSync(req.body.password, salt);

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashpassword,
  });
  try {
    const response = await newUser.save();
    res.send("success");
  } catch (err) {
    if (err) {
      return res.status(400).send("Error :" + err);
    }
  }
});

//Login User

router.post("/login", async (req, res) => {
  // Validation for login
  const { error, value } = loginvalidate(req);

  if (error) {
    return res.send(error);
  }

  // Checking if the email exist in database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.send("Email does not exist");
  }

  // Password Validation
  const passwordcheck = await bcrypt.compareSync(
    req.body.password,
    user.password
  );

  if (!passwordcheck) {
    return res.send("Error :" + "Password is wrong");
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.SECRET_KEY
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });
  res.status(200).send("loginsuccess");
});

// Validating the jwt token
router.get("/login", async (req, res) => {
  const token = req.cookies.token || "";

  // Check if token is present in cookie
  if (!token) {
    return res.send("loggedout").status(401);
  }

  const decrypt = await jwt.verify(token, process.env.SECRET_KEY);
  res.status(200).send({ id: decrypt.id, username: decrypt.username });
});

//Clearing cookie along with jwt token
router.get("/logout", async (req, res) => {
  res.status(202).clearCookie("token").send("cookiecleared");
});

// Getting all users
router.get("/users", async (req, res) => {
  try {
    const response = await User.find({}, { password: 0, email: 0 });
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

// Uploading Profilepic

router.post("/profilepic", upload.single("profileupload"), async (req, res) => {
  const buffer = req.file
    ? await sharp(req.file.buffer).webp().toBuffer()
    : null;

  try {
    const response = await User.updateOne(
      { _id: req.body.id },
      {
        $set: { img: buffer },
      }
    );
    res.json("uploaded");
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

// Sending user profilepic
router.get("/profilepic/:id", async (req, res) => {
  try {
    const response = await User.findOne({ _id: req.params.id }, { img: 1 });
    res.json(response);
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

// Changing username
router.post("/editpassword", async (req, res) => {
  const { error, value } = editpassword(req);

  if (error) {
    return res.send(error);
  }

  const user = await User.findOne({ _id: req.body.userid }, { password: 1 });

  const passwordcheck = await bcrypt.compareSync(
    req.body.oldpassword,
    user.password
  );

  if (!passwordcheck) {
    return res.json({ error: "old password incorrect" });
  }

  const salt = await bcrypt.genSaltSync(10);
  const hashpassword = await bcrypt.hashSync(req.body.password, salt);

  try {
    const response = await User.updateOne(
      { _id: req.body.userid },
      { $set: { password: hashpassword } }
    );
    res.json("updated");
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

module.exports = router;
