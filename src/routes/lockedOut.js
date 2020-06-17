const express = require("express");
const lockedOutRouter = express.Router();
const {
  LockedOut,
  validateUser,
  validatePost,
  validateBannedFix,
} = require("../models/LockedOut");

lockedOutRouter.put("/expiredBans/:id", async (req, res) => {
  const { error } = validateBannedFix(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  const id = req.params.id;
  const lockedOut = await LockedOut.findById(id);
  const newLockedOut = { ...lockedOut._doc.ips };
  newLockedOut.banned = req.body.duplicateArr;
  const updated = await LockedOut.update(
    { _id: req.params.id },
    { $set: { ips: newLockedOut } }
  );
  if (updated) {
    return res.send({ response: updated });
  }
});

lockedOutRouter.put("/:id", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const updated = await LockedOut.update(
    { _id: req.params.id },
    { $set: { ips: req.body.ips } }
  );
  if (updated) {
    return res.send({ response: updated });
  }
});

lockedOutRouter.post("/", async (req, res) => {
  const { error } = validatePost(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  const banned = { ...req.body.ips };
  banned.banned = [];
  const lockedOut = new LockedOut({ ips: banned });
  lockedOut.save();
  res.send(lockedOut);
});
lockedOutRouter.get("/", async (req, res) => {
  const lockedOut = await LockedOut.find();
  res.send(lockedOut);
});
module.exports = lockedOutRouter;
