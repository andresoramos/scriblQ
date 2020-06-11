const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const userSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 5000,
  },
});

function validateTokens(user) {
  const schema = Joi.object({
    token: Joi.string().min(2).max(5000).required(),
  });

  return ({ error, value } = schema.validate(user));
}

const Tokens = mongoose.model("Tokens", userSchema);
module.exports = { Tokens, validateTokens };
