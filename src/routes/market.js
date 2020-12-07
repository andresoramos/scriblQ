const express = require("express");
const mongoose = require("mongoose");
const marketRouter = express.Router();
const _ = require("lodash");
const { Market } = require("../models/Market");
const { Maker } = require("../models/Makers");
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

const findQuizMaker = async (id) => {
  const findMakers = await Maker.find();

  const { makers } = findMakers[0];
  const { maker } = makers[id];
  return maker;
};
const checkForDuplicate = async (makerId) => {
  const makers = await Market.findOne({ makerId });
  return makers !== null ? true : false;
};
marketRouter.get("/drop", async (req, res) => {
  const markets = await Market.find();
  for (var i = 0; i < markets.length; i++) {
    await Market.findOneAndDelete({ _id: markets[i]._id });
  }
  res.send("completed");
});

marketRouter.post("/", async (req, res) => {
  const market = req.body;
  console.log(market, "This is the market");
  const creatorId = await findQuizMaker(market.makerId);
  const duplicate = await checkForDuplicate(market.makerId);
  if (duplicate) {
    return res.status(400).send("This quiz already exists.");
  }
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
      fixedPremQuestions[key] = Number(fixedPremQuestions[key]);
    }
    newMarket.premiumQuestions = fixedPremQuestions;
  }
  newMarket.uploadDate = new Date(Date.now());
  newMarket.downloadedBy = {};
  newMarket.likes = { total: 0, likes: 0, dislikes: 0 };
  newMarket.creatorId = creatorId;
  newMarket.revenue = { total: 0 };
  const saveQuiz = await new Market(newMarket);
  await saveQuiz.save();
  res.send(saveQuiz);
});

//Start making a function that turns the input info object into the same format as what's saved in the db so that you can compare the two.
const createComparisonObj = (market) => {
  // console.log(market, "This is market in comparison");
  const newMarket = {};
  for (var key in market) {
    if (key === "makerId") {
      console.log(`This is the makerId: ${market[key]}`);
    }
    newMarket[key] = market[key] !== null ? market[key] : null;
  }
  // newMarket.downloadPrice =
  //   newMarket.downloadPrice !== undefined
  //     ? Number(newMarket.downloadPrice)
  //     : undefined;
  if (newMarket.downloadPrice !== undefined) {
    newMarket.downloadPrice = Number(newMarket.downloadPrice);
  }
  if (typeof newMarket.cost === "string") {
    newMarket.cost = Number(newMarket.cost);
  }
  if (!newMarket.premium) {
    if (newMarket.premiumQuestions !== undefined) {
      delete newMarket.premiumQuestions;
    }
  }
  // newMarket.cost =
  //   newMarket.cost !== undefined ? Number(newMarket.cost) : undefined;
  // You might need to add this to conditional below ----> || Object.keys(newMarket.premiumQuestions).length !== 0
  if (newMarket.premiumQuestions !== undefined) {
    let fixedPremQuestions = { ...newMarket.premiumQuestions };
    for (var key in fixedPremQuestions) {
      fixedPremQuestions[key] = Number(fixedPremQuestions[key]);
    }
    newMarket.premiumQuestions = fixedPremQuestions;
  }
  return newMarket;
};

marketRouter.post("/findMarketObj", async (req, res) => {
  console.log("We're hitting market obj");
  if (req.body.list) {
    const { id } = req.body;
    console.log(id);
    const marketList = await Market.find();
    let collection = [];
    for (var i = 0; i < marketList.length; i++) {
      if (marketList[i].creatorId === id) {
        collection.push(marketList[i]);
      }
    }
    let names = [];
    for (i = 0; i < collection.length; i++) {
      const quizName = await Quiz.findById(collection[i].makerId);
      names.push(quizName);
    }

    return res.send(names);
  }
  const { matchNum } = req.body;
  const marketObj = await Market.findOne({ makerId: matchNum });
  return res.send(marketObj);
});
marketRouter.post("/updateMarket", async (req, res) => {
  const { newPayload } = req.body;
  const payload = Object.assign({}, newPayload);
  const present = await Market.findById(payload.quizId);
  console.log(
    present,
    `This is the quizId: ${payload.quizId}, preceded by the present object`
  );
  const newPresent = _.cloneDeep(present._doc);
  // const newPresent = { ...present };

  const comparisonObj = createComparisonObj(payload);
  console.log(comparisonObj.makerId, "Is the makerID in the comparison obj");
  // console.log(comparisonObj, "This is the final comp obj");

  for (let key in comparisonObj) {
    newPresent[key] = comparisonObj[key];
  }
  for (let key in newPresent) {
    if (comparisonObj[key] === undefined) {
      delete newPresent[key];
    }
  }

  // console.log(newPresent, "newpresent after grooming");
  //When you get back to this, your assingment is to figure out how
  //to get rid of empty brackets when premium is deselected

  for (let key in newPresent) {
    if (present[key] === undefined && newPresent[key] === null) {
      continue;
    } else {
      if (key === "_id" || key === "__v") {
        continue;
      }
      if (
        present[key] !== undefined &&
        (newPresent[key] === null || newPresent[key] === undefined)
      ) {
        await Market.update({ _id: present._id }, { $unset: { [key]: "" } });
        continue;
      }

      if (
        present[key] !== undefined &&
        newPresent[key] !== null &&
        newPresent[key] !== undefined
      ) {
        await Market.update(
          { _id: present._id },
          {
            $set: { [key]: newPresent[key] },
          }
        );
        continue;
      }
      if (
        present[key] === undefined &&
        newPresent[key] !== undefined &&
        newPresent[key] !== null
      ) {
        await Market.update(
          { _id: present._id },
          {
            $set: { [key]: newPresent[key] },
          }
        );
        continue;
      }
      // console.log(comparisonObj, "This is the present object");
      // for(var key in payload){
      //   await Market.update({_id: payload})
    }
  }
  if (present.premiumQuestions && newPresent.premiumQuestions === undefined) {
    await Market.update(
      { _id: present._id },
      { $unset: { premiumQuestions: "" } }
    );
  }
  res.send("Update complete");
});
marketRouter.post("/findAllMarketObj", async (req, res) => {
  const { userId } = req.body;
  const allMarkets = await Market.find({ creatorId: userId });
  return res.send(allMarkets);
});
marketRouter.post("/findMarketByName", async (req, res) => {
  const { name, userId } = req.body;
  const authorQuizzes = await Quiz.find({ creatorId: userId });
  let foundQuiz;
  for (let i = 0; i < authorQuizzes.length; i++) {
    if (authorQuizzes[i].name === name) {
      foundQuiz = authorQuizzes[i];
      break;
    }
  }
  if (foundQuiz === undefined) {
    return res.send(false);
  }
  const { _id } = foundQuiz;

  const makerObj = await Market.findOne({ makerId: _id });
  res.send(makerObj === null ? false : makerObj);
});

marketRouter.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    const markets = await Market.find();
    const makers = await Maker.find();
    const finalObj = { quizzes, markets, makers };
    return res.send(finalObj);
  } catch (error) {
    console.log(`You have an error at get market.js/: `, error);
  }
});
// marketRouter.get("/", async (req, res) => {
//   const makers = await UserAccount.find();
//   let finalObj = {};
//   for (var i = 0; i < makers.length; i++) {
//     for (var j = 0; j < makers[i].quizzes.length; j++) {
//       finalObj[makers[i].quizzes[j].quizId] = { maker: makers[i].userId };
//     }
//   }
//   const newMakers = await new Maker({ makers: finalObj });
//   await newMakers.save();
//   res.send(newMakers);
// });

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
