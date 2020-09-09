const express = require("express");
const imgTestRouter = express.Router();
const multer = require("multer");
// const pic = require("../../public/fanTest");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public");
  },
  filename: function (req, file, cb) {
    console.log(file, "First file");
    const splitName = file.originalname.split(".");
    const ext =
      splitName.length > 1 ? "." + splitName[splitName.length - 1] : "";

    cb(null, Date.now() + "-" + file.md5 + ext);
  },
});
var upload = multer({ storage: storage }).single("file");

imgTestRouter.post("/uploadfile", upload, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("this is the multer error");
      return res.status(500).json(err);
    } else if (err) {
      console.log("got to second error");
      return res.status(500).json(err);
    }
    // console.log(req.file, "this might be the req you need");
    return res.status(200).send(req.file);
  });
});
imgTestRouter.post("/retrievefile", (req, res) => {
  res.download(pic);
});

module.exports = imgTestRouter;
