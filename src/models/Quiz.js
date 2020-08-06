const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const _ = require("lodash");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  questions: {
    type: Array,
    required: true,
  },
  creationNumber: {
    type: Number,
    required: true,
  },
});

function validateUser(quiz) {
  const schema = Joi.object({
    name: Joi.string().required(),
    questions: Joi.array().required(),
  });

  return ({ error, value } = schema.validate(quiz));
}

const Quiz = mongoose.model("Quiz", userSchema);
module.exports = { Quiz, validateUser };
