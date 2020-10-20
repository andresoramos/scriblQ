const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema({
  makerId: {
    type: String,
    required: true,
  },
  nsfw: {
    type: Boolean,
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
    type: Object,
  },
  cost: {
    type: Number,
  },
  subject: {
    type: String,
  },
  uploadDate: {
    type: Object,
  },
  downloadedBy: {
    type: Object,
  },
  likes: {
    type: Object,
  },
  creatorId: {
    type: String
  }
});

const Market = mongoose.model("market", marketSchema);
module.exports = { Market };
