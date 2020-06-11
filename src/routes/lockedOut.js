const express = require("express");
const lockedOutRouter = express.Router();
const { LockedOut, validateUser } = require("../models/LockedOut");

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
  const { error } = validateUser(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const lockedOut = new LockedOut({ ips: req.body.ips });
  lockedOut.save();
  res.send(lockedOut);
});
lockedOutRouter.get("/", async (req, res) => {
  const lockedOut = await LockedOut.find();
  res.send(lockedOut);
});
module.exports = lockedOutRouter;
