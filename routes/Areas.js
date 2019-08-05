const { Area } = require("../model/Area");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const areas = await Area.find().sort("name");
  res.send(areas);
});

router.post("/", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  let area = await Area.findOne({ name: req.body.name });
  if (area) {
    res.status(400).send("האיזור כבר קיים במאגר");
  } else {
    area = new Area({
      name: req.body.name
    });

    try {
      const results = await area.save();
      res.send(results);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});

router.put("/:id", async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  const area = await Area.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name
    },
    {
      new: true
    }
  );

  if (!area)
    return res.status(404).send("The area with the given ID was not found.");

  res.send(area);
});

router.delete("/:id", async (req, res) => {
  const area = await Area.findByIdAndRemove(req.params.id);

  if (!area)
    return res.status(404).send("The area with the given ID was not found.");

  res.send(area);
});

router.get("/:id", async (req, res) => {
  const area = await Area.findById(req.params.id);

  if (!area)
    return res.status(404).send("The area with the given ID was not found.");

  res.send(area);
});

module.exports = router;
