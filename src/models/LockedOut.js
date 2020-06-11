const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");

const userSchema = new mongoose.Schema({
  ips: {
    type: Object,
    required: true,
  },
});

function validateUser(ip) {
  const schema = Joi.object({
    ips: Joi.object().required(),
  });

  return ({ error, value } = schema.validate(ip));
}

const LockedOut = mongoose.model("LockedOut", userSchema);
module.exports = { LockedOut, validateUser };
