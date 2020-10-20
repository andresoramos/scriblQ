const mongoose = require("mongoose");

const makerSchema = new mongoose.Schema({
  makers: {
    type: Object,
    },
  });

const Maker = mongoose.model("maker", makerSchema);
module.exports = { Maker };
