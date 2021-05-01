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
    return res.status(400).json("Error :" + error);
  }

  // Checking if the user is already in database
  const usercheck = await User.findOne({ email: req.body.email });

  if (usercheck) {
    return res.status(400).json("Error :" + "Email already exist ");
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
    res.send("User Added..!");
  } catch (err) {
    if (err) {
      return res.status(400).json("Error :" + err);
    }
  }
});

//Login User

router.post("/login", async (req, res) => {
  // Validation for login
  const { error, value } = loginvalidate(req);

  if (error) {
    return res.status(400).json("Error :" + error);
  }

  // Checking if the email exist in database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json("Error :" + "Email does not exist");
  }

  // Password Validation
  const passwordcheck = await bcrypt.compareSync(
    req.body.password,
    user.password
  );

  if (!passwordcheck) {
    return res.status(400).json("Error :" + "Password is wrong");
  }

  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

  res.send(token);
  // res.send("Logged In");
});

module.exports = router;
