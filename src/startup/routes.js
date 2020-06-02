const express = require("express");
const userRouter = require("../routes/userRouter");
const authRouter = require("../routes/auth");
function loadAllRoutes(app) {
  app.use(express.json());
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
}

module.exports = loadAllRoutes;
