const mg = require("mongoose");

const User = mg.model("User", {
  email: String,
  account: {
    username: { type: String, required: true },
    avatar: Object,
  },
  salt: String,
  hash: String,
  token: String,
});

module.exports = User;
