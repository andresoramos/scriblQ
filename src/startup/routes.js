const express = require("express");
const userRouter = require("../routes/userRouter");

function loadAllRoutes(app) {
  app.use(express.json());
  app.use("/api/users", userRouter);
}

module.exports = loadAllRoutes;
