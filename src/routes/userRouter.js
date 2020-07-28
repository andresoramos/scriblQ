const express = require("express");
const { User, validateUser } = require("../models/Users");
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const decode = require("jwt-decode");

userRouter.get("/", async (req, res) => {
  var ip = req.ip;
  console.log(ip, "this is the ip");
  const users = await User.find();
  if (users) {
    return res.send(users);
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
