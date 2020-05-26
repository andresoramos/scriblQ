const express = require("express");
const User = require("../models/Users");

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const users = await User.find();
  if (users) {
    return res.send(users);
  }
  res.send("Connection isn't working");
});

module.exports = userRouter;
