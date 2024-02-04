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

  app.get("/statistics/:contractAddress", async (req, res) => {
    if (!req.params.contractAddress || !req.query.start || !req.query.end) {
      return res.status(400).json({
        message: "invalid params / query",
      });
    }

    try {
      const startDate = new Date(req.query.start as string);
      const endDate = new Date(req.query.end as string);
      const data = await transactionCollection.getStatisticByTimeRange(
        req.params.contractAddress,
        startDate,
        endDate,
      );
      return res.json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  // /statistics/hash?start=timestamp&end=timestamp

  app.get("/health", (_, res) => {
    res.send({ status: "OK" });
  });

  return app;
};

export default setupRouter;
