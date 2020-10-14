const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  nsfw: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
  },
  downloadPrice: {
    type: Number,
  },
  hiddenQuestions: {
    type: Object,
  },

  expirationDate: {
    type: String,
  },
  cost: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
  },
});

const Market = mongoose.model("market", marketSchema);
module.exports = { Market };
