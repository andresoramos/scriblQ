const express = require("express");
const quizRouter = express.Router();
const { Quiz, validateUser } = require("../models/Quiz");
const { UserAccount, validateAccount } = require("../models/UserAccount");
const { User } = require("../models/Users");
const { find, update } = require("lodash");

quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {}
});

quizRouter.put("/:id", async (req, res) => {
  try {
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
  } catch (err) {}
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
          const updated = await Quiz.update(
            { _id: quiz._id },
            { $set: { questions: req.body.questions } }
          );
        }
      }
      if (quiz === undefined) {
        const newQuiz = await createQuiz(quiz, req);
        return res.send(newQuiz);
      }
    } else {
      const newQuiz = await createQuiz(quiz, req);
      return res.send(newQuiz);
    }
  } catch (err) {
    console.log(err, "Error from quiz.js route.");
  }
});

quizRouter.post("/saveQuiz", async (req, res) => {
  try {
    const { error } = validateAccount(req.body);
    if (error) {
      console.log(error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }
    const findUser = await User.findOne({ email: req.body.email });
    const userId = findUser._id;
    const findQuiz = await Quiz.findOne({ name: req.body.name });
    const quizId = findQuiz._id;
    const checkForAccount = await UserAccount.findOne({ userId });
    if (checkForAccount) {
      const updatedQuiz = await Quiz.findOne({ _id: quizId });
      const newArray = [...checkForAccount.quizzes];
      for (var i = 0; i < newArray.length; i++) {
        if (JSON.stringify(newArray[i].quizId) === JSON.stringify(quizId)) {
          return res.status(400).send("This quiz is already in our database");
        }
      }

      const newQuizObj = {
        quizId: updatedQuiz._id,
        dateCreated: new Date(Date.now()),
        likes: 0,
        dislikes: 0,
      };

      newArray.push(newQuizObj);
      const savedQuiz = await UserAccount.update(
        { _id: checkForAccount._id },
        { $set: { quizzes: newArray } }
      );
      return res.send(savedQuiz);
    }
    const quizObj = { quizId, dateCreated: new Date(Date.now()) };
    const quizProfile = {
      userId: userId,
      quizzes: [quizObj],
    };
    const newProfile = await new UserAccount(quizProfile);
    newProfile.save();
    res.send(newProfile);
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
