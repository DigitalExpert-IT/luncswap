import express from "express";

const app = express.Router();

app.get("/health", (_, res) => {
  res.send({ status: "OK" });
});

export default app;
