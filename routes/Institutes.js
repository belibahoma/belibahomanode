const { Institute } = require("../model/Institute");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const institutes = await Institute.find().sort("name");
  res.send(institutes);
});

router.post("/", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let institute = await Institute.findOne({ name: req.body.name });
  if (institute) {
    res.status(400).send("המוסד כבר קיים במאגר");
  } else {
    institute = new Institute({
      name: req.body.name,
      type: req.body.type
    });

    try {
      const results = await institute.save();
      res.send(results);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  const institute = await Institute.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      type: req.body.type
    },
    {
      new: true
    }
  );

  if (!institute)
    return res
      .status(404)
      .send("The institute with the given ID was not found.");

  res.send(institute);
});

router.delete("/:id", async (req, res) => {
  const institute = await Institute.findByIdAndRemove(req.params.id);

  if (!institute)
    return res
      .status(404)
      .send("The institute with the given ID was not found.");

  res.send(institute);
});

router.get("/:id", async (req, res) => {
  const institute = await Institute.findById(req.params.id);

  if (!institute)
    return res
      .status(404)
      .send("The institute with the given ID was not found.");

  res.send(institute);
});

module.exports = router;
