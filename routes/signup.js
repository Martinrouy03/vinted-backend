const xp = require("express");
const uid2 = require("uid2"); // sert à créer des variables aléatoires
const SHA256 = require("crypto-js/sha256"); // algo de hashage. Ne renvoie pas une string, pour ça on a besoin de encbase64
const encBase64 = require("crypto-js/enc-base64"); // transforme l'encryptage en string

const router = xp.Router(); // router creation

const User = require("../models/User"); // Import model

router.post("/user/signup", async (req, res) => {
  try {
    const checkUser = await User.findOne({ email: req.body.email });
    if (checkUser) {
      res
        .status(400)
        .json({ message: "This email already exists in the data-base." });
      return;
    } else if (!Object.keys(req.body).includes("username")) {
      res.status(400).json({ message: "Username missing." });
      return;
    }
    const userSalt = uid2(16);
    const userToken = uid2(64);
    const newUser = new User({
      email: req.body.email,
      account: { username: req.body.username },
      salt: userSalt,
      hash: SHA256(req.body.password + userSalt).toString(encBase64),
      token: userToken,
    });
    await newUser.save();
    // const retrieveUser = await User.findOne({ email: req.body.email });
    const resp = {
      _id: newUser._id.valueOf(),
      token: newUser.token,
      account: newUser.account,
    };
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
