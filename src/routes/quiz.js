const express = require("express");
const quizRouter = express.Router();
const { Quiz, validateUser } = require("../models/Quiz");
const { UserAccount, validateAccount } = require("../models/UserAccount");
const { User } = require("../models/Users");
const { find } = require("lodash");

quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {
    console.log(err, "This is the error from quizRouter in quiz.js");
  }
});

quizRouter.put("/:id", async (req, res) => {
  try {
    console.log("hitting the put block");
    // const { error } = validateUser(req.body);
    // if (error) {
    //   console.log(error.details[0].message);
    //   return res.status(400).send(error.details[0].message);
    // }

    const updated = await Quiz.update(
      { _id: req.params.id },
      {
        $set: {
          questions: {
            [index]: {
              question: { question: req.body.question.question, edited: true },
              answers: req.body.answers,
            },
          },
        },
      }
    );
  } catch (err) {
    console.log(err, "This is the put error from quizRouter in quiz.js");
  }
});

quizRouter.post("/", async (req, res) => {
  try {
    console.log(req.body, "This is array entering");
    const { error } = validateUser(req.body);
    if (error) {
      console.log(error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }
    const findQuiz = await Quiz.find();
    let quiz;
    if (findQuiz.length !== 0) {
      console.log("we found more than one quiz");
      for (var i = 0; i < findQuiz.length; i++) {
        if (findQuiz[i].name === req.body.name) {
          console.log("we have found quiz and it should be updating");
          quiz = findQuiz[i];
          const updated = await Quiz.update(
            { _id: quiz._id },
            { $set: { questions: req.body.questions } }
          );
          console.log("updating finished");
        }
      }
      if (quiz === undefined) {
        const newQuiz = await createQuiz(quiz, req);
        return res.send(newQuiz);
      }
    } else {
      console.log("entering the point of creation");
      const newQuiz = await createQuiz(quiz, req);
      return res.send(newQuiz);
    }
  } catch (err) {
    console.log(err, "Error from quiz.js route.");
  }
});

quizRouter.post("/saveQuiz", async (req, res) => {
  try {
    console.log(req.body, "this is what you're passing in");
    // console.log(req.body, "This is array entering");
    // const { error } = validateAccount(req.body);
    // if (error) {
    //   console.log(error.details[0].message);
    //   return res.status(400).send(error.details[0].message);
    // }
    const findUser = await User.findById(req.userId);
    const findQuiz = await Quiz.findById(req.quizId);

    if (!findUser || findQuiz) {
      res.status(400).send("User or quiz not found.");
    }

    const findAccount = await UserAccount.find();
    let presentAccount;
    for (var i = 0; i < findAccount.length; i++) {
      console.log(typeof findAccount[i]._id);
    }

    // let quiz;
    // if (findQuiz.length !== 0) {
    //   console.log("we found more than one quiz");
    //   for (var i = 0; i < findQuiz.length; i++) {
    //     if (findQuiz[i].name === req.body.name) {
    //       console.log("we have found quiz and it should be updating");
    //       quiz = findQuiz[i];
    //       const updated = await Quiz.update(
    //         { _id: quiz._id },
    //         { $set: { questions: req.body.questions } }
    //       );
    //       console.log("updating finished");
    //     }
    //   }
    //   if (quiz === undefined) {
    //     const newQuiz = await createQuiz(quiz, req);
    //     return res.send(newQuiz);
    //   }
    // } else {
    //   console.log("entering the point of creation");
    //   const newQuiz = await createQuiz(quiz, req);
    //   return res.send(newQuiz);
    // }
  } catch (err) {
    console.log(err, "Error from quiz.js route.");
  }
});

const createQuiz = async (quiz, req) => {
  quiz = { name: req.body.name, questions: req.body.questions };

  console.log(quiz, "These are our questions");
  const newQuiz = new Quiz(quiz);
  await newQuiz.save();
  return newQuiz;
};

module.exports = quizRouter;
