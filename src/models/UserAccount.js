const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const _ = require("lodash");

const userSchema = new mongoose.Schema({
  userId: {
    type: Object,
    required: true,
  },
  quizzes: {
    type: Array,
    required: true,
  },
  lastId: {
    type: String
  }
});

function validateAccount(quiz) {
  const schema = Joi.object({
    user: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
  });

  return ({ error, value } = schema.validate(quiz));
}

const UserAccount = mongoose.model("UserAccount", userSchema);
module.exports = { UserAccount, validateAccount };
