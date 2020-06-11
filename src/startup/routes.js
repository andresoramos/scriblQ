const express = require("express");
const userRouter = require("../routes/userRouter");
const authRouter = require("../routes/auth");
const reset = require("../routes/passwordReset");
const tokensRouter = require("../routes/tokens");
const trackIpRouter = require("../routes/trackIp");
const lockedOutRouter = require("../routes/lockedOut");
function loadAllRoutes(app) {
  app.use(express.json());
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/tokens", tokensRouter);
  app.use("/api/passwordReset", reset);
  app.use("/api/ipTracker", trackIpRouter);
  app.use("/api/lockedOut", lockedOutRouter);
}

module.exports = loadAllRoutes;
