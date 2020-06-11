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
  //find ip address.
  //check to see if the ip is banned
  //find the ip tracking object
  //check to see if the ip exists as a property of the object
  //if it doesn't, create it
  //if it exists, add it to the array assigned to the property
  //subtract time stamp at position 0 from the last one in the array
  //If amount is five minutes or less, check to see how many attempts in array
  //if array has less than 20, nothing else needs to be done
  //if array has more 20 or more, ip must be banned
  //if time difference is more than five minutes, all but the last
  //one will be deleted
});

trackIpRouter.post("/", async (req, res) => {
  ipTracker = new IpTracker(req.body);
  await ipTracker.save();
  res.send("Successfully saved");
});

module.exports = trackIpRouter;
