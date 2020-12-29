const { User, validateUser } = require("../models/Users");
const { Quiz } = require("../models/Quiz");
const _ = require("lodash");

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
    console.log(Object.keys(quiz), "it should fucking be here");
  }
  if (!user.quizzesOwned) {
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { [quizId]: quiz } } }
    );
  } else {
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { ...user.quizzesOwned, [quizId]: quiz } } }
    );
  }
};

module.exports = { buyService };
