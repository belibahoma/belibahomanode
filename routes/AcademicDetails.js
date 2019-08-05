const { AcademicDetail } = require("../model/AcademicDetail");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const academicDetails = await AcademicDetail.find().sort("name");
  res.send(academicDetails);
});

router.post("/", [auth, admin], async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let academicDetail = await AcademicDetail.findOne({ name: req.body.name });
  if (academicDetail) {
    res.status(400).send("המסלול כבר קיים במאגר");
  } else {
    academicDetail = new AcademicDetail({
      name: req.body.name,
      type: req.body.type
    });

    try {
      const results = await academicDetail.save();
      res.send(results);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  const academicDetail = await AcademicDetail.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      type: req.body.type
    },
    {
      new: true
    }
  );

  if (!academicDetail)
    return res
      .status(404)
      .send("The academicDetail with the given ID was not found.");

  res.send(academicDetail);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const academicDetail = await AcademicDetail.findByIdAndRemove(req.params.id);

  if (!academicDetail)
    return res
      .status(404)
      .send("The academicDetail with the given ID was not found.");

  res.send(academicDetail);
});

router.get("/:id", async (req, res) => {
  const academicDetail = await AcademicDetail.findById(req.params.id);

  if (!academicDetail)
    return res
      .status(404)
      .send("The academicDetail with the given ID was not found.");

  res.send(academicDetail);
});

module.exports = router;
