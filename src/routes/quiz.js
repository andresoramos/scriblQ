const express = require("express");
const mongoose = require("mongoose");
const quizRouter = express.Router();
const { Quiz, validateUser } = require("../models/Quiz");
const { UserAccount, validateAccount } = require("../models/UserAccount");
const { User } = require("../models/Users");
const { Market } = require("../models/Market");
const { Maker } = require("../models/Makers");
const { ScoredQuiz, validateScoredObject } = require("../models/ScoredQuiz");
const createDate = require("../Services/createDate");

quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {
    console.log(`You had an error at get quiz.js/: ${err}`);
  }
});
quizRouter.post("/download", async (req, res) => {
  //Find Quiz and User
  //Look through the history in the market obj
  //check to see if the quiz charges.  If so, inform user that they need to pay
  //and create dialogue box that allows exchange of funds

  //Check to see if there are premium questions - if there are, give them the
  //option to either not get the premiums, to buy them all, or to select which ones they want
  //If there are hidden questions, make sure to remove them before the user has access to them
  try {
    const { _id } = req.body.quiz;
    const { user } = req.body;
    const marketObj = await Market.findOne({ makerId: _id });
    if (marketObj.history.charge && marketObj.history.number) {
      return res.send({ charge: true, cost: marketObj.history.number });
    }
    //create a situation that sends back an object with premium questions if there are any

    if (marketObj.downloadedBy[user._id] === undefined) {
      await Market.update(
        { _id: marketObj._id },
        { $set: { downloadedBy: { [user._id]: Date.now() } } }
      );
    }
    //create a situation that tells front end to prune off hidden questions if there
    //are any by sending out an object with them
    res.send(true);
  } catch (err) {
    console.log(`You had an error at get quiz.js/download: ${err}`);
  }
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
quizRouter.post("/quizById", async (req, res) => {
  try {
    const quiz = await Quiz.findById(mongoose.Types.ObjectId(req.body.quizId));
    res.send(quiz);
  } catch (err) {
    console.log(`This is the error from quizById in the quiz route: ${err}`);
  }
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
const updateMakers = async (quizId, creatorId) => {
  const makers = await Maker.find();
  if (makers.length === 0) {
    let finalObj = {};
    finalObj[quizId] = { maker: creatorId };
    const newMakers = await new Maker({ makers: finalObj });
    await newMakers.save();
    return;
  }
  const newMakers = { ...makers[0] }._doc;
  newMakers.makers[quizId] = { maker: creatorId };
  await Maker.update(
    { _id: newMakers._id },
    { $set: { makers: newMakers.makers } }
  );
};
// quizRouter.post("/test", async (req, res) => {
//   const { num } = req.body;
//   const newTest = await new Tester({ num });
//   await newTest.save();
//   if (num % 2 === 0) {
//     res.send("this works");
//   }
// });
quizRouter.post("/", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) {
      console.log(error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }
    const user = await UserAccount.findOne({
      userId: mongoose.Types.ObjectId(req.body.creatorId),
    });
    if (user === null) {
      console.log("user null entered");
      const newQuiz = await createQuiz(req);
      const quizProfile = {
        userId: mongoose.Types.ObjectId(req.body.creatorId),
        quizzes: [],
        lastId: newQuiz._id,
      };
      const newProfile = await new UserAccount(quizProfile);
      newProfile.save();

      console.log("user null will be exited");
      return res.send(newProfile);
    }
    console.log("entered the second part");
    const currentQuiz =
      user.lastId !== undefined ? await Quiz.findById(user.lastId) : null;
    //Keep working from here to see if you can solve the issues with creating quizzes here
    if (currentQuiz !== null) {
      const updated = await Quiz.update(
        { _id: currentQuiz._id },
        { $set: { questions: req.body.questions, history: req.body.history } }
      );
      res.send(true);
    }

    if (currentQuiz === null) {
      console.log("YOU'VE HIT THE CURRENTQUIZ BEING NULL");
      const newQuiz = await createQuiz(req);
      const lastId = newQuiz._id;
      const id = user._id;
      await UserAccount.update({ _id: id }, { $set: { lastId } });
      return res.send(newQuiz);
    }
  } catch (err) {
    console.log(err, "Error from quiz.js route.");
  }
});
// started with nothing, added in a quiz, then made it's id the last id in the user
// account object.  From there, we need to run add question again.  It sees
// that there is a last id, so it then just updates the quiz that bears the last id.
// from there, we go to save.
/*From there, if there's a user account linke to the userid, it'll take the
id given by the lastid property and make sure that in the existing quiz array, the lastid is not 
already located.  If it is, it'll then end the function and return an error chode.
If the quiz isn't a duplicate, it updates the makers tracking object, and
then pushes into the quiz array the latest quiz
*/
quizRouter.put("/updateMakers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const makerArray = await Maker.find();
    const maker = makerArray[0].makers;
    delete maker[id];
    await Maker.update({ _id: makerArray[0]._id }, { $set: { makers: maker } });
    return res.send(true);
  } catch (error) {
    console.log(`You had an error at quiz.js/updateMakers: ${error}`);
  }
});
quizRouter.post("/saveQuiz", async (req, res) => {
  console.log(
    req.body,
    "This is what it looks like when things enter the back end"
  );

  try {
    console.log("savequiz got to line: 251");
    const findUser = await User.findOne({ email: req.body.email });
    const userId = findUser._id;
    console.log("savequiz got to line: 254");
    const checkForAccount = await UserAccount.findOne({
      userId: mongoose.Types.ObjectId(userId),
    });
    const findQuiz = checkForAccount.lastId;
    const quiz = await Quiz.findOne({ _id: mongoose.Types.ObjectId(findQuiz) });

    if (checkForAccount !== null) {
      const newArray = [...checkForAccount.quizzes];
      for (var i = 0; i < newArray.length; i++) {
        if (JSON.stringify(newArray[i].quizId) === JSON.stringify(findQuiz)) {
          return res.status(400).send("This quiz is already in our database");
        }
      }
      const newQuizObj = {
        quizId: findQuiz,
        dateCreated: new Date(Date.now()),
        likes: 0,
        dislikes: 0,
      };
      //quizId = findQuiz
      await updateMakers(findQuiz, userId);
      newArray.push(newQuizObj);

      const savedQuiz = await UserAccount.update(
        { _id: checkForAccount._id },
        { $set: { quizzes: newArray } }
      );
      await UserAccount.update(
        { _id: checkForAccount._id },
        { $unset: { lastId: "" } }
      );
      return res.send(savedQuiz);
    }
    const quizObj = {
      quizId: findQuiz,
      dateCreated: new Date(Date.now()),
      likes: 0,
      dislikes: 0,
    };
    const quizProfile = {
      userId: userId,
      quizzes: [quizObj],
    };
    console.log("savequiz got to line: 303");
    const newProfile = await new UserAccount(quizProfile);
    newProfile.save();
    console.log("savequiz got to line: 306");
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

const createQuiz = async (req) => {
  console.log(req.body.history, "This is history");
  const quiz = {
    name: req.body.name,
    questions: req.body.questions,
    creationNumber: 0,
    creatorId: req.body.creatorId,
    history: req.body.history,
  };

  const newQuiz = new Quiz(quiz);
  await newQuiz.save();
  return newQuiz;
};

module.exports = quizRouter;
