const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const { Tokens, validateTokens } = require("../models/Tokens");
const tokensRouter = express.Router();
const Joi = require("@hapi/joi");
const _ = require("lodash");

tokensRouter.post("/", async (req, res) => {
  const { error } = validateTokens(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  let tokens = await Tokens.find();

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].token === req.body.token) {
      return res.status(400).send("This token already exists.");
    }
  }
  tokens = new Tokens(req.body);
  await tokens.save();
  res.send("Got to the end successfully");
  console.log("got to the end successfully");
});

//   const token = name.generateAuthToken();
//   if (token) {
//     return res
//       .header("x-auth-token", token)
//       .header("name-token", name.name)
//       .send(_.pick(user, ["_id", "name", "email"]));
//   }
//   return res.status(400).send("Email or password are incorrect");

function validate(req) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return ({ error, value } = schema.validate(req));
}

module.exports = tokensRouter;
