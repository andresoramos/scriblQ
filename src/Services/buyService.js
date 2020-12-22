const { User, validateUser } = require("../models/Users");
const { Quiz } = require("../models/Quiz");

const buyService = async (quizId, userId) => {
  //find the quiz
  const quiz = await Quiz.findById(quizId);
  const user = await User.findById(userId);
  if (!user.quizzesOwned) {
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { [quizId]: quiz } } }
    );
  } else {
    console.log(user.quizzesOwned, "lets see how this changes");
    await User.update(
      { _id: userId },
      { $set: { quizzesOwned: { ...user.quizzesOwned, [quizId]: quiz } } }
    );
  }
};

module.exports = { buyService };
