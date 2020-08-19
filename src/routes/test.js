const express = require("express");
const imgTestRouter = express.Router();
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({ storage: storage }).single("file");

imgTestRouter.post("/uploadfile", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("this is the multer error");
      return res.status(500).json(err);
    } else if (err) {
      console.log("got to second error");
      return res.status(500).json(err);
    }
    console.log(req.file, "evil bule");
    return res.status(200).send(req.file);
  });
});

module.exports = imgTestRouter;
