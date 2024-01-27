import { PairInfo, PriceChangeInfo } from "@/backend/model";
import { Dec } from "@terra-money/terra.js";
import { Db } from "mongodb";

class CollectionTransaction {
  private db: Db;
  private collectionName = "transaction";

  constructor(db: Db) {
    this.db = db;
    this.createIndex();
  }

  private async createIndex() {
    // create collection if not exist
    const collectionNames = await this.db.listCollections().toArray();
    const collectionExists = collectionNames.some(
      collection => collection.name === this.collectionName,
    );
    if (!collectionExists) {
      await this.db.createCollection(this.collectionName);
    }

    const col = this.db.collection(this.collectionName);

    col.indexExists("blockHeight").then(val => {
      if (!val) {
        col.createIndex(["blockHeight"], { name: "blockHeight" });
      }
    });

    col.indexExists("hashUnique").then(val => {
      if (!val) {
        col.createIndex(["hash"], { name: "hashUnique", unique: true });
      }
    });

    col.indexExists("timestampAndContractAddress").then(val => {
      if (!val) {
        col.createIndex(["timestamp", "contractAdddress", "type"], {
          name: "timestampAndContractAddress",
        });
      }
    });
  }

  public async getPairList() {
    const col = this.db.collection(this.collectionName);
    const pairList = (await col.find({ type: "pair_info" }).toArray()).map(
      item => item.contractAddress as string,
    );
    return pairList;
  }

  public async getLatestBlock() {
    const col = this.db.collection(this.collectionName);
    const [tx] = await col.find().limit(1).sort({ blockHeight: -1 }).toArray();
    return (tx?.blockHeight ?? 0) as number;
  }

  public async insertPairInfo(data: PairInfo) {
    const col = this.db.collection(this.collectionName);
    const isExist = await col.findOne({ hash: data.hash });
    if (isExist) return;
    await col.insertOne(data);
  }

  public async insertPriceChangeInfo(data: PriceChangeInfo) {
    const col = this.db.collection(this.collectionName);
    const isExist = await col.findOne({ hash: data.hash });
    if (isExist) return;
    await col.insertOne(data);
  }

  public async getStatistic() {
    const col = this.db.collection(this.collectionName);
    const data = await col.find({ type: "price_change" }).toArray();
    return data.map(item => {
      return {
        hash: item.hash,
        token1Price: new Dec(item.token1Reserve)
          .div(new Dec(item.token2Reserve))
          .toString(),
        token2Price: new Dec(item.token2Reserve)
          .div(new Dec(item.token1Reserve))
          .toString(),
      };
    });
  }
}

export default CollectionTransaction;
