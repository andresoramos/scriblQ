const { User, validateUser } = require("../models/Users");
const { Quiz } = require("../models/Quiz");
const _ = require("lodash");
const { Market } = require("../models/Market");

const buyService = async (quizId, userId, hidden) => {
  //find the quiz
  let quiz = await Quiz.findById(quizId);
  const user = await User.findById(userId);
  if (hidden) {
    let newQuiz = _.cloneDeep(quiz._doc);
    let questionsArr = _.cloneDeep(newQuiz.questions);
    let fixedQuestions = [];
    for (var i = 0; i < questionsArr.length; i++) {
      if (!hidden[i + 1]) {
        fixedQuestions.push(questionsArr[i]);
      }
    }
    newQuiz.questions = fixedQuestions;
    newQuiz.hidden = hidden;
    quiz = newQuiz;
  }
  if (!user.quizzesOwned) {
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { [quizId]: quiz }, lastDownload: quiz } }
    );
  } else {
    await User.update(
      { _id: userId },
      {
        $set: {
          quizzesOwned: {
            ...user.quizzesOwned,
            [quizId]: quiz,
          },
          lastDownload: quiz,
        },
      }
    );
  }
};

const completeDownload = async (quiz, userId) => {
  try {
    const user = await User.findById(userId);
    const market = await Market.findOne({ makerId: quiz._id });
    if (user.quizzesOwned && user.quizzesOwned[quiz._id]) {
      return { quizOwned: true };
    } else {
      if (user.quizzesOwned) {
        let newOwned = _.cloneDeep(user.quizzesOwned);
        newOwned[quiz._id] = quiz;
        await User.update(
          { _id: userId },
          { $set: { quizzesOwned: newOwned, lastDownload: quiz } }
        );
      } else {
        let quizzesOwned = { [quiz._id]: quiz };
        await User.update(
          { _id: userId },
          { $set: { quizzesOwned, lastDownload: quiz } }
        );
      }
    }
    if (market.downloadedBy) {
      await Market.update(
        { _id: market._id },
        {
          $set: {
            downloadedBy: { ...market.downloadedBy, [userId]: Date.now() },
          },
        }
      );
    } else {
      let downloadedBy = { userId: Date.now() };
      await Market.update({ _id: market._id }, { $set: { downloadedBy } });
    }
    return { downloaded: true };
  } catch (error) {
    console.log(
      `There was an error in buyService.js/completeDownload: ${error}`
    );
  }
};

module.exports = { buyService, completeDownload };
