const express = require("express");
const { User, validateUser } = require("../models/Users");
const { Market } = require("../models/Market");
const { buyService } = require("../Services/buyService");

const userRouter = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const decode = require("jwt-decode");
const quizRouter = require("./quiz");
userRouter.get("/", async (req, res) => {
  var ip = req.ip;
  console.log(ip, "this is the ip");
  const users = await User.find();
  if (users) {
    return res.send(users);
  }
});

userRouter.post("/balance", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    const balance = user.balance;
    if (!balance) {
      return res.send(false);
    }
    res.send({ balance });
  } catch (error) {
    console.log(`You've hit an error at userRouter.js/balance: ${error}`);
  }
});

userRouter.post("/addFunds", async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const user = User.findById(userId);
    const balance = user.balance;
    if (!balance) {
      await User.update({ _id: userId }, { $set: { balance: amount } });
      return res.send({ balance: amount });
    }
    const newAmount = balance + amount;
    await User.update({ _id: userId }, { $set: { balance: newAmount } });
    return res.send({ balance: newAmount });
  } catch (err) {
    console.log(`You've hit an error at userRouter.js/addFunds: ${err}`);
  }
});
userRouter.post("/tradeFunds", async (req, res) => {
  try {
    const { amount, userId, creatorId, quizId } = req.body;
    const buyer = await User.findById(userId);
    const quizObj = await Market.findOne({ makerId: quizId });
    const seller = await User.findById(creatorId);
    if (JSON.stringify(seller._id) === JSON.stringify(buyer._id)) {
      return res.status(404).send("You cannot buy your own quiz.");
    }
    if (quizObj.downloadedBy[buyer._id] === undefined) {
      await Market.update(
        { _id: quizObj._id },
        {
          $set: {
            downloadedBy: { ...quizObj.downloadedBy, [buyer._id]: Date.now() },
          },
        }
      );
    } else {
      return res.status(404).send("You already own this quiz.");
    }
    const { balance } = buyer;
    const newBalance = balance - amount;
    await User.update({ _id: buyer._id }, { $set: { balance: newBalance } });
    const sellerBalance = seller.balance;
    if (!sellerBalance) {
      await User.update({ _id: seller._id }, { $set: { balance: amount } });
    } else {
      const newBalance = sellerBalance + amount;
      await User.update({ _id: seller._id }, { $set: { balance: newBalance } });
    }
    const revenueObj = { total: quizObj.revenue.total + amount };
    revenueObj.totalDownloads = !quizObj.revenue.totalDownloads
      ? 1
      : 1 + quizObj.revenue.totalDownloads;

    await Market.update(
      { _id: quizObj._id },
      {
        $set: {
          revenue: revenueObj,
          downloadCount: !quizObj.downloadCount ? 1 : quizObj.downloadCount + 1,
          totalEarnings: !quizObj.totalEarnings
            ? amount
            : quizObj.totalEarnings + amount,
        },
      }
    );
    await buyService(quizId, userId);

    res.send(true);
  } catch (err) {
    console.log(`You've hit an error at userRouter.js/tradeFunds: ${err}`);
  }
});

userRouter.post("/exists", async (req, res) => {
  if (typeof req.body.token !== "string" || req.body.token.length > 20000) {
    return res.status(400).send("Invalid user.");
  }
  const token = req.body.token;
  let decodedToken;
  try {
    decodedToken = decode(token);
  } catch (err) {
    console.log(err, "Decoding email failed in userRouter.js");
  }
  if (decodedToken === undefined) {
    return res.send(false);
  }
  const email = decodedToken.email;
  console.log(email, "this is the email");
  const userFound = await User.findOne({ email: email });
  if (userFound) {
    return res.send(true);
  }
});

userRouter.put("/addCreator/:id/:quizId", async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const user = await User.findById(id);
    const market = await Market.findOne({ makerId: quizId });
    res.send({ user, description: market.description });
  } catch (error) {
    return res.send(false);
  }
});

userRouter.post("/", async (req, res) => {
  const valid = validateUser(req.body);
  if (valid.error) {
    return res.status(400).send(valid.error.details[0].message);
  }

  const { name, email, password } = req.body;
  let users = await User.find();
  try {
    for (var i = 0; i < users.length; i++) {
      if (users[i].name === name || users[i].email === email) {
        return res
          .status(400)
          .send(
            "There is already an account linked to either this username or password."
          );
      }
    }
    let user = await new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .header("name-token", name)
      .send(_.pick(user, ["_id", "name", "email"]));
    console.log("code is getting here");
  } catch (error) {
    console.log("This is your error: ", error);
  }
});

module.exports = userRouter;
