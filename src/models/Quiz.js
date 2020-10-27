const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const _ = require("lodash");

const userSchema = new mongoose.Schema(
  {
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
    creatorId: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
    },
    dislikes: {
      type: Number,
    },
  },
  { minimize: false }
);

function validateUser(quiz) {
  const schema = Joi.object({
    name: Joi.string().required(),
    questions: Joi.array().required(),
    creatorId: Joi.string().required(),
  });

  return ({ error, value } = schema.validate(quiz));
}

const Quiz = mongoose.model("Quiz", userSchema);
module.exports = { Quiz, validateUser };
