import { LCDClient } from "@terra-money/terra.js";
import { lcdConfigMap, factoryContractAddress } from "@/constant/network";
import { Db } from "mongodb";
import TxWrapper from "@/backend/cosmutils/TxWrapper";
import CollectionTransaction from "@/backend/collection/transaction";

const sleep = (ms: number) =>
  new Promise(resolve => {
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
      throw Error(`No Factory Contract on chain ${chainID}`);
    }

    this.txCol.getPairList().then(pairList => {
      for (const pairAddress of pairList) {
        this.pairContractSet.add(pairAddress);
      }

      this.run().catch(() => this.run());
    });
  }

  private async getCurrentBlockHeight() {
    const blockInfo = await this.lcd.tendermint.blockInfo();
    return +blockInfo.block.header.height;
  }

  // TODO
  // refactor using while / for loop / anything other than recursion
  // this still use recursion that may fail because of callstack limit
  private async run(blockHeight = 0) {
    if (blockHeight === 0) {
      blockHeight = await this.txCol.getLatestBlock();
      if (blockHeight === 0) {
        const contractHistory = await this.lcd.wasm.contractHistory(
          this.factoryAddress,
        );
        blockHeight = contractHistory[0][0].updated?.block_height ?? 0;
      }
    }

    console.log("checking on block", blockHeight);
    // TODO
    // check transaction list on block range for example
    // obtain all tx list on block 1-100
    const txList = await this.lcd.tx.txInfosByHeight(blockHeight);
    for (const tx of txList) {
      console.log("checking on tx", tx.txhash);
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
    const currentBlockHeight = await this.getCurrentBlockHeight();
    if (currentBlockHeight <= blockHeight) {
      console.log("sleeping for 1 minute");
      await sleep(1000 * 60);
    }
    await this.run(blockHeight + 1);
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
