const mongoose = require("mongoose");

const academicDetailsSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "הנדסה/מחשבים",
      "מדעים מדוייקים",
      "מדעי הרוח והחברה",
      "מקצועות כלכליים פיננסיים",
      "מקצועות טיפוליים",
      "אחר"
    ]
  }
});

const Academic = mongoose.model("Academic", academicDetailsSchema);

module.exports.Academic = Academic;
