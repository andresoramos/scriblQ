const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");

const userSchema = new mongoose.Schema(
  {
    ips: {
      type: Object,
      required: true,
    },
  },
  { minimize: false }
);

function validateUser(user) {
  const schema = Joi.object({
    ips: Joi.object().required(),
  });

  return ({ error, value } = schema.validate(user));
}

const IpTracker = mongoose.model("IpTracker", userSchema);
module.exports = { IpTracker, validateUser };
