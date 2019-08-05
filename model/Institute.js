const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["אוניברסיטה", "מכללה", "מכינה", "הכשרה מקצועית", "אחר"],
    default: "אוניברסיטה"
  }
});

const Institute = mongoose.model("Institute", instituteSchema);

module.exports.Institute = Institute;
