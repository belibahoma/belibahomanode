const { Report } = require("../model/Report");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const reports = await Report.find().sort("name");
  res.send(reports);
});

router.post("/", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let report = await Report.findOne({
    tutorId: req.body.tutorId,
    type: req.body.type,
    date: req.body.date
  });
  console.log(report, req.body.tutorId, req.body.type, req.body.date);
  if (report) {
    res.status(400).send("הדיווח כבר קיים במאגר");
  } else {
    report = new Report({
      tutorId: req.body.tutorId,
      type: req.body.type,
      location: req.body.location,
      isCasingApproved: req.body.isCasingApproved,
      date: req.body.date,
      description: req.body.description,
      knowledgeRank: req.body.knowledgeRank,
      connectionRank: req.body.connectionRank,
      isNeedAdmin: req.body.isNeedAdmin,
      studyTime: req.body.studyTime ? req.body.studyTime : 0,
      chavrutaTime: req.body.chavrutaTime ? req.body.chavrutaTime : 0,
      casingTime: req.body.casingTime ? req.body.casingTime : 0,
      reportTime: req.body.reportTime ? req.body.reportTime : 0,
      serveTime: req.body.serveTime,
      isServe: req.body.isServe,
      isBirth: req.body.isBirth,
      isMarriage: req.body.isMarriage,
      isDeathOfFirstDegree: req.body.isDeathOfFirstDegree,
      isHappened: req.body.isHappened,
      traineeId: req.body.traineeId,
      spacialMissions: req.body.spacialMissions
    });

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
          );
        }
      : 0;

    report.timeForTrainee = report.isHappened
      ? report.studyTime + report.chavrutaTime
      : 0;

    try {
      const results = await report.save();
      res.send(results);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  let report = await Report.findById(req.params.id);

  if (!report)
    return res.status(404).send("The report with the given ID was not found.");

  report.tutorId = req.body.tutorId;
  report.type = req.body.type;
  report.location = req.body.location;
  report.isCasingApproved = req.body.isCasingApproved;
  report.date = req.body.date;
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
  report.traineeId = req.body.traineeId;
  report.spacialMissions = req.body.spacialMissions;

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
        );
      }
    : 0;

  report.timeForTrainee = report.isHappened
    ? report.studyTime + report.chavrutaTime
    : 0;

  try {
    report = await report.save();
    res.send(report);
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
  const report = await Report.findById(req.params.id);

  if (!report)
    return res.status(404).send("The report with the given ID was not found.");

  res.send(report);
});

module.exports = router;
