import express from "express";
import { User } from "./../models/Users";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  const users = await User.find();
  if (users) {
    return res.send(users);
  }
  res.send("Connection isn't working");
});

export { userRouter };
