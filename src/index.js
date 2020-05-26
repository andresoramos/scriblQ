const express = require("express");
const config = require("config");
const loadAllRoutes = require("./startup/routes");
const dbStartUp = require("./startup/db");
const app = express();

loadAllRoutes(app);
dbStartUp();

const port = process.env.PORT || config.get("port");

const server = app.listen(port, () => {
  console.log(`We're listening in on ${port}...`);
});
