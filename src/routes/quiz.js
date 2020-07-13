const express = require("express");
const quizRouter = express.Router();
const { Quiz, validateUser, validatePost } = require("../models/Quiz");
const { find } = require("lodash");

// lockedOutRouter.put("/expiredBans/:id", async (req, res) => {
//   const { error } = validateBannedFix(req.body);
//   if (error) {
//     console.log(error.details[0].message);
//     return res.status(400).send(error.details[0].message);
//   }
//   const id = req.params.id;
//   const lockedOut = await LockedOut.findById(id);
//   const newLockedOut = { ...lockedOut._doc.ips };
//   newLockedOut.banned = req.body.duplicateArr;
//   const updated = await LockedOut.update(
//     { _id: req.params.id },
//     { $set: { ips: newLockedOut } }
//   );
//   if (updated) {
//     return res.send({ response: updated });
//   }
// });

// lockedOutRouter.put("/:id", async (req, res) => {
//   const { error } = validateUser(req.body);
//   if (error) {
//     console.log(error.details[0].message);
//     return res.status(400).send(error.details[0].message);
//   }

//   const updated = await LockedOut.update(
//     { _id: req.params.id },
//     { $set: { ips: req.body.ips } }
//   );
//   if (updated) {
//     return res.send({ response: updated });
//   }
// });

quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {
    console.log(err, "This is the error from quizRouter in quiz.js");
  }
});

quizRouter.post("/", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      console.log(error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }
    const findQuiz = await Quiz.find();
    let quiz;
    if (findQuiz.length !== 0) {
      for (var i = 0; i < findQuiz.length; i++) {
        if (findQuiz[i].name === req.body.name) {
          quiz = findQuiz[i];
        }
      }
    } else {
      quiz = { name: req.body.name, questions: {} };
      console.log(quiz, "<---- req.body");
      const questions = questionCount(
        quiz.questions,
        req.body.questions,
        req.body.answer
      );
      quiz.questions = questions;

      const newQuiz = new Quiz(quiz);
      await newQuiz.save();
      return res.send(newQuiz);
    }
    const updatedQuestions = questionCount(
      quiz.questions,
      req.body.questions,
      req.body.answer
    );
    const updated = await Quiz.update(
      { _id: quiz._id },
      { $set: { questions: updatedQuestions } }
    );
    res.send("Object should be updated");
  } catch (err) {
    console.log(err, "Error from quiz.js route.");
  }
});
// lockedOutRouter.get("/", async (req, res) => {
//   const lockedOut = await LockedOut.find();
//   res.send(lockedOut);
// });
const questionCount = (obj, question, answers) => {
  console.log(question, "QUESTIONS");
  if (obj["1"] === undefined) {
    console.log("butt" === "butt");
    obj["1"] = { question, answers };
    return obj;
  }
  let number = 0;
  for (var key in obj) {
    if (Number(key) > number) {
      number = Number(key);
    }
  }
  number += 1;
  console.log(number, "Is something wrong with number");
  obj[number] = { question, answers };
  return obj;
};

module.exports = quizRouter;
