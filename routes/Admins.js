const { Admin } = require("../model/Admin");
const { Trainee } = require("../model/Trainee");
const { Tutor } = require("../model/Tutor");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const admin = await Admin.findById(req.user._id).select("-password");
    return res.send(admin);
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/", auth, async (req, res) => {
  const user = req.user;
  console.log(user);

  if (user.type == "admin") {
    const admins = await Admin.find()
      .sort("fname")
      .select("-password");

    res.send(admins);
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.post("/", async (req, res) => {
  //TODO
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  // const user = req.user;
  // if (user.type == "admin") {
  //   let admin = await Admin.findOne({ id: req.body.id });
  //   if (admin) {
  //     res.statusCode = 400;
  //     res.send("the user already exists");
  //   } else {
  admin = new Admin({
    userType: "admin",
    id: req.body.id,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone
  });

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);

  try {
    admin = await admin.save();

    const token = admin.generateAuthToken();

    res
      .header("x-auth-token", token)
      .send(
        _.pick(admin, [
          "_id",
          "userType",
          "id",
          "fname",
          "lname",
          "email",
          "phone"
        ])
      );
  } catch (err) {
    res.statusCode = 400;
    res.send(err.message);
  }
  // }
  // } else {
  //   res.status(401).send("Unauthorized");
  // }
});

router.get("/approve/trainee/:id", auth, async (req, res) => {
  if (req.user.type === "admin") {
    try {
      const user = await Trainee.findById(req.user._id);
      user.isApproved = true;
      user.isActive = true;
      user.save();
      return res.send(`${user.fname} ${user.lname} approved successfully`);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/approve/tutor/:id", auth, async (req, res) => {
  if (req.user.type === "admin") {
    try {
      const user = await Tutor.findById(req.user._id);
      user.isApproved = true;
      user.isActive = true;
      user.save();
      return res.send(`${user.fname} ${user.lname} is approved successfully`);
    } catch (error) {
      return res.status(400).send(error.message);
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.put("/:id", auth, async (req, res) => {
  //   const { error } = validate(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);
  //TODO

  if (req.user.type === "admin") {
    let admin = await Admin.findById(req.params.id);
    if (!admin)
      return res.status(404).send("The admin with the given ID was not found.");

    admin.id = req.body.id;
    admin.fname = req.body.fname;
    admin.lname = req.body.lname;
    admin.email = req.body.email;
    admin.password = req.body.password ? req.body.password : admin.password;
    admin.phone = req.body.phone;

    try {
      admin = await admin.save();
      res.send(
        _.pick(admin, [
          "_id",
          "userType",
          "id",
          "fname",
          "lname",
          "email",
          "phone"
        ])
      );
    } catch (error) {
      res.status(400).send(error.message);
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const admin = await Admin.findByIdAndRemove(req.params.id);

    if (!admin)
      return res.status(404).send("The admin with the given ID was not found.");

    res.send(
      _.pick(admin, [
        "_id",
        "userType",
        "id",
        "fname",
        "lname",
        "email",
        "phone"
      ])
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/:id", auth, async (req, res) => {
  if (req.user.type === "admin") {
    const admin = await Admin.findById(req.params.id).select("-password");

    if (!admin)
      return res.status(404).send("The admin with the given ID was not found.");

    res.send(admin);
  } else {
    res.status(401).send("Unauthorized");
  }
});

module.exports = router;
