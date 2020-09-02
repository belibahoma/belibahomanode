const { Report } = require("../model/Report");
const auth = require("../middleware/auth");
const Coordinator = require("../model/Coordinator");
const Tutor = require("../model/Tutor");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  let reports = [];
  if (req.user.type === "admin") {
    reports = await Report.find()
      .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
  } else if (req.user.type === "coordinator") {
    const coordinator = Coordinator.find({ _id: req.user._id });
    const tutors = Tutor.find({ activityArea: coordinator.activityArea });
    const tutorArray = tutors.map(tutor => {
      return tutor._id;
    });
    reports = await Report.find({ tutor_id: tutorArray })
      .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
  } else if (req.user.type === "tutor") {
    reports = await Report.find({ tutor_id: req.user._id })
      .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
  } else if (req.user.type === "trainee") {
    reports = await Report.find({ trainee_id: req.user._id })
      .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
  }

  res.send(reports);
});

router.post("/", auth, async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  let report = await Report.findOne({
    tutor_id: req.body.tutor_id,
    trainee_id: req.body.trainee_id,
    type: req.body.type,
    date: req.body.date
  });
  if (report) {
    res.status(400).send("הדיווח כבר קיים במאגר");
  } else {
    report = new Report({
      tutor_id: req.body.tutor_id,
      type: req.body.type,
      location: req.body.location,
      isCasingApproved: req.body.isCasingApproved,
      date: req.body.date,
      from: req.body.from,
      to: req.body.to,
      description: req.body.description,
      knowledgeRank: req.body.knowledgeRank,
      connectionRank: req.body.connectionRank,
      isNeedAdmin: req.body.isNeedAdmin,
      studyTime: req.body.studyTime ? req.body.studyTime : 0,
      chavrutaTime: req.body.chavrutaTime ? req.body.chavrutaTime : 0,
      casingTime: req.body.casingTime ? req.body.casingTime : 0,
      reportTime: req.body.reportTime ? req.body.reportTime : 0,
      serveTime: req.body.serveTime || false,
      isServe: req.body.isServe || false,
      isBirth: req.body.isBirth || false,
      isMarriage: req.body.isMarriage || false,
      isDeathOfFirstDegree: req.body.isDeathOfFirstDegree || false,
      isHappened: req.body.isHappened || false,
      spacialMissions: req.body.spacialMissions || "",
      reportYear: req.body.reportYear || "תשפ",
    });

    if (req.body.trainee_id && req.body.trainee_id !== "error") {
      report.trainee_id = req.body.trainee_id;
    }
    report.totalTime =
      report.studyTime +
      report.chavrutaTime +
      report.casingTime +
      report.reportTime;
    report.totalTime += report.spacialMissions
      ? report.spacialMissions.totalTime
      : 0;
    report.totalTime += report.isBirth ? 8 : 0;
    report.totalTime += report.isMarriage ? 8 : 0;
    report.totalTime += report.isDeathOfFirstDegree ? 20 : 0;
    report.totalTime += report.isServe ? calculateServe(report) : 0;

    function calculateServe(report) {
      const { serveTime } = report;
      const num = Math.round(
        (serveTime.end - serveTime.start) / (1000 * 60 * 60 * 24)
      );
      console.log("num", num);
      return num > 21 ? num + 5 : num;
    }

    report.timeForTrainee = report.isHappened
      ? report.studyTime + report.chavrutaTime
      : 0;

    try {
      const results = await report.save();
      res.send(
        results
          .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
          .populate("trainee_id", ["_id", "fname", "lname"])
      );
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", auth, async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  let report = await Report.findById(req.params.id);

  if (!report)
    return res.status(404).send("The report with the given ID was not found.");

  report.tutor_id = req.body.tutor_id;
  report.type = req.body.type;
  report.location = req.body.location;
  report.isCasingApproved = req.body.isCasingApproved;
  report.date = req.body.date;
  report.from = req.body.from;
  report.to = req.body.to;
  report.description = req.body.description;
  report.isNeedAdmin = req.params.isNeedAdmin;
  report.knowledgeRank = req.body.knowledgeRank;
  report.connectionRank = req.body.connectionRank;
  report.studyTime = req.body.studyTime ? req.body.studyTime : 0;
  report.chavrutaTime = req.body.chavrutaTime ? req.body.chavrutaTime : 0;
  report.casingTime = req.body.casingTime ? req.body.casingTime : 0;
  report.reportTime = req.body.reportTime ? req.body.reportTime : 0;
  report.serveTime = req.body.serveTime;
  report.isServe = req.body.isServe;
  report.isBirth = req.body.isBirth;
  report.isMarriage = req.body.isMarriage;
  report.isDeathOfFirstDegree = req.body.isDeathOfFirstDegree;
  report.isHappened = req.body.isHappened;
  report.trainee_id = req.body.trainee_id;
  report.spacialMissions = req.body.spacialMissions;
  report.reportYear = req.body.reportYear || "תשפ";

  report.totalTime =
    report.studyTime +
    report.chavrutaTime +
    report.casingTime +
    report.reportTime;
  report.totalTime += report.spacialMissions
    ? report.spacialMissions.totalTime
    : 0;
  report.totalTime += report.isBirth ? 8 : 0;
  report.totalTime += report.isMarriage ? 8 : 0;
  report.totalTime += report.isDeathOfFirstDegree ? 20 : 0;
  report.totalTime += report.isServe
    ? function() {
        return Math.round(
          (report.serveTime.end - report.serveTime.start) /
            (1000 * 60 * 60 * 24)
          //TODO add 5 hours to above 20 days
        );
      }
    : 0;

  report.timeForTrainee = report.isHappened
    ? report.studyTime + report.chavrutaTime
    : 0;

  try {
    report = await report.save();
    res.send(
      report
        .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
        .populate("trainee_id", ["_id", "fname", "lname"])
    );
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  const report = await Report.findByIdAndRemove(req.params.id);

  if (!report)
    return res.status(404).send("The report with the given ID was not found.");

  res.send(report);
});

router.get("/:id", async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate("tutor_id", ["_id", "fname", "lname", "isImpact"])
    .populate("trainee_id", ["_id", "fname", "lname"]);

  if (!report)
    return res.status(404).send("The report with the given ID was not found.");

  res.send(report);
});

module.exports = router;
