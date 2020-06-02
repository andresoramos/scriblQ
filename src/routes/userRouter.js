const express = require("express");
const { User, validateUser } = require("../models/Users");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");

userRouter.get("/", async (req, res) => {
  const users = await User.find();
  if (users) {
    return res.send(users);
  }
  res.send("Connection isn't working");
});
userRouter.post("/", async (req, res) => {
  const valid = validateUser(req.body);
  if (valid.error) {
    console.log(valid.error.details[0].message);
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
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();

    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .send(_.pick(user, ["_id", "name", "email"]));
    console.log("code is getting here");
  } catch (error) {
    console.log("This is your error: ", error);
  }
});

module.exports = userRouter;
