const { Relation } = require("../model/Relation");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Trainee } = require("../model/Trainee");
const { Tutor } = require("../model/Tutor");
const { Coordinator } = require("../model/Coordinator");
const admin = require("../middleware/admin");

router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const relations = await Relation.find()
      .populate("tutor_id", ["_id", "fname", "lname"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
    res.send(relations);
  } else if (req.user.type === "coordinator") {
    const coordinator = await Coordinator.findById(req.user._id);

    const trainees = await Trainee.find({
      activityArea: coordinator.activityAreas
    });
    const tutors = await Tutor.find({
      activityArea: coordinator.activityAreas
    });
    const relations = await Relation.find({
      $or: [
        {
          trainee_id: trainees.map(trainee => {
            return trainee._id;
          })
        },
        {
          tutor_id: tutors.map(tutor => {
            return tutor._id;
          })
        }
      ]
    })
      .populate("tutor_id", ["_id", "fname", "lname"])
      .populate("trainee_id", ["_id", "fname", "lname"]);
    res.send(relations);
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
  )
    .populate("tutor_id", ["_id", "fname", "lname"])
    .populate("trainee_id", ["_id", "fname", "lname"]);

  if (!relation)
    return res
      .status(404)
      .send("The relation with the given ID was not found.");

  res.send(relation);
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.type == "admin" || req.user.type == "coordinator") {
    const relation = await Relation.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isActive: false }
      },
      { new: true }
    )
      .populate("tutor_id", ["_id", "fname", "lname"])
      .populate("trainee_id", ["_id", "fname", "lname"]);

    if (!relation)
      return res
        .status(404)
        .send("The relation with the given ID was not found.");
    console.log(relation);
    res.send(relation);
  } else {
    res.status(403).send("Access denied");
  }
});

router.get("/:id", auth, async (req, res) => {
  if (req.user.type == "coordinator" || req.user.type == "admin") {
    const relation = await Relation.findById(req.params.id);

    if (!relation)
      return res
        .status(404)
        .send("The relation with the given ID was not found.");

    res.send(relation);
  } else {
    res.status(403).send("Access denied");
  }
});

module.exports = router;
