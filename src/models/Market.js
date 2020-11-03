const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema(
  {
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
    premiumQuestions: {
      type: Object,
    },

    expirationDate: {
      type: Object,
    },
    cost: {
      type: Number,
    },
    revenue: {
      type: Object,
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
    downloadCount: {
      type: Number,
    },
    totalEarnings: {
      type: Number,
    },
    creatorId: {
      type: String,
    },
    history: {
      type: Object,
    },
  },
  { minimize: false }
);

const Market = mongoose.model("market", marketSchema);
module.exports = { Market };
