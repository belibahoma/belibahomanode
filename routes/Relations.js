const { Relation } = require("../model/Relation");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const relations = await Relation.find()
      .populate("tutor_id", ["_id", "fname", "lname"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
    res.send(relations);
  } else if (req.user.type === "coordinator") {
  } else if (req.user.type === "tutor") {
    const relations = await Relation.find({ tutor_id: req.user._id })
      .populate("tutor_id", ["_id", "fname", "lname"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
    res.send(relations);
  }
});

router.post("/", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let relation = await Relation.findOne({
    tutor_id: req.body.tutor_id,
    trainee_id: req.body.trainee_id
  });
  if (relation) {
    res.status(400).send("הקשר כבר קיים במאגר");
  } else {
    relation = new Relation({
      tutor_id: req.body.tutor_id,
      trainee_id: req.body.trainee_id,
      isActive: req.body.isActive != null ? req.body.isActive : true
    });

    try {
      const results = await relation.save();
      res.send(results);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", [auth], async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  const relation = await Relation.findByIdAndUpdate(
    req.params.id,
    {
      tutor_id: req.body.tutor_id,
      trainee_id: req.body.trainee_id,
      isActive: req.body.isActive
    },
    {
      new: true
    }
  );

  if (!relation)
    return res
      .status(404)
      .send("The relation with the given ID was not found.");

  res.send(relation);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const relation = await Relation.findByIdAndRemove(req.params.id);

  if (!relation)
    return res
      .status(404)
      .send("The relation with the given ID was not found.");

  res.send(relation);
});

router.get("/:id", [auth, admin], async (req, res) => {
  const relation = await Relation.findById(req.params.id);

  if (!relation)
    return res
      .status(404)
      .send("The relation with the given ID was not found.");

  res.send(relation);
});

module.exports = router;
