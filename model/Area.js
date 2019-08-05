const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Area = mongoose.model("Area", areaSchema);

module.exports.Area = Area;
