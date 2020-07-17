const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/Users");
const authRouter = express.Router();
const Joi = require("@hapi/joi");
const _ = require("lodash");

// function trackIp (req){
//   const ip = req.ip;
//   let ipTracker = {};
//   if(!ipTracker.ip)
//   ipTracker.ip = ip

// }

authRouter.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let user = await User.find();

  let name;

  for (var i = 0; i < user.length; i++) {
    if (user[i].name === req.body.name || user[i].email === req.body.name) {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user[i].password
      );
      if (!validPassword) {
        return res.status(400).send("Invalid email or password");
      }
      name = await User.findById(user[i]._id);
    }
  }

  const token = name.generateAuthToken();
  if (token) {
    return res
      .header("x-auth-token", token)
      .header("name-token", name.name)
      .send(_.pick(user, ["_id", "name", "email"]));
  }
  return res.status(400).send("Email or password are incorrect");
});

function validate(req) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return ({ error, value } = schema.validate(req));
}

module.exports = authRouter;
