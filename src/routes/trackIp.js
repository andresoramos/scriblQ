const express = require("express");
const trackIpRouter = express.Router();
const { IpTracker } = require("../models/TrackIp");

trackIpRouter.get("/", async (req, res) => {
  const ipTracker = await IpTracker.find();
  res.send(ipTracker);
});

trackIpRouter.get("/ip", async (req, res) => {
  const ip = req.ip;
  res.send(ip);
});

trackIpRouter.put("/:id", async (req, res) => {
  const updated = await IpTracker.update(
    { _id: req.params.id },
    { $set: { ips: req.body.ips } }
  );
  if (updated) {
    return res.send({ response: updated });
  }
});

trackIpRouter.post("/", async (req, res) => {
  ipTracker = new IpTracker(req.body);
  await ipTracker.save();
  res.send("Successfully saved");
});

module.exports = trackIpRouter;
