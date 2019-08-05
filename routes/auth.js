const { Admin } = require("../model/Admin");
const { Coordinator } = require("../model/Coordinator");
const { Tutor } = require("../model/Tutor");
const { Trainee } = require("../model/Trainee");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  //TODO
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let admin = await Admin.findOne({ id: req.body.username });
  let coordinator = await Coordinator.findOne({ id: req.body.username });
  let trainee = await Trainee.findOne({ id: req.body.username });
  let tutor = await Tutor.findOne({ id: req.body.username });
  if (!admin && !coordinator && !trainee && !tutor) {
    res.statusCode = 400;
    res.send("Invalid username or password");
  } else {
    const user = await [admin, coordinator, trainee, tutor].find(user => {
      return user ? bcrypt.compare(req.body.password, user.password) : false;
    });
    if (!user) {
      res.statusCode = 400;
      res.send("Invalid username or password");
    } else {
      const token = user.generateAuthToken();
      res.send(token);
    }
  }
});

module.exports = router;
