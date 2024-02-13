import { LCDClient } from "@terra-money/terra.js";
import { lcdConfigMap, factoryContractAddress } from "@/constant/network";
import { Db } from "mongodb";
import TxWrapper from "@/backend/cosmutils/TxWrapper";
import CollectionTransaction from "@/backend/collection/transaction";

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

class Worker {
  private lcd: LCDClient;
  private pairContractSet = new Set<string>();
  private factoryAddress = "";
  private txCol: CollectionTransaction;
  private readonly blockRange = 100;
  private startBlock: number;
  private endBlock: number;

  constructor(
    chainID: string,
    db: Db,
    startBlock: number = 1,
    endBlock: number = startBlock + 99,
  ) {
    this.txCol = new CollectionTransaction(db);
    const lcdConfig = lcdConfigMap[chainID as "pisco-1"];
    this.lcd = new LCDClient({
      URL: lcdConfig.lcd,
      chainID,
    });

    this.factoryAddress = factoryContractAddress[chainID as "pisco-1"];
    if (!this.factoryAddress) {
      throw new Error(`No Factory Contract found for chain ${chainID}`);
    }

    this.startBlock = startBlock;
    this.endBlock = endBlock;
    this.initialize();
  }

  private async initialize() {
    await this.fetchInitialPairList();
    this.run();
  }

  private async fetchInitialPairList() {
    const pairList = await this.txCol.getPairList();
    pairList.forEach(pairAddress => this.pairContractSet.add(pairAddress));
  }

  private async getCurrentBlockHeight() {
    const blockInfo = await this.lcd.tendermint.blockInfo();
    return +blockInfo.block.header.height;
  }

  private async run() {
    let currentBlock = this.startBlock;
    while (currentBlock <= this.endBlock) {
      console.log(
        `Checking transactions from block ${currentBlock} to block ${this.endBlock}...`,
      );

      try {
        await this.processTransactionsInRange(currentBlock, this.endBlock);
      } catch (error) {
        console.error(`Error processing transactions: ${error}`);
      }

      const currentBlockHeight = await this.getCurrentBlockHeight();
      if (currentBlockHeight <= this.endBlock) {
        console.log("Sleeping for 1 minute...");
        await sleep(1000 * 60);
      }

      currentBlock += this.blockRange;
      this.endBlock = Math.min(
        this.endBlock + this.blockRange,
        currentBlockHeight,
      );
    }
  }

  private async processTransactionsInRange(
    startBlock: number,
    endBlock: number,
  ) {
    for (let blockHeight = startBlock; blockHeight <= endBlock; blockHeight++) {
      const txList = await this.lcd.tx.txInfosByHeight(blockHeight);

      for (const tx of txList) {
        console.log(
          `Processing transaction ${tx.txhash} from block ${blockHeight}...`,
        );
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
}

export const createWorker = (() => {
  let worker: Worker;
  return (
    chainId: string,
    db: Db,
    startBlock: number,
    endBlock: number = startBlock + 99,
  ) => {
    if (worker) return worker;
    worker = new Worker(chainId, db, startBlock, endBlock);
    return worker;
  };
})();

export default Worker;
