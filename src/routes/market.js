const express = require("express");
const marketRouter = express.Router();
const { Market } = require("../models/Market");
const { Quiz } = require("../models/Quiz");
const { UserAccount, validateAccount } = require("../models/UserAccount");
const { User } = require("../models/Users");
const { ScoredQuiz, validateScoredObject } = require("../models/ScoredQuiz");

const validateObject = (obj) => {
  let alarm = true;
  for (var key in obj) {
    if (typeof obj[key] === "string") {
      if (obj[key].length > 1000) {
        alarm = false;
        return alarm;
      }
    }
    if (Array.isArray(obj[key])) {
      if (obj[key].length > 10000000) {
        alarm = false;
        return alarm;
      }
    }
    if (typeof obj[key] === "number") {
      if (
        obj[key] > 100000000000000000000000 ||
        obj[key] < -100000000000000000000000
      ) {
        alarm = false;
        return alarm;
      }
    }
  }

  return alarm;
};

marketRouter.post("/", async (req, res) => {
  console.log("got in");
  const market = req.body;
  const validated = validateObject(market);
  if (!validated) {
    return res.status(400).send("Something went wrong.  Please try again.");
  }
  let newMarket = {};
  for (var key in market) {
    newMarket[key] = market[key] !== null ? market[key] : undefined;
  }
  newMarket.downloadPrice =
    newMarket.downloadPrice !== undefined
      ? Number(newMarket.downloadPrice)
      : undefined;
  newMarket.cost =
    newMarket.cost !== undefined ? Number(newMarket.cost) : undefined;
  if (newMarket.premiumQuestions !== undefined) {
    let fixedPremQuestions = { ...newMarket.premiumQuestions };
    for (var key in fixedPremQuestions) {
      fixedPremQuestions[key] = Number(fixedPremQuestions);
    }
    newMarket.premiumQuestions = fixedPremQuestions;
  }
  res.send(newMarket);
});

module.exports = marketRouter;

// const marketSchema = new mongoose.Schema({
//     _id: {
//       type: String,
//       required: true,
//     },
//     nsfw: {
//       type: Boolean,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     downloadPrice: {
//       type: Number,
//     },
//     hiddenQuestions: {
//       type: Object,
//     },
//     premiumQuestions: {
//       type: Object,
//     },
//     expirationDate: {
//       type: String,
//     },
//     cost: {
//       type: Number,
//       required: true,
//     },
//     subject: {
//       type: String,
//     },
//   });
