const mongoose = require("mongoose");

const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    //required: true,
  },
  username: {
    type: String,
    required: true,
    maxlength: 10,
    match: alphaNumericRegex,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("users", UserSchema);
module.exports = User;
