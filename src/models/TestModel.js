const mongoose = require("mongoose");

const testerSchema = new mongoose.Schema(
  {
    num: {
      type: Number,
    },
  },
  { minimize: false }
);

const Tester = mongoose.model("tester", testerSchema);
module.exports = { Tester };
