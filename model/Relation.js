const mongoose = require("mongoose");

const relationSchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true
  },
  trainee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainee",
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  totalTime: {
    type: Number,
    required: true,
    default: 0}



});

const Relation = mongoose.model("Relation", relationSchema);

module.exports.Relation = Relation;
