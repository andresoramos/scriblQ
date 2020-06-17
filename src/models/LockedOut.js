const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
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
    _id: Joi.string().max(1000).required(),
    __v: Joi.number().required(),
  });

  return ({ error, value } = schema.validate(ip));
}

function validatePost(ip) {
  const schema = Joi.object({
    ips: Joi.object().required(),
  });
  return ({ error, value } = schema.validate(ip));
}

function validateBannedFix(ip) {
  const schema = Joi.object({
    duplicateArr: Joi.array().required(),
  });
  return ({ error, value } = schema.validate(ip));
}

const LockedOut = mongoose.model("LockedOut", userSchema);
module.exports = { LockedOut, validateUser, validatePost, validateBannedFix };
