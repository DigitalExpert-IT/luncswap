import { PairInfo } from "@/backend/model";
import { Db } from "mongodb";

class CollectionTransaction {
  private db: Db;
  private dbName = "transaction";

  constructor(db: Db) {
    this.db = db;
    this.createIndex();
  }

  private async createIndex() {
    const col = this.db.collection(this.dbName);

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
    const col = this.db.collection(this.dbName);
    const pairList = (await col.find({ type: "pair_info" }).toArray()).map(
      item => item.contractAddress as string,
    );
    return pairList;
  }

  public async getLatestBlock() {
    const col = this.db.collection(this.dbName);
    const [tx] = await col.find().limit(1).sort({ blockHeight: -1 }).toArray();
    return (tx?.blockHeight ?? 0) as number;
  }

  public async insertPairInfo(data: PairInfo) {
    const col = this.db.collection(this.dbName);
    const isExist = await col.findOne({ hash: data.hash });
    if (isExist) return;
    await col.insertOne(data);
  }
}

export default CollectionTransaction;
