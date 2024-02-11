import { LCDClient } from "@terra-money/terra.js";
import { lcdConfigMap, factoryContractAddress } from "@/constant/network";
import { Db } from "mongodb";
import TxWrapper from "@/backend/cosmutils/TxWrapper";
import CollectionTransaction from "@/backend/collection/transaction";

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

class Worker {
  private lcd: LCDClient;
  private pairContractSet = new Set<string>();
  private factoryAddress = "";
  private txCol: CollectionTransaction;
  constructor(chainID: string, db: Db) {
    this.txCol = new CollectionTransaction(db);
    const lcdConfig = lcdConfigMap[chainID as "pisco-1"];
    this.lcd = new LCDClient({
      URL: lcdConfig.lcd,
      chainID,
    });

    this.factoryAddress = factoryContractAddress[chainID as "pisco-1"];
    if (!this.factoryAddress) {
      throw new Error(`No Factory Contract on chain ${chainID}`);
    }

    this.initialize();
  }

  private async initialize() {
    let blockHeight = await this.txCol.getLatestBlock();
    if (blockHeight === 0) {
      const contractHistory = await this.lcd.wasm.contractHistory(
        this.factoryAddress,
      );
      blockHeight = contractHistory[0][0]?.updated?.block_height ?? 0;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.processBlock(blockHeight);
      await sleep(1000 * 60);
      blockHeight++;
    }
  }

  private async processBlock(blockHeight: number) {
    console.log("Checking on block", blockHeight);
    const txList = await this.lcd.tx.txInfosByHeight(blockHeight);
    for (const tx of txList) {
      console.log("Checking on tx", tx.txhash);
      const txw = new TxWrapper(tx);
      const pairInfo = txw.parsePairInfo(this.factoryAddress);
      if (pairInfo) {
        this.pairContractSet.add(pairInfo.contractAddress);
        await this.txCol.insertPairInfo(pairInfo);
      }

      for (const pairAddress of this.pairContractSet) {
        const priceChangeInfo = txw.parsePriceChange(pairAddress);
        if (priceChangeInfo) {
          await this.txCol.insertPriceChangeInfo(priceChangeInfo);
        }
      }
    }
  }
}

export const createWorker = (() => {
  let worker: Worker;
  return (chainId: string, db: Db) => {
    if (worker) return worker;
    worker = new Worker(chainId, db);
    return worker;
  };
})();

export default Worker;
