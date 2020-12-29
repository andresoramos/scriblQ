const _ = require("lodash");

const hideQuizQuestions = (quiz, hidden) => {
  let quizWithHidden = _.cloneDeep(quiz)._doc;
  let questions = [...quizWithHidden.questions];
  let questionsFixed = [];
  for (var i = 0; i < questions.length; i++) {
    if (!hidden[i + 1]) {
      questionsFixed.push(questions[i]);
    }
  }
  quizWithHidden.questions = questionsFixed;
  quizWithHidden.hidden = hidden;

  return quizWithHidden;
};

module.exports = { hideQuizQuestions };
