const { Relation } = require("../model/Relation");
const { Report } = require("../model/Report");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Trainee } = require("../model/Trainee");
const { Tutor } = require("../model/Tutor");
const { Coordinator } = require("../model/Coordinator");
const admin = require("../middleware/admin");


router.get("/", auth, async (req, res) => {
  if (req.user.type === "admin") {
    console.time('process1')//TODO remove
    const relations = await Relation.aggregate([
      {$lookup:{from: "tutors", localField: "tutor_id", foreignField: "_id", as: 'tutor_info'}},
      {$lookup: {from: 'trainees', localField: 'trainee_id', foreignField: '_id', as: 'trainee_info'}},
      {$unwind: {path:"$tutor_info", preserveNullAndEmptyArrays:false}},
      {$unwind: {path:"$trainee_info", preserveNullAndEmptyArrays:false}},
      {$lookup:{from: 'areas', localField: 'tutor_info.activityArea', foreignField: '_id', as: 'tutor_area'}},
      {$lookup:{  from: 'areas', localField: 'trainee_info.activityArea', foreignField: '_id', as: 'trainee_area'}},
      {$lookup:{  from: 'institutes', localField: 'tutor_info.institute', foreignField: '_id', as: 'tutor_institute'}},
      {$lookup:{  from: 'institutes', localField: 'trainee_info.institute', foreignField: '_id', as: 'trainee_institute'}},
      {$lookup:{  from: 'academicdetails', localField: 'tutor_info.mainStudy', foreignField: '_id', as: 'tutor_mainStudy'}},
      {$lookup:{  from: 'academicdetails', localField: 'trainee_info.mainStudy', foreignField: '_id', as: 'trainee_mainStudy'}},
      {$project:{
          "isActive":1,"tutor_id._id":"$tutor_id","trainee_id._id":"$trainee_id",
          "tutor_area":1,"trainee_area":1,"tutor_institute":1,
          "trainee_institute":1,"tutor_mainStudy":1,"trainee_mainStudy":1,
          "tutor_info.lname":1,"tutor_info.fname":1,"tutor_info.id":1,
          "trainee_info.lname":1,"trainee_info.fname":1,"trainee_info.id":1,"trainee_info.needsHelpIn":1
        }},
      {$unwind: {path:"$tutor_area", preserveNullAndEmptyArrays:false}},
      {$unwind: {path:"$trainee_area", preserveNullAndEmptyArrays:false}},
      {$unwind: {path:"$tutor_institute", preserveNullAndEmptyArrays:false}},
      {$unwind: {path:"$trainee_institute", preserveNullAndEmptyArrays:false}},
      {$unwind: {path:"$tutor_mainStudy", preserveNullAndEmptyArrays:false}},
      {$unwind: {path:"$trainee_mainStudy", preserveNullAndEmptyArrays:false}},
      {$project:{"isActive":1, "tutor_area":1,"trainee_area":1,"tutor_institute":1,
        "trainee_institute":1,"tutor_mainStudy":1,"trainee_mainStudy":1,
          "tutor_id.lname":"$tutor_info.lname", "tutor_id.fname":"$tutor_info.fname",
          "tutor_id._id":"$tutor_id._id", "trainee_id.lname":"$trainee_info.lname",
          "trainee_id.fname":"$trainee_info.fname","trainee_id._id":"$trainee_id._id",
          "trainee_id.needsHelpIn":"$trainee_info.needsHelpIn"
        }}
    ])
    for (const relation of relations) {
      const totalTime = await Report.aggregate([
        {$match: {tutor_id: relation.tutor_id._id, trainee_id: relation.trainee_id._id}},
        {$group: {_id: null, total: {$sum: "$totalTime"}}}
      ]);
      if (totalTime && Object.keys(totalTime).length === 0) {
        relation['totalTime'] = 0;
      } else {
        relation['totalTime'] = totalTime[0]['total'];
      }
    }
    console.timeEnd('process1');//TODO remove
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
    const relations = await Relation.find({tutor_id: req.user._id})
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
  if (req.user.type === "admin" || req.user.type === "coordinator") {
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
  if (req.user.type === "coordinator" || req.user.type === "admin") {
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
