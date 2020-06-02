import winston from "winston";
import mongoose from "mongoose";
import config from "config";

export function dbStartUp() {
  const db = config.get("db");
  const connString =
    db.proto +
    "://" +
    (db.username ? db.username + ":" + db.password + "@" : "") +
    db.hostname +
    "/" +
    db.schema;
  mongoose
    .connect(connString)
    .then(() => winston.info(`Connected to ${connString}...`));
}
