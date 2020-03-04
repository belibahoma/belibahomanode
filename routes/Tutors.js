const { Tutor } = require("../model/Tutor");
const sendToMail = require("../utils/mailSender.js");
const _ = require("lodash");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const linkToWebsite = "localhost:3000/alerts";
const to = "belibahoma@gmail.com";
const { Coordinator } = require("../model/Coordinator");
const { Relation } = require("../model/Relation");

router.get("/me", auth, async (req, res) => {
  if (req.user.type === "tutor") {
    const tutor = await Tutor.findById(req.user._id)
      .select("-password -stuffNotes")
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");
    res.send(tutor);
  } else {
    res.status(401).send("unauthorized");
  }
});

router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const tutors = await Tutor.find()
      .sort("fname")
      .select("-password")
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");
    res.send(tutors);
  } else if (req.user.type === "coordinator") {
    const coordinator = await Coordinator.findById(req.user._id);
    // console.log(coordinator);

    const tutors = await Tutor.find({
      activityArea: coordinator.activityAreas
    })
      .sort("fname")
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");
    // console.log("tutors", tutors);

    res.send(
      tutors.map(tutor => {
        return _.omit(tutor, "password");
      })
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

router.post("/approve/:id", [auth, admin], async (req, res) => {
  let tutor = await Tutor.findByIdAndUpdate(
    req.params.id,
    {
      $set: { isApproved: true }
    },
    { new: true }
  );

  if (!tutor) {
    return res.status(500).send("משהו השתבש");
  } else {
    res.send("החונך אושר בהצלחה");
  }
});

router.post("/", async (req, res) => {
  //TODO
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let tutor = await Tutor.findOne({ id: req.body.id });
  if (tutor) {
    res.statusCode = 400;
    res.send("the user already exists");
  } else {
    tutor = new Tutor({
      userType: "tutor",
      id: req.body.id,
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      password: req.body.password,
      phoneA: req.body.phoneA,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      maritalStatus: req.body.maritalStatus,
      activityArea: req.body.activityArea,
      institute: req.body.institute,
      mainStudy: req.body.mainStudy,
      academicPlan: req.body.academicPlan,
      studyYear: req.body.studyYear,
      realAddress: req.body.realAddress,
      currentAddress: req.body.currentAddress,
      activeYears: req.body.activeYears,
      religiousStatus: req.body.religiousStatus,
      religiousText: req.body.religiousText,
      unavailableTimes: req.body.unavailableTimes,
      notes: req.body.notes,
      stuffNotes: req.body.stuffNotes,
      isNeedAdditionalRelation: req.body.isNeedAdditionalRelation,
      activeStatus: req.body.activeStatus,
      isFinnishPreparatory: req.body.isFinnishPreparatory,
      isGraduated: req.body.isGraduated,
      isFoundJob: req.body.isFoundJob,
      isJobInStudyFelid: req.body.isJobInStudyFelid,
      // until here is the common part
      isImpact: req.body.isImpact,
      isShachak: req.body.isShachak,
      isForAcademicPoints: req.body.isForAcademicPoints,
      isCityScholarship: req.body.isCityScholarship,
      mathLevel: req.body.mathLevel,
      englishLevel: req.body.englishLevel,
      physicsLevel: req.body.physicsLevel,
      additionalTopics: req.body.additionalTopics,
      isActive: true
    });
    if (req.body.phoneB && req.body.phoneB !== "") {
      tutor.phoneB = req.body.phoneB;
    }
    if (req.body.secondaryStudy && req.body.secondaryStudy !== "") {
      tutor.secondaryStudy = req.body.secondaryStudy;
    }
    try {
      const salt = await bcrypt.genSalt(10);
      tutor.password = await bcrypt.hash(tutor.password, salt);
      tutor = await tutor.save();

      const token = tutor.generateAuthToken();

      const messageToSend = `<p>הסטודנט ${tutor.fname +
        " " +
        tutor.lname} צריך אישור הרשמה</p>`;

      sendToMail(to, "אישור הרשמה למתגבר חדש", messageToSend);

      res.header("x-auth-token", token).send(
        _.pick(tutor, [
          "_id",
          "userType",
          "id",
          "fname",
          "lname",
          "email",
          "phoneA",
          "phoneB",
          "gender",
          "birthDate",
          "maritalStatus",
          "activityArea",
          "institute",
          "mainStudy",
          "secondaryStudy",
          "academicPlan",
          "studyYear",
          "realAddress",
          "currentAddress",
          "activeYears",
          "religiousStatus",
          "religiousText",
          "unavailableTimes",
          "notes",
          "stuffNotes",
          "isNeedAdditionalRelation",
          "activeStatus",
          "isFinnishPreparatory",
          "isGraduated",
          "isFoundJob",
          "isJobInStudyFelid",
          // until here is the common part
          "isImpact",
          "isShachak",
          "isForAcademicPoints",
          "isCityScholarship",
          "mathLevel",
          "englishLevel",
          "physicsLevel",
          "additionalTopics",
          "isActive"
        ])
      );
    } catch (err) {
      res.statusCode = 400;
      res.send(err.message);
    }
  }
});

router.put("/:id", auth, async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  //TODO
  if (
    req.user.type === "admin" ||
    req.user._id == req.params.id ||
    req.user.type === "coordinator"
  ) {
    let tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).send("The tutor with the given ID was not found.");
    } else {
      tutor.id = req.body.id;
      tutor.fname = req.body.fname;
      tutor.lname = req.body.lname;
      tutor.email = req.body.email;
      //TODO old password
      tutor.phoneA = req.body.phoneA;
      tutor.phoneB = req.body.phoneB;
      tutor.birthDate = req.body.birthDate;
      tutor.gender = req.body.gender;
      tutor.maritalStatus = req.body.maritalStatus;
      tutor.activityArea = req.body.activityArea;
      tutor.institute = req.body.institute;
      tutor.mainStudy = req.body.mainStudy;
      tutor.secondaryStudy = req.body.secondaryStudy;
      tutor.academicPlan = req.body.academicPlan;
      tutor.studyYear = req.body.studyYear;
      tutor.realAddress = req.body.realAddress;
      tutor.currentAddress = req.body.currentAddress;
      tutor.activeYears = req.body.activeYears;
      tutor.religiousStatus = req.body.religiousStatus;
      tutor.religiousText = req.body.religiousText;
      tutor.unavailableTimes = req.body.unavailableTimes;
      tutor.notes = req.body.notes;
      tutor.stuffNotes = req.body.stuffNotes;
      tutor.isNeedAdditionalRelation = req.body.isNeedAdditionalRelation;
      tutor.activeStatus = req.body.activeStatus;
      tutor.isFinnishPreparatory = req.body.isFinnishPreparatory;
      tutor.isGraduated = req.body.isGraduated;
      tutor.isFoundJob = req.body.isFoundJob;
      tutor.isJobInStudyFelid = req.body.isJobInStudyFelid;
      // until here is the common part
      tutor.isImpact = req.body.isImpact;
      tutor.isShachak = req.body.isShachak;
      tutor.isForAcademicPoints = req.body.isForAcademicPoints;
      tutor.isCityScholarship = req.body.isCityScholarship;
      tutor.mathLevel = req.body.mathLevel;
      tutor.englishLevel = req.body.englishLevel;
      tutor.physicsLevel = req.body.physicsLevel;
      tutor.additionalTopics = req.body.additionalTopics;
      tutor.isActive = req.body.isActive;

      if (req.body.password) {
        tutor.password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        tutor.password = await bcrypt.hash(tutor.password, salt);
      }
      try {
        tutor = await tutor.save();
        if (!tutor.isActive) {
          await Relation.updateMany(
            { tutor_id: tutor._id },
            { $set: { isActive: false } }
          );
        }
        res.send(
          _.pick(tutor, [
            "_id",
            "userType",
            "id",
            "fname",
            "lname",
            "email",
            "phoneA",
            "phoneB",
            "birthDate",
            "gender",
            "maritalStatus",
            "activityArea",
            "institute",
            "mainStudy",
            "secondaryStudy",
            "academicPlan",
            "studyYear",
            "realAddress",
            "currentAddress",
            "activeYears",
            "religiousStatus",
            "religiousText",
            "unavailableTimes",
            "notes",
            "stuffNotes",
            "isNeedAdditionalRelation",
            "activeStatus",
            "isFinnishPreparatory",
            "isGraduated",
            "isFoundJob",
            "isJobInStudyFelid",
            // until here is the common part
            "isImpact",
            "isShachak",
            "isForAcademicPoints",
            "isCityScholarship",
            "mathLevel",
            "englishLevel",
            "physicsLevel",
            "additionalTopics",
            "isActive"
          ])
        );
      } catch (error) {
        res.status(400).send(error.message);
      }
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const tutor = await Tutor.findByIdAndUpdate(req.params.id)
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");

    if (!tutor)
      return res.status(404).send("The tutor with the given ID was not found.");

    res.send(`החונך ${tutor.fname} ${tutor.lname} אינו זמין לשיבוצים חדשים`);
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/:id", auth, async (req, res) => {
  if (req.user.type === "admin" || req.user._id == req.params.id) {
    const tutor = await Tutor.findById(req.params.id)
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");

    if (!tutor)
      return res.status(404).send("The tutor with the given ID was not found.");

    res.send(
      _.pick(tutor, [
        "_id",
        "userType",
        "id",
        "fname",
        "lname",
        "email",
        "phoneA",
        "phoneB",
        "birthDate",
        "maritalStatus",
        "gender",
        "activityArea",
        "institute",
        "mainStudy",
        "secondaryStudy",
        "academicPlan",
        "studyYear",
        "realAddress",
        "currentAddress",
        "activeYears",
        "religiousStatus",
        "religiousText",
        "unavailableTimes",
        "notes",
        "stuffNotes",
        "isNeedAdditionalRelation",
        "activeStatus",
        "isFinnishPreparatory",
        "isGraduated",
        "isFoundJob",
        "isJobInStudyFelid",
        // until here is the common part
        "isImpact",
        "isShachak",
        "isForAcademicPoints",
        "isCityScholarship",
        "mathLevel",
        "englishLevel",
        "physicsLevel",
        "additionalTopics",
        "isActive"
      ])
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

module.exports = router;
