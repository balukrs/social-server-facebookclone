const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Model
const User = require("../models/user_model");

// Validation
const { registervalidate, loginvalidate } = require("./validation/validation");

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

  res.cookie("token", token, { httpOnly: true });
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

module.exports = router;
