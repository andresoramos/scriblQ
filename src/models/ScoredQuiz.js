const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const _ = require("lodash");

const scoredQuizSchema = new mongoose.Schema(
  {
    relatedId: {
      type: String,
      required: true,
    },

    score: {
      type: Object,
      required: true,
    },
    dateTaken: {
      type: String,
    },
    takenBy: { type: String, required: true },
  },
  { minimize: false }
);

function validateScoredObject(quiz) {
  const schema = Joi.object({
    earned: Joi.number().required(),
    possible: Joi.number().required(),
    specifics: Joi.object().required(),
    idNumber: Joi.string().min(1).max(10000),
    userId: Joi.string().min(1).max(10000),
  });

  return ({ error, value } = schema.validate(quiz));
}

const ScoredQuiz = mongoose.model("ScoredQuiz", scoredQuizSchema);
module.exports = { ScoredQuiz, validateScoredObject };
