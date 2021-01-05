const express = require("express");
const mongoose = require("mongoose");
const quizRouter = express.Router();
const { Quiz, validateUser } = require("../models/Quiz");
const { UserAccount } = require("../models/UserAccount");
const { User } = require("../models/Users");
const { Market } = require("../models/Market");
const { Maker } = require("../models/Makers");
const { ScoredQuiz, validateScoredObject } = require("../models/ScoredQuiz");
const { hideQuizQuestions } = require("../Services/hideQuestionsService");
const _ = require("lodash");
const { completeDownload } = require("../Services/buyService");
const createDate = require("../Services/createDate");

const checkForLiked = (quiz, user) => {
  let quizThere = true;
  let userThere = true;
  if (!quiz.likedBy[user._id]) {
    userThere = false;
  }
  if (!user.likedQuizzes[quiz._id]) {
    quizThere = false;
  }
  if (!quizThere || !userThere) {
    return false;
  }
  return true;
};
const checkForDisliked = (quiz, user) => {
  let quizThere = true;
  let userThere = true;
  if (!quiz.dislikedBy[user._id]) {
    userThere = false;
  }
  if (!user.dislikedQuizzes[quiz._id]) {
    quizThere = false;
  }
  if (!quizThere || !userThere) {
    return false;
  }
  return true;
};
quizRouter.put("/delete/:quizId/:userId", async (req, res) => {
  try {
    const { quizId, userId } = req.params;
    const quiz = await Quiz.findById(quizId);
    const user = await User.findById(userId);
    const market = await Market.findOne({ makerId: quizId });
    let quizzesOwned = { ...user.quizzesOwned };
    delete quizzesOwned[quizId];
    await User.update({ _id: userId }, { $set: { quizzesOwned } });
    if (user.likedQuizzes && user.likedQuizzes[quizId]) {
      let likedQuizzes = { ...user.likedQuizzes };
      delete likedQuizzes[quizId];
      await User.update({ _id: userId }, { $set: { likedQuizzes } });
    }
    if (user.dislikedQuizzes && user.dislikedQuizzes[quizId]) {
      let dislikedQuizzes = { ...user.dislikedQuizzes };
      delete dislikedQuizzes[quizId];
      await User.update({ _id: userId }, { $set: { dislikedQuizzes } });
    }
    if (quiz.likedBy && quiz.likedBy[userId]) {
      let likedBy = { ...quiz.likedBy };
      delete likedBy[userId];
      await Quiz.update({ _id: quizId }, { $set: { likedBy } });
    }
    if (quiz.dislikedBy && quiz.dislikedBy[userId]) {
      let dislikedBy = { ...quiz.dislikedBy };
      delete dislikedBy[userId];
      await Quiz.update({ _id: quizId }, { $set: { dislikedBy } });
    }
    const downloadedBy = { ...market.downloadedBy };
    delete downloadedBy[userId];
    await Market.update({ _id: market._id }, { $set: { downloadedBy } });
    res.send(true);
  } catch (err) {
    console.log(`You had an error at get quiz.js/delete: ${err}`);
  }
});
quizRouter.get("/", async (req, res) => {
  try {
    const quiz = await Quiz.find();
    res.send(quiz);
  } catch (err) {
    console.log(`You had an error at get quiz.js/: ${err}`);
  }
});
quizRouter.post("/unlike", async (req, res) => {
  try {
    const { quizId, userId, hidden } = req.body;
    const quiz = await Quiz.findById(quizId);
    const user = await User.findById(userId);
    const market = await Market.findOne({ makerId: quizId });
    const confirmLiked = checkForLiked(quiz, user);
    if (!confirmLiked) {
      return res.send({ notLiked: true });
    }
    let likedQuizzes = { ...user.likedQuizzes };
    delete likedQuizzes[quizId];
    await User.update({ _id: userId }, { $set: { likedQuizzes } });
    const likes = quiz.likes - 1;
    let likedBy = { ...quiz.likedBy };
    delete likedBy[userId];
    await Quiz.update({ _id: quizId }, { $set: { likes, likedBy } });
    let marketLikes = { ...market.likes };
    marketLikes.total = market.likes.total - 1;
    marketLikes.likes = market.likes.likes - 1;
    await Market.update({ _id: market._id }, { $set: { likes: marketLikes } });
    if (user.quizzesOwned && user.quizzesOwned[quizId]) {
      let newQuiz = await Quiz.findById(quizId);
      if (hidden) {
        newQuiz = hideQuizQuestions(newQuiz, hidden);
        console.log(
          newQuiz,
          "You got into the right spot and this is the new quiz"
        );
      }
      await User.update(
        { _id: userId },
        { $set: { quizzesOwned: { ...user.quizzesOwned, [quizId]: newQuiz } } }
      );
    }
    res.send(true);
  } catch (err) {
    console.log(`You had an error at get quiz.js/unlike: ${err}`);
  }
});
quizRouter.post("/unDislike", async (req, res) => {
  try {
    const { quizId, userId, hidden } = req.body;
    const quiz = await Quiz.findById(quizId);
    const user = await User.findById(userId);
    const market = await Market.findOne({ makerId: quizId });
    const confirmDisliked = checkForDisliked(quiz, user);
    if (!confirmDisliked) {
      return res.send({ notLiked: true });
    }
    let dislikedQuizzes = { ...user.dislikedQuizzes };
    delete dislikedQuizzes[quizId];
    await User.update({ _id: userId }, { $set: { dislikedQuizzes } });
    const dislikes = quiz.dislikes - 1;
    let dislikedBy = { ...quiz.dislikedBy };
    delete dislikedBy[userId];
    await Quiz.update({ _id: quizId }, { $set: { dislikes, dislikedBy } });
    let marketDislikes = { ...market.likes };
    marketDislikes.total = market.likes.total + 1;
    marketDislikes.dislikes = market.likes.dislikes - 1;
    await Market.update(
      { _id: market._id },
      { $set: { likes: marketDislikes } }
    );
    if (user.quizzesOwned && user.quizzesOwned[quizId]) {
      let newQuiz = await Quiz.findById(quizId);
      if (hidden) {
        newQuiz = hideQuizQuestions(newQuiz, hidden);
      }
      await User.update(
        { _id: userId },
        { $set: { quizzesOwned: { ...user.quizzesOwned, [quizId]: newQuiz } } }
      );
    }
    res.send(true);
  } catch (err) {
    console.log(`You had an error at get quiz.js/unlike: ${err}`);
  }
});

quizRouter.post("/addLiked", async (req, res) => {
  try {
    const { quizId, userId, hidden } = req.body;
    const quiz = await Quiz.findById(quizId);
    const user = await User.findById(userId);

    if (!quiz.likedBy || !user.likedQuizzes) {
      console.log("got into the not liked");
      let quizThere = quiz.likedBy === undefined;
      let userThere = user.likedBy === undefined;
      if (quizThere && userThere) {
        console.log("went here or there");
        const likedBy = { [userId]: true };
        await Quiz.update({ _id: quizId }, { $set: { likedBy } });
        const likedQuizzes = { [quizId]: true };
        await User.update(
          { _id: userId },
          {
            $set: {
              likedQuizzes,
            },
          }
        );
      } else {
        console.log("entered first else");
        if (quizThere) {
          console.log("entered quiz there");
          const likedBy = { [userId]: true };
          await Quiz.update({ _id: quizId }, { $set: { likedBy } });
          await User.update(
            { _id: userId },
            {
              $set: {
                likedQuizzes: { ...user.likedQuizzes, [quizId]: true },
              },
            }
          );
        }
        if (userThere) {
          const likedQuizzes = { [quizId]: true };
          await User.update(
            { _id: userId },
            {
              $set: {
                likedQuizzes,
              },
            }
          );
          await Quiz.update(
            { _id: quizId },
            {
              $set: {
                likedBy: { ...quiz.likedBy, [userId]: true },
              },
            }
          );
        }
      }
    } else {
      if (quiz.likedBy[userId] || user.likedQuizzes[quizId]) {
        return res.send({ alreadyLiked: true });
      }
      console.log("got into the second else");
      await Quiz.update(
        { _id: quizId },
        { $set: { likedBy: { ...quiz.likedBy, [userId]: true } } }
      );
      console.log("updated quiz");
      await User.update(
        { _id: userId },
        {
          $set: {
            likedQuizzes: { ...user.likedQuizzes, [quizId]: true },
          },
        }
      );
    }

    if (!quiz.likes) {
      await Quiz.update(
        { _id: quiz._id },
        {
          $set: {
            likes: 1,
          },
        }
      );
    } else {
      await Quiz.update(
        { _id: quizId },
        {
          $set: {
            likes: quiz.likes + 1,
          },
        }
      );
    }
    const market = await Market.findOne({ makerId: quizId });
    const newLikes = { ...market.likes };
    newLikes.likes = newLikes.likes + 1;
    newLikes.total = newLikes.likes - newLikes.dislikes;
    await Market.update({ _id: market._id }, { $set: { likes: newLikes } });
    if (user.quizzesOwned && user.quizzesOwned[quizId]) {
      let newQuiz = await Quiz.findById(quizId);
      if (hidden) {
        newQuiz = hideQuizQuestions(newQuiz, hidden);
      }
      await User.update(
        { _id: userId },
        { $set: { quizzesOwned: { ...user.quizzesOwned, [quizId]: newQuiz } } }
      );
    }
    return res.send(true);
  } catch (err) {
    console.log(`You had an error at get quiz.js/addLiked: ${err}`);
    return res.send(false);
  }
});

quizRouter.post("/addDisliked", async (req, res) => {
  try {
    const { quizId, userId, hidden } = req.body;
    const quiz = await Quiz.findById(quizId);
    const user = await User.findById(userId);
    if (!quiz.dislikedBy || !user.dislikedQuizzes) {
      let quizThere = quiz.dislikedBy === undefined;
      let userThere = user.dislikedBy === undefined;
      if (quizThere && userThere) {
        const dislikedBy = { [userId]: true };
        await Quiz.update({ _id: quizId }, { $set: { dislikedBy } });
        const dislikedQuizzes = { [quizId]: true };
        await User.update(
          { _id: userId },
          {
            $set: {
              dislikedQuizzes,
            },
          }
        );
      } else {
        if (quizThere) {
          console.log("entered quiz there");
          const dislikedBy = { [userId]: true };
          await Quiz.update({ _id: quizId }, { $set: { dislikedBy } });
          await User.update(
            { _id: userId },
            {
              $set: {
                dislikedQuizzes: { ...user.dislikedQuizzes, [quizId]: true },
              },
            }
          );
        }
        if (userThere) {
          const dislikedQuizzes = { [quizId]: true };
          await User.update(
            { _id: userId },
            {
              $set: {
                dislikedQuizzes,
              },
            }
          );
          await Quiz.update(
            { _id: quizId },
            {
              $set: {
                dislikedBy: { ...quiz.dislikedBy, [userId]: true },
              },
            }
          );
        }
      }
    } else {
      if (quiz.dislikedBy[userId] || user.dislikedQuizzes[quizId]) {
        return res.send({ alreadyDisliked: true });
      }
      await Quiz.update(
        { _id: quizId },
        { $set: { dislikedBy: { ...quiz.dislikedBy, [userId]: true } } }
      );
      await User.update(
        { _id: userId },
        {
          $set: {
            dislikedQuizzes: { ...user.dislikedQuizzes, [quizId]: true },
          },
        }
      );
    }

    if (!quiz.dislikes) {
      await Quiz.update(
        { _id: quiz._id },
        {
          $set: {
            dislikes: 1,
          },
        }
      );
    } else {
      await Quiz.update(
        { _id: quizId },
        {
          $set: {
            likes: quiz.likes + 1,
          },
        }
      );
    }
    const market = await Market.findOne({ makerId: quizId });
    const newLikes = { ...market.likes };
    newLikes.dislikes = newLikes.dislikes + 1;
    newLikes.total = newLikes.likes - newLikes.dislikes;
    await Market.update({ _id: market._id }, { $set: { likes: newLikes } });
    if (user.quizzesOwned && user.quizzesOwned[quizId]) {
      let newQuiz = await Quiz.findById(quizId);
      if (hidden) {
        newQuiz = hideQuizQuestions(newQuiz, hidden);
      }
      await User.update(
        { _id: userId },
        { $set: { quizzesOwned: { ...user.quizzesOwned, [quizId]: newQuiz } } }
      );
    }
    return res.send(true);
  } catch (err) {
    console.log(`You had an error at get quiz.js/addLiked: ${err}`);
    return res.send(false);
  }
});
quizRouter.post("/paidQuizzes", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    let quizzes = [];
    const { quizzesOwned } = user;
    if (quizzesOwned) {
      for (var key in quizzesOwned) {
        quizzes.push(quizzesOwned[key]);
      }
    }
    return res.send(quizzes);
  } catch (err) {
    console.log(`You had an error at get quiz.js/paidQuizzes: ${err}`);
  }
});
quizRouter.put("/boughtQuizzes/:userId", async (req, res) => {
  try {
    //find the user from params userId
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (user.quizzesOwned) {
      return res.send(user.quizzesOwned);
    }
    res.send(false);
  } catch (err) {
    console.log(`You had an error at get quiz.js/boughtQuizzes: ${err}`);
  }
});
quizRouter.post("/download", async (req, res) => {
  //Check to see if there are premium questions - if there are, give them the
  //option to either not get the premiums, to buy them all, or to select which ones they want
  //If there are hidden questions, make sure to remove them before the user has access to them
  try {
    const { _id } = req.body.quiz;
    const { user } = req.body;
    const marketObj = await Market.findOne({ makerId: _id });
    if (marketObj.history.charge && marketObj.history.number) {
      if (
        marketObj.history.hide &&
        Object.keys(marketObj.history.hideQuestions).length > 0
      ) {
        return res.send({
          charge: true,
          cost: marketObj.history.number,
          hidden: marketObj.history.hideQuestions,
        });
      }
      return res.send({ charge: true, cost: marketObj.history.number });
    }
    if (
      marketObj.history.hide &&
      Object.keys(marketObj.history.hideQuestions) > 0
    ) {
      return res.send({ hidden: marketObj.history.hideQuestions });
    }
    if (marketObj.history.chosenPremium && marketObj.history.premiumCost) {
      if (Object.keys(marketObj.history.premiumCost).length > 0) {
        return res.send({ premiumCost: marketObj.history.premiumCost });
      }
    }
    //create a situation that sends back an object with premium questions if there are any

    //create a situation that tells front end to prune off hidden questions if there
    //are any by sending out an object with them
    res.send({ downloaded: true });
  } catch (err) {
    console.log(`You had an error at get quiz.js/download: ${err}`);
  }
});

quizRouter.post("/quizStats", async (req, res) => {
  if (req.body.id.length > 500) {
    return res.send("Id length is too long.");
  }
  try {
    const { userId } = req.body;
    let foundQuizzes = [];
    const findTries = await ScoredQuiz.find();
    for (var i = 0; i < findTries.length; i++) {
      if (
        findTries[i].relatedId === req.body.id &&
        findTries[i].takenBy === userId
      ) {
        foundQuizzes.push(findTries[i]);
      }
    }
    res.send(foundQuizzes);
  } catch (error) {
    console.log(error, "This is the error from quizStats in quiz.js");
  }
});

quizRouter.put("/destroy/:userId", async (req, res) => {
  const { userId } = req.params;
  const markets = await Market.find();
  for (var i = 0; i < markets.length; i++) {
    await Market.update({ _id: market[i]._id }, { $set: { downloadedBy: {} } });
  }
  await User.update(
    { _id: userId },
    { $unset: { quizzesOwned: "", lastDownload: "" } }
  );
  await ScoredQuiz.deleteMany({});
});
quizRouter.post("/freeDownloadService", async (req, res) => {
  try {
    const { userId, quiz } = req.body;
    const downloadCompleted = await completeDownload(quiz, userId);
    if (downloadCompleted.downloaded) {
      return res.send(true);
    }
    res.send(false);
  } catch (error) {
    console.log(`You had an error at quiz.js/freeDownloadService: ${error}`);
  }
});
quizRouter.post("/ScoredQuiz", async (req, res) => {
  const { userId } = req.body;
  const { error } = validateScoredObject(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  const newDate = new Date(Date.now());
  const stringDate = JSON.stringify(newDate);
  const prunedDate = createDate(stringDate);
  const savePayload = {
    relatedId: req.body.idNumber,
    score: {
      earned: req.body.earned,
      possible: req.body.possible,
      specifics: req.body.specifics,
    },
    takenBy: userId,
    dateTaken: prunedDate,
  };
  const savedResponse = await new ScoredQuiz(savePayload);
  savedResponse.save();
  console.log("You managed to save things after all");
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
const updateQuizNumber = async (id, userId) => {
  try {
    const selectedQuiz = await Quiz.findById(id);
    if (selectedQuiz === null) {
      const scoredQuiz = await ScoredQuiz.find({ relatedId: id });
      console.log(scoredQuiz, "this should be all of the scored quizzes");
      return 4;
    }
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
