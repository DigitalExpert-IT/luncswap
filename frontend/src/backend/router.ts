import express from "express";
import { Db } from "mongodb";
import CollectionTransaction from "./collection/transaction";

const app = express.Router();

export const setupRouter = (db: Db) => {
  const transactionCollection = new CollectionTransaction(db);

  app.get("/statistics", async (_, res) => {
    const data = await transactionCollection.getStatistic();
    return res.json(data);
  });

  app.get("/health", (_, res) => {
    res.send({ status: "OK" });
  });

  return app;
};

export default setupRouter;
