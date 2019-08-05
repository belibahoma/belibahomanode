const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const adminSchema = new mongoose.Schema({
  userType: String,
  id: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\d{9}/.test(v);
      },
      message: "מספר תעודת הזהות חייב להיות בין 9 ספרות"
    }
  },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
          v
        );
      },
      message: "כתובת מייל אינה חוקית"
    }
  },
  password: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{9,10}/.test(v);
      },
      message: "מספר טלפון חייב להיות 9-10 ספרות"
    }
  }
});

adminSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      fname: this.fname,
      lname: this.lname,
      type: this.userType
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports.Admin = Admin;
