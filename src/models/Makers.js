const mongoose = require("mongoose");

const makerSchema = new mongoose.Schema(
  {
    makers: {
      type: Object,
    },
  },
  { minimize: false }
);

const Maker = mongoose.model("maker", makerSchema);
module.exports = { Maker };
