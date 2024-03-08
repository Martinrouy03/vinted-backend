const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config;

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

// // Import routes
const signupRoutes = require("./routes/signup");
app.use(signupRoutes);
const loginRoutes = require("./routes/login");
app.use(loginRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "ERROR 404: Not Found." });
});
app.listen(process.env.PORT, () => {
  console.log("Server has started! 🚀");
});
