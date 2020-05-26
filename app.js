import express from "express";
import config from "config";
import { loadAllRoutes } from "./startup/routes";
import { dbStartUp } from "./startup/db";
const app = express();

loadAllRoutes(app);
dbStartUp();

const port = process.env.PORT || config.get("port");

const server = app.listen(port, () => {
  console.log(`We're listening in on ${port}...`);
});
