const { Tutor } = require("../model/Tutor");
const _ = require("lodash");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  if (req.user.type === "tutor") {
    const tutor = await Tutor.findById(req.user._id).select("-password");
    res.send(tutor);
  } else {
    res.status(401).send("unauthorized");
  }
});

router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const tutors = await Tutor.find()
      .sort("fname")
      .select("-password");
    res.send(tutors);
  } else {
    res.status(401).send("unauthorized");
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
      phoneB: req.body.phoneB,
      birthDate: req.body.birthDate,
      maritalStatus: req.body.maritalStatus,
      activityArea: req.body.activityArea,
      institute: req.body.institute,
      mainStudy: req.body.mainStudy,
      secondaryStudy: req.body.secondaryStudy,
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
      isImpact: req.body.isImpact,
      isShachak: req.body.isShachak,
      isForAcademicPoints: req.body.isForAcademicPoints,
      isCityScholarship: req.body.isCityScholarship,
      mathLevel: req.body.mathLevel,
      englishLevel: req.body.englishLevel,
      physicsLevel: req.body.physicsLevel,
      additionalTopics: req.body.additionalTopics,
      isActive: req.body.isActive
    });
    try {
      const salt = await bcrypt.genSalt(10);
      tutor.password = await bcrypt.hash(tutor.password, salt);
      tutor = await tutor.save();

      const token = tutor.generateAuthToken();

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
          "birthDate",
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
  if (req.user.type === "admin" || req.user._id == req.params.id) {
    let tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).send("The tutor with the given ID was not found.");
    } else {
      tutor.id = req.body.id;
      tutor.fname = req.body.fname;
      tutor.lname = req.body.lname;
      tutor.email = req.body.email;
      //TODO old password
      tutor.password = req.body.password;
      tutor.phoneA = req.body.phoneA;
      tutor.phoneB = req.body.phoneB;
      tutor.birthDate = req.body.birthDate;
      tutor.maritalStatus = req.body.maritalStatus;
      tutor.activityArea = req.body.activityArea;
      tutor.institute = req.body.institute;
      tutor.mainStudy = req.body.mainStudy;
      tutor.secondaryStudy = req.body.secondaryStudy;
      tutor.academicPlan = req.body.academicPlan;
      tutor.studyYear = req.body.studyYear;
      tutor.bankAccount = req.body.bankAccount;
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
      const salt = await bcrypt.genSalt(10);
      tutor.password = await bcrypt.hash(tutor.password, salt);
      try {
        tutor = await tutor.save();
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

router.delete("/:id", async (req, res) => {
  if (req.user.type === "admin") {
    const tutor = await Tutor.findByIdAndRemove(req.params.id);

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

router.get("/:id", async (req, res) => {
  if (req.user.type === "admin" || req.user._id == req.params.id) {
    const tutor = await Tutor.findById(req.params.id);

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
