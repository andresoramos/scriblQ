const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const _ = require("lodash");

// const nameSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     minlength: 1,
//     maxlength: 200,
//   },
// });
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  questions: {
    type: Object,
    required: true,
  },
});

function validateUser(quiz) {
  const schema = Joi.object({
    name: Joi.string().required(),
    questions: Joi.object().required(),
    answer: Joi.array().required(),
  });

  return ({ error, value } = schema.validate(quiz));
}

function validatePost(quiz) {
  const schema = Joi.object({
    ips: Joi.object().required(),
  });
  return ({ error, value } = schema.validate(quiz));
}

const Quiz = mongoose.model("Quiz", userSchema);
module.exports = { Quiz, validateUser, validatePost };
