const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error:"));
connection.once("open", function () {
  console.log("Mongo DB database connection established successfully");
});

// Routers initialising
app.use("/social", require("./routes/user"));

//Listner
app.listen(PORT, () => {
  console.log(`Server started on PORT:${PORT}`);
});
