const xp = require("express");
const uid2 = require("uid2"); // sert à créer des variables aléatoires
const SHA256 = require("crypto-js/sha256"); // algo de hashage. Ne renvoie pas une string, pour ça on a besoin de encbase64
const encBase64 = require("crypto-js/enc-base64"); // transforme l'encryptage en string
const toBase64 = require("../utils/toBase64");
const router = xp.Router(); // router creation
const cloudinary = require("cloudinary").v2;
const User = require("../models/User"); // Import model
const fileUpload = require("express-fileupload");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post("/user/signup", fileUpload(), async (req, res) => {
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
    const avatar = req.files.avatar;
    const { username, email, password } = req.body;
    const newAvatar = await cloudinary.uploader.upload(toBase64(avatar), {
      public_id: `vinted/avatars/${username}`,
    });
    const userSalt = uid2(16);
    const userToken = uid2(64);
    const newUser = new User({
      email: email,
      account: { username: username, avatar: newAvatar },
      salt: userSalt,
      hash: SHA256(password + userSalt).toString(encBase64),
      token: userToken,
    });
    const resp = {
      _id: newUser._id.valueOf(),
      token: newUser.token,
      account: newUser.account,
    };
    await newUser.save();
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
