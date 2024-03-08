const xp = require("express");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const router = xp.Router(); // router creation

const User = require("../models/User"); // Import model

router.post("/user/login", async (req, res) => {
  try {
    const retrieveUser = await User.findOne({
      email: req.body.email,
    });
    const newHash = SHA256(req.body.password + retrieveUser.salt).toString(
      encBase64
    );
    console.log(newHash);
    console.log(retrieveUser);
    if (newHash === retrieveUser.hash) {
      res.status(200).json({ message: "Login successful!" });
    } else {
      res.status(400).json({ message: "Wrong password." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
