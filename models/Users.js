import { Schema, model } from "mongoose";

const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
const UserSchema = new Schema({
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

const User = model("users", UserSchema);
export default User;
