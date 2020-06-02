const express = require("express");
const config = require("config");
const loadAllRoutes = require("./startup/routes");
const dbStartUp = require("./startup/db");
const app = express();

const cors = require("cors");

const corsOptions = {
  exposedHeaders: ["Authorization", "x-auth-token"],
};

app.use(cors(corsOptions));
// const cors = require("cors");

// app.use(cors());
loadAllRoutes(app);
dbStartUp();

const port = process.env.PORT || config.get("port");

const server = app.listen(port, () => {
  console.log(`We're listening in on ${port}...`);
});
