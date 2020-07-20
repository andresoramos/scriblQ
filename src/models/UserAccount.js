const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const _ = require("lodash");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  quizzes: {
    type: Array,
    required: true,
  },
});

function validateAccount(quiz) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    quizzes: Joi.array().required(),
  });

  return ({ error, value } = schema.validate(quiz));
}

const UserAccount = mongoose.model("UserAccount", userSchema);
module.exports = { UserAccount, validateAccount };
