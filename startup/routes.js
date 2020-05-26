import express from "express";
import { userRouter } from "../Routes/Users";

export function loadAllRoutes(app) {
  app.use(express.json());
  app.use("/api/users", userRouter);
}
