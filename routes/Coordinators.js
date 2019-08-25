const { Coordinator } = require("../model/Coordinator");
const _ = require("lodash");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  if (req.user.type === "coordinator") {
    const coordinator = await Coordinator.findById(req.user._id).select(
      "-password"
    );
    res.send(coordinator);
  } else {
    res.status(401).send("unauthorized");
  }
});

router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const coordinators = await Coordinator.find().sort("fname");
    res.send(
      coordinators.map(coordinator => {
        return _.pick(coordinator, [
          "_id",
          "userType",
          "id",
          "fname",
          "lname",
          "email",
          "phone",
          "activityAreas"
        ]);
      })
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

router.post("/", auth, async (req, res) => {
  //TODO
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  if (req.user.type === "admin") {
    let coordinator = await Coordinator.findOne({ id: req.body.id });
    if (coordinator) {
      res.statusCode = 400;
      res.send("the user already exists");
    } else {
      coordinator = new Coordinator({
        userType: "coordinator",
        id: req.body.id,
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        activityAreas: req.body.activityAreas
      });
      try {
        const salt = await bcrypt.genSalt(10);
        coordinator.password = await bcrypt.hash(coordinator.password, salt);
        coordinator = await coordinator.save();

        const token = coordinator.generateAuthToken();

        res
          .header("x-auth-token", token)
          .send(
            _.pick(coordinator, [
              "_id",
              "userType",
              "id",
              "fname",
              "lname",
              "email",
              "phone",
              "activityAreas"
            ])
          );
      } catch (err) {
        res.statusCode = 400;
        res.send(err.message);
      }
    }
  } else {
    res.status(401).send("unauthorized");
  }
});

router.put("/:id", auth, async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  //TODO
  if (req.user.type === "admin" || req.user._id == req.params.id) {
    let coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) {
      return res
        .status(404)
        .send("The coordinator with the given ID was not found.");
    } else {
      coordinator.id = req.body.id;
      coordinator.fname = req.body.fname;
      coordinator.lname = req.body.lname;
      coordinator.email = req.body.email;
      coordinator.phone = req.body.phone;
      coordinator.activityAreas = req.body.activityAreas;
      try {
        if(!req.body.password){
          coordinator.password = req.body.password;
          const salt = await bcrypt.genSalt(10);
          coordinator.password = await bcrypt.hash(coordinator.password, salt);
        }

        coordinator = await coordinator.save();
        res.send(
          _.pick(coordinator, [
            "_id",
            "userType",
            "id",
            "fname",
            "lname",
            "email",
            "phone",
            "activityAreas"
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
    const coordinator = await Coordinator.findByIdAndRemove(req.params.id);

    if (!coordinator)
      return res
        .status(404)
        .send("The coordinator with the given ID was not found.");

    res.send(
      _.pick(coordinator, [
        "_id",
        "userType",
        "id",
        "fname",
        "lname",
        "email",
        "phone",
        "activityAreas"
      ])
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

router.get("/:id", auth, async (req, res) => {
  if (req.user.type === "admin" || req.user._id == req.params.id) {
    const coordinator = await Coordinator.findById(req.params.id);

    if (!coordinator)
      return res
        .status(404)
        .send("The coordinator with the given ID was not found.");

    res.send(
      _.pick(coordinator, [
        "_id",
        "userType",
        "id",
        "fname",
        "lname",
        "email",
        "phone",
        "activityAreas"
      ])
    );
  } else {
    res.status(401).send("unauthorized");
  }
});

module.exports = router;
