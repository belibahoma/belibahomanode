const { Trainee } = require("../model/Trainee");
const _ = require("lodash");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const linkToWebsite = "localhost:3000/alerts";
const admin = require("../middleware/admin");
const sendToMail = require("../utils/mailSender");
const to = "belibahoma@gmail.com";
const { Coordinator } = require("../model/Coordinator");

router.get("/me", auth, async (req, res) => {
  if (req.user.type === "trainee") {
    const trainee = await Trainee.findById(req.user._id)
      .select("-password -stuffNotes")
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");
    res.send(trainee);
  } else {
    res.status(401).send("unauthorized");
  }
});

router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const trainees = await Trainee.find()
      .sort("fname")
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");
    res.send(
      trainees.map(trainee => {
        return _.pick(trainee, [
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
          "bankAccount",
          "realAddress",
          "currentAddress",
          "activeYears",
          "religiousStatus",
          "religiousText",
          "unavailableTimes",
          "notes",
          "isNeedAdditionalRelation",
          "activeStatus",
          "isFinnishPreparatory",
          "isGraduated",
          "isFoundJob",
          "stuffNotes",
          "isJobInStudyFelid",
          // until here is the common part
          "isInMagid",
          "isLiveInSelectedCities",
          "isRegisteredToKivun",
          "needsHelpIn",
          "workStatus",
          "workTitle",
          "isLearnedInYeshiva",
          "yeshivaTimes",
          "isHaveAnotherProfessionalTraining",
          "previousProfession",
          "isHaveAnotherDegree",
          "previousDegree",
          "WantDetailsAbout",
          "isServed",
          "mathLevel",
          "englishLevel",
          "physicsLevel",
          "additionalTopics",
          "isActive",
          "leavingReason",
          "isDropped",
          "isApproved"
        ]);
      })
    );
  } else if (req.user.type === "coordinator") {
    const coordinator = await Coordinator.findById(req.user._id);
    // console.log(coordinator);

    const trainees = await Trainee.find({
      activityArea: coordinator.activityAreas
    })
      .sort("fname")
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");
    // console.log("trainees", trainees);

    res.send(
      trainees.map(trainee => {
        return _.omit(trainee, "password");
      })
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

router.post("/approve/:id", [auth, admin], async (req, res) => {
  let trainee = await Trainee.findByIdAndUpdate(
    req.params.id,
    {
      $set: { isApproved: true }
    },
    { new: true }
  );

  if (!trainee) {
    return res.status(500).send("משהו השתבש");
  } else {
    res.send("החונך אושר בהצלחה");
  }
});

router.post("/", async (req, res) => {
  //TODO
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let trainee = await Trainee.findOne({ id: req.body.id });
  if (trainee) {
    res.statusCode = 400;
    res.send("the user already exists");
  } else {
    trainee = new Trainee({
      userType: "trainee",
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
      bankAccount: req.body.bankAccount,
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
      isInMagid: req.body.isInMagid,
      isLiveInSelectedCities: req.body.isLiveInSelectedCities,
      isRegisteredToKivun: req.body.isRegisteredToKivun,
      needsHelpIn: req.body.needsHelpIn,
      workStatus: req.body.workStatus,
      workTitle: req.body.workTitle,
      isLearnedInYeshiva: req.body.isLearnedInYeshiva,
      yeshivaTimes: req.body.yeshivaTimes,
      isHaveAnotherProfessionalTraining:
        req.body.isHaveAnotherProfessionalTraining,
      previousProfession: req.body.previousProfession,
      isHaveAnotherDegree: req.body.isHaveAnotherDegree,
      previousDegree: req.body.previousDegree,
      WantDetailsAbout: req.body.WantDetailsAbout,
      isServed: req.body.isServed,
      mathLevel: req.body.mathLevel === "N/A" ? 0 : req.body.mathLevel,
      englishLevel: req.body.englishLevel === "N/A" ? 0 : req.body.englishLevel,
      physicsLevel: req.body.physicsLevel === "N/A" ? 0 : req.body.physicsLevel,
      additionalTopics: req.body.additionalTopics,
      isActive: req.body.isActive,
      leavingReason: req.body.leavingReason,
      isDropped: req.body.isDropped
    });
    if (req.body.phoneB && req.body.phoneB !== "") {
      trainee.phoneB = req.body.phoneB;
    }
    if (req.body.secondaryStudy && req.body.secondaryStudy !== "") {
      trainee.secondaryStudy = req.body.secondaryStudy;
    }
    console.log(req.body);
    try {
      const salt = await bcrypt.genSalt(10);
      trainee.password = await bcrypt.hash(trainee.password, salt);
      trainee = await trainee.save();

      const token = trainee.generateAuthToken();

      const messageToSend = `<p>הסטודנט ${trainee.fname +
        " " +
        trainee.lname} צריך אישור הרשמה</p>`;

      sendToMail(to, "אישור הרשמה לסטודנט חרדי חדש", messageToSend);

      res.header("x-auth-token", token).send(
        _.pick(trainee, [
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
          "bankAccount",
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
          "isInMagid",
          "isLiveInSelectedCities",
          "isRegisteredToKivun",
          "needsHelpIn",
          "workStatus",
          "workTitle",
          "isLearnedInYeshiva",
          "yeshivaTimes",
          "isHaveAnotherProfessionalTraining",
          "previousProfession",
          "isHaveAnotherDegree",
          "previousDegree",
          "WantDetailsAbout",
          "isServed",
          "mathLevel",
          "englishLevel",
          "physicsLevel",
          "additionalTopics",
          "isActive",
          "leavingReason",
          "isDropped",
          "isApproved"
        ])
      );
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", auth, async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  //TODO
  console.log(req.body.id);
  if (
    req.user.type === "admin" ||
    req.user._id == req.params.id ||
    req.user.type === "coordinator"
  ) {
    let trainee = await Trainee.findById(req.params.id);
    if (!trainee) {
      return res
        .status(404)
        .send("The trainee with the given ID was not found.");
    } else {
      trainee.id = req.body.id;
      trainee.fname = req.body.fname;
      trainee.lname = req.body.lname;
      trainee.email = req.body.email;
      //TODO change password case
      trainee.phoneA = req.body.phoneA;
      trainee.phoneB = req.body.phoneB;
      trainee.birthDate = req.body.birthDate;
      trainee.maritalStatus = req.body.maritalStatus;
      trainee.gender = req.body.gender;
      trainee.activityArea = req.body.activityArea;
      trainee.institute = req.body.institute;
      trainee.mainStudy = req.body.mainStudy;
      trainee.secondaryStudy = req.body.secondaryStudy;
      trainee.academicPlan = req.body.academicPlan;
      trainee.studyYear = req.body.studyYear;
      trainee.bankAccount = req.body.bankAccount;
      trainee.realAddress = req.body.realAddress;
      trainee.currentAddress = req.body.currentAddress;
      trainee.activeYears = req.body.activeYears;
      trainee.religiousStatus = req.body.religiousStatus;
      trainee.religiousText = req.body.religiousText;
      trainee.unavailableTimes = req.body.unavailableTimes;
      trainee.notes = req.body.notes;
      trainee.stuffNotes = req.body.stuffNotes;
      trainee.isNeedAdditionalRelation = req.body.isNeedAdditionalRelation;
      trainee.activeStatus = req.body.activeStatus;
      trainee.isFinnishPreparatory = req.body.isFinnishPreparatory;
      trainee.isGraduated = req.body.isGraduated;
      trainee.isFoundJob = req.body.isFoundJob;
      trainee.isJobInStudyFelid = req.body.isJobInStudyFelid;
      // until here is the common part
      trainee.isImpact = req.body.isImpact;
      trainee.isShachak = req.body.isShachak;
      trainee.isForAcademicPoints = req.body.isForAcademicPoints;
      trainee.isCityScholarship = req.body.isCityScholarship;
      trainee.mathLevel = req.body.mathLevel;
      trainee.englishLevel = req.body.englishLevel;
      trainee.physicsLevel = req.body.physicsLevel;
      trainee.additionalTopics = req.body.additionalTopics;
      trainee.isActive = true;
      try {
        if (req.body.password) {
          trainee.password = req.body.password;
          const salt = await bcrypt.genSalt(10);
          trainee.password = await bcrypt.hash(trainee.password, salt);
        }
        trainee = trainee.save();
        res.send(
          _.pick(trainee, [
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
            "bankAccount",
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
            "isInMagid",
            "isLiveInSelectedCities",
            "isRegisteredToKivun",
            "needsHelpIn",
            "workStatus",
            "workTitle",
            "isLearnedInYeshiva",
            "yeshivaTimes",
            "isHaveAnotherProfessionalTraining",
            "previousProfession",
            "isHaveAnotherDegree",
            "previousDegree",
            "WantDetailsAbout",
            "isServed",
            "mathLevel",
            "englishLevel",
            "physicsLevel",
            "additionalTopics",
            "isActive",
            "leavingReason",
            "isDropped",
            "isApproved"
          ])
        );
      } catch (error) {
        res.status(400).send(error.message);
      }
    }
  } else {
    res.status(401).send("unauthorized");
  }
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const trainee = await Trainee.findByIdAndUpdate(req.params.id)
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");

    if (!trainee)
      return res
        .status(404)
        .send("The trainee with the given ID was not found.");

    res.send(
      `החניך ${trainee.fname} ${trainee.lname} אינו זמין לשיבוצים חדשים`
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

router.get("/:id", auth, async (req, res) => {
  if (req.user.type === "admin" || req.user._id == req.params.id) {
    const trainee = await Trainee.findById(req.params.id)
      .populate("institute")
      .populate("activityArea")
      .populate("mainStudy")
      .populate("secondaryStudy");

    if (!trainee)
      return res
        .status(404)
        .send("The trainee with the given ID was not found.");

    res.send(
      _.pick(trainee, [
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
        "bankAccount",
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
        "isInMagid",
        "isLiveInSelectedCities",
        "isRegisteredToKivun",
        "needsHelpIn",
        "workStatus",
        "workTitle",
        "isLearnedInYeshiva",
        "yeshivaTimes",
        "isHaveAnotherProfessionalTraining",
        "previousProfession",
        "isHaveAnotherDegree",
        "previousDegree",
        "WantDetailsAbout",
        "isServed",
        "mathLevel",
        "englishLevel",
        "physicsLevel",
        "additionalTopics",
        "isActive",
        "leavingReason",
        "isDropped",
        "isApproved"
      ])
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

module.exports = router;
