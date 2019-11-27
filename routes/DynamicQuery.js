// const { createSchema } = require("../model/DynamicSchema");
const { Tutor } = require("../model/Tutor");
const { Trainee } = require("../model/Trainee");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    const academicDetails = await model.find();
    res.send(academicDetails);
  });

module.exports = router;