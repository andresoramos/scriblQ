const express = require("express");
const fileUpload = require("express-fileupload");
const userRouter = require("../routes/userRouter");
const authRouter = require("../routes/auth");
const reset = require("../routes/passwordReset");
const tokensRouter = require("../routes/tokens");
const trackIpRouter = require("../routes/trackIp");
const lockedOutRouter = require("../routes/lockedOut");
const quizRouter = require("../routes/quiz");
const imgTestRouter = require("../routes/test");

//Everything between these lines is a test
//and might need to be deleted

// Bottom part

function loadAllRoutes(app) {
  app.use(express.json());
  app.use(express.static("../public"));
  // app.use(
  //   fileUpload({
  //     limits: { fileSize: 50 * 1024 * 1024 },
  //   })
  // );
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/tokens", tokensRouter);
  app.use("/api/passwordReset", reset);
  app.use("/api/ipTracker", trackIpRouter);
  app.use("/api/lockedOut", lockedOutRouter);
  app.use("/api/quizzes", quizRouter);
  app.use("/api/imgTest", imgTestRouter);
}

module.exports = loadAllRoutes;
