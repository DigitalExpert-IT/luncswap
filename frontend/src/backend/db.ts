import { MongoClient } from "mongodb";

export const initializeDb = async () => {
  const client = new MongoClient(
    "mongodb://mongo:secretpassword@localhost:27017/",
  );
  await client.connect();
  return client.db("luncswap");
};
