const express = require("express");
const quizRouter = express.Router();
const { Quiz, validateUser } = require("../models/Quiz");
const { UserAccount, validateAccount } = require("../models/UserAccount");
const { User } = require("../models/Users");
const { ScoredQuiz, validateScoredObject } = require("../models/ScoredQuiz");

const createDate = require("../Services/createDate");

quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {}
});
quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {}
});

quizRouter.post("/quizStats", async (req, res) => {
  if (req.body.id.length > 500) {
    return res.send("Id length is too long.");
  }
  try {
    let foundQuizzes = [];
    const findTries = await ScoredQuiz.find();
    for (var i = 0; i < findTries.length; i++) {
      if (findTries[i].relatedId === req.body.id) {
        foundQuizzes.push(findTries[i]);
      }
    }
    res.send(foundQuizzes);
  } catch (error) {
    console.log(error, "This is the error from quizStats in quiz.js");
  }
});

quizRouter.post("/ScoredQuiz", async (req, res) => {
  console.log(req.body, "check earned");
  const { error } = validateScoredObject(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  const newDate = new Date(Date.now());
  const stringDate = JSON.stringify(newDate);
  const prunedDate = createDate(stringDate);
  const fixQuizCount = await updateQuizNumber(req.body.idNumber);
  console.log(fixQuizCount, typeof fixQuizCount);
  const savePayload = {
    relatedId: req.body.idNumber,
    tryCount: fixQuizCount,
    score: {
      earned: req.body.earned,
      possible: req.body.possible,
      specifics: req.body.specifics,
    },
    dateTaken: prunedDate,
  };
  console.log(savePayload, "this is the payloafd");
  const savedResponse = await new ScoredQuiz(savePayload);
  savedResponse.save();

  res.send(savedResponse);
});

//{ earned: 100, possible: 300, idNumber: '5f27dca01e0e9685f080a595' }
quizRouter.post("/getUser", async (req, res) => {
  if (
    req.body.id.length > 1000 ||
    req.body.index > 2000 ||
    req.body.index < -2000
  ) {
    return res.status(400).send("Invalic data");
  }
  try {
    const userAccount = await User.findOne({ email: req.body.email });
    const searchId = userAccount._id;
    const accountObject = await UserAccount.findOne({ userId: searchId });
    const userQuizzesArray = accountObject.quizzes;
    const chosenQuiz = userQuizzesArray[req.body.index];
    const selectedQuiz = await Quiz.findOne({ _id: chosenQuiz.quizId });
    return res.send(selectedQuiz);
  } catch (error) {
    console.log("This is the error from getUser in quizzes: ", error);
  }
});
quizRouter.put("/deleteQuiz", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const userId = user._id;
    const findAccount = await UserAccount.findOne({ userId });
    const pruneQuizArray = [...findAccount.quizzes];
    const index = req.body.id;
    const secondQuizCopy = [...pruneQuizArray];
    const quizId = secondQuizCopy[index].quizId;
    pruneQuizArray.splice(index, 1);
    console.log("Not past updated");
    const updated = await UserAccount.update(
      { _id: findAccount._id },
      { $set: { quizzes: pruneQuizArray } }
    );

    res.send(findAccount);
    const deleteThis = await Quiz.findByIdAndRemove(quizId);
  } catch (error) {
    console.log("this is your error: ", error);
  }
});

quizRouter.post("/savedQuiz", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const userId = user._id;
    const userAccounts = await UserAccount.find();
    let sentBack;
    for (var i = 0; i < userAccounts.length; i++) {
      if (JSON.stringify(userId) === JSON.stringify(userAccounts[i].userId)) {
        sentBack = { ...userAccounts[i]._doc };
        sentBack.user = await User.findOne({ _id: userAccounts[i].userId });
        const quizUpdate = [...userAccounts[i].quizzes];
        for (var j = 0; j < quizUpdate.length; j++) {
          const dateCreated = quizUpdate[j].dateCreated;
          quizUpdate[j] = {
            quiz: await Quiz.findOne({ _id: quizUpdate[j].quizId }),
            dateCreated: dateCreated,
          };
          sentBack.quizzes = quizUpdate;
          delete sentBack.userId;
        }
      }
    }
    res.send(sentBack);
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
const updateQuizNumber = async (id) => {
  try {
    const selectedQuiz = await Quiz.findById(id);
    const fixedNum = await Quiz.update(
      { _id: id },
      { $set: { creationNumber: selectedQuiz.creationNumber + 1 } }
    );
    return selectedQuiz.creationNumber + 1;
  } catch (error) {
    console.log(error, "This is the error from updateQuizNumber in quiz route");
  }
};

const createQuiz = async (quiz, req) => {
  quiz = {
    name: req.body.name,
    questions: req.body.questions,
    creationNumber: 0,
  };

  const newQuiz = new Quiz(quiz);
  await newQuiz.save();
  return newQuiz;
};

module.exports = quizRouter;
