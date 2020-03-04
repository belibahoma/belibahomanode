const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const traineeSchema = new mongoose.Schema({
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
  phoneA: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\d{9,10}/.test(v);
      },
      message: "מספר טלפון חייב להיות 9-10 ספרות"
    }
  },
  phoneB: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{9,10}/.test(v) || v == null;
      },
      message: "מספר טלפון חייב להיות  9-10 ספרות"
    }
  },
  birthDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return Date.now() - v >= 0;
      }
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ["זכר", "נקבה"],
    default: "זכר"
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: ["נשוי", "רווק", "גרוש", "אלמן", "אחר"]
  },
  activityArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Area",
    required: true
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true
  },
  mainStudy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicDetail",
    required: true
  },
  secondaryStudy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicDetail"
  },
  academicPlan: {
    type: String,
    enum: ["מכינה/בגרויות", "תואר ראשון", "תואר מתקדם"],
    default: "תואר ראשון",
    required: true
  },
  studyYear: {
    type: Number,
    min: 0,
    max: 7,
    required: function() {
      return this.academicPlan == "תואר ראשון";
    }
  },
  realAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    neighborhood: { type: String, required: true }
  },
  currentAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    neighborhood: { type: String, required: true }
  },
  activeYears: [Number],
  religiousStatus: {
    type: String,
    enum: ["חילוני", "מסורתי", "דתי", "חרדי", "דתי לשעבר", "חרדי לשעבר", "אחר"],
    default: "חרדי"
  },
  religiousText: {
    type: String,
    required: function() {
      this.religiousStatus === "אחר";
    }
  },
  unavailableTimes: [{ day: Number, Time: { start: Date, end: Date } }],
  notes: String,
  stuffNotes: String,
  isNeedAdditionalRelation: { type: Boolean, default: false },
  activeStatus: {
    type: String,
    enum: ["active", "not active", "graduate", "candidate"],
    default: "not active"
  },
  isFinnishPreparatory: { type: Boolean, default: false },
  isGraduated: { type: Boolean, default: false },
  isFoundJob: { type: Boolean, default: false },
  isJobInStudyFelid: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  // until here is the common part
  isInMagid: { type: Boolean, default: false },
  isLiveInSelectedCities: { type: Boolean, default: false },
  isRegisteredToKivun: { type: Boolean, default: false },
  needsHelpIn: String,
  workStatus: {
    type: String,
    enum: [
      "עובד במקצוע הלימודים",
      "עובד במקצוע אחר",
      "לא עובד ומחפש עבודה",
      "לא עובד ולא מחפש עבודה"
    ],
    default: "עובד במקצוע הלימודים"
  },
  workTitle: {
    type: String,
    required: function() {
      return (
        this.workStatus === "עובד במקצוע הלימודים" ||
        this.workStatus === "עובד במקצוע אחר"
      );
    }
  },
  isLearnedInYeshiva: { type: Boolean, default: false },
  yeshivaTimes: {
    type: Number,
    required: function() {
      return this.isLearnedInYeshiva;
    }
  },
  isHaveAnotherProfessionalTraining: { type: Boolean, default: false },
  previousProfession: {
    type: String,
    required: function() {
      return this.isHaveAnotherProfessionalTraining;
    }
  },
  isHaveAnotherDegree: { type: Boolean, default: false },
  previousDegree: {
    type: String,
    required: function() {
      return this.isHaveAnotherDegree;
    }
  },
  WantDetailsAbout: {
    personalTraining: { type: Boolean, default: false },
    jobSeeking: { type: Boolean, default: false },
    professionalTraining: { type: Boolean, default: false },
    englishCourse: { type: Boolean, default: false },
    computerCourse: { type: Boolean, default: false },
    studyDiagnostics: { type: Boolean, default: false },
    selfAdvanceProgram: { type: Boolean, default: false },
    entrepreneurship: { type: Boolean, default: false },
    shortTermPreparatory: { type: Boolean, default: false }
  },
  isServed: { type: Boolean, default: false },
  mathLevel: { type: Number, min: 0, max: 5, default: 0 },
  englishLevel: { type: Number, min: 0, max: 5, default: 0 },
  physicsLevel: { type: Number, min: 0, max: 5, default: 0 },
  additionalTopics: String,
  isActive: { type: Boolean, default: false },
  leavingReason: {
    type: String
  },
  isDropped: { type: Boolean, default: false }
});

traineeSchema.methods.generateAuthToken = function() {
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

const Trainee = mongoose.model("Trainee", traineeSchema);

module.exports.Trainee = Trainee;
