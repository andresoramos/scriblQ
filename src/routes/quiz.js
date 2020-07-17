const express = require("express");
const quizRouter = express.Router();
const { Quiz, validateUser } = require("../models/Quiz");
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
    console.log(req.body, "where is index");
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
      console.log("entering the point of creation");
      const newQuiz = await createQuiz(quiz, req);
      return res.send(newQuiz);
    }
    //   console.log("This process ended with a put");
    //   const updatedQuestions = questionCount(
    //     quiz.questions,
    //     req.body.questions,
    //     req.body.answer
    //   );
    //   const updated = await Quiz.update(
    //     { _id: quiz._id },
    //     { $set: { questions: updatedQuestions } }
    //   );
    //   res.send("Object should be updated");
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
