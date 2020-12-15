const express = require("express");
const { User, validateUser } = require("../models/Users");
const { Market } = require("../models/Market");
const { Quiz } = require("../models/Quiz");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const decode = require("jwt-decode");

const buyService = async (quizId, userId) => {
  //find the quiz
  const quiz = await Quiz.findById(quizId);
  const user = await User.findById(userId);
  if (!user.quizzesOwned) {
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { [quizId]: quiz } } }
    );
  } else {
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { ...quiz.quizzesOwned, [quizId]: quiz } } }
    );
  }
};

module.exports = { buyService };
