const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  tutor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true
  },
  type: {
    type: String,
    enum: ["ordinary", "group", "other"],
    default: "ordinary"
  },
  location: {
    type: String,
    required: function() {
      return this.type === "ordinary" || this.type === "group";
    }
  },
  //from here
  description: {
    type: String,
    required: function() {
      return this.type === "ordinary" || this.type === "group";
    }
  },
  knowledgeRank: {
    type: Number,
    min: 1,
    max: 10,
    required: function() {
      return this.type === "ordinary";
    }
  },
  connectionRank: {
    type: Number,
    min: 1,
    max: 10,
    required: function() {
      return this.type === "ordinary";
    }
  },
  isNeedAdmin: { type: Boolean, default: false },
  //until here
  isCasingApproved: { type: Boolean, default: false },
  totalTime: Number,
  timeForTrainee: Number,
  date: { type: Date, required: true },
  studyTime: Number,
  chavrutaTime: Number,
  casingTime: Number,
  reportTime: Number,
  serveTime: { start: Date, end: Date },
  isServe: { type: Boolean, default: false },
  isBirth: { type: Boolean, default: false },
  isMarriage: { type: Boolean, default: false },
  isDeathOfFirstDegree: { type: Boolean, default: false },
  isHappened: { type: Boolean, default: false },
  trainee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainee",
    required: function() {
      return this.type === "ordinary";
    }
  },
  spacialMissions: { date: Date, explanation: String, totalTime: Number }
});

const Report = mongoose.model("Report", reportSchema);

module.exports.Report = Report;
