const express = require("express");
const reset = express.Router();
const Joi = require("@hapi/joi");
const generatePasswordResetToken = require("../Services/passwordReset");
const bcrypt = require("bcrypt");
const jwt_decode = require("jwt-decode");
const { User } = require("../models/Users");

reset.post("/", async (req, res) => {
  const { body } = req;
  const allowed = validateReset(body);
  if (allowed.error) {
    console.log("Error: ", allowed.error.details[0].message);
    return res.status(400).send(allowed.error.details[0].message);
  }
  let found;
  try {
    const email = { email: body.email };
    found = await User.findOne(email);
  } catch (err) {
    console.log("This is the error: ", err);
  }
  if (found) {
    const tokenData = { ...body };
    tokenData.dateCreated = new Date(Date.now());
    const month = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    tokenData.expiration = month;
    const token = generatePasswordResetToken(tokenData);
    return res.status(200).send(token);
  } else {
    return res.status(400).send("Email not in Database.");
  }
});

reset.put("/", async (req, res) => {
  let tokenData;
  const updateSchema = {
    password: Joi.string().min(8).max(100).required(),
    token: Joi.string().min(3).max(1500),
  };
  const allowed = validateAll(req.body, updateSchema);
  if (allowed.error) {
    console.log("getting to the error section");
    console.log("Error: ", allowed.error.details[0].message);
    return res.status(400).send(allowed.error.details[0].message);
  }
  tokenData = jwt_decode(req.body.token);
  const tokenDataDate = new Date(tokenData.expiration);
  const currentDate = new Date(Date.now());
  if (tokenDataDate <= currentDate) {
    return res.status(400).send("Token is expired");
  }
  if (!tokenData.isAllowed) {
    return res.status(400).send("Account is not allowed to alter password");
  }

  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(req.body.password, salt);

  const updated = await User.update(
    { email: tokenData.email },
    { $set: { password: newPassword } }
  );
  if (updated) {
    return res.send({ response: updated });
  }
});

function validateReset(user) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).max(100).required(),
    isAllowed: Joi.boolean().required(),
  });

  return ({ error, value } = schema.validate(user));
}

function validateAll(user, schemaObject) {
  const schema = Joi.object(schemaObject);

  return ({ error, value } = schema.validate(user));
}

module.exports = reset;
