import { LCDClient } from "@terra-money/terra.js";
import { lcdConfigMap, factoryContractAddress } from "@/constant/network";
import TxWrapper from "@/backend/cosmutils/TxWrapper";

class Worker {
  private lcd: LCDClient;
  private pairContractSet = new Set<string>();
  private factoryAddress = "";
  constructor(chainID: string) {
    const lcdConfig = lcdConfigMap[chainID as "pisco-1"];
    this.lcd = new LCDClient({
      URL: lcdConfig.lcd,
      chainID,
    });
    this.factoryAddress = factoryContractAddress[chainID as "pisco-1"];
    if (!this.factoryAddress) {
      throw Error(`No Factory Contract on chain ${chainID}`);
    }
    this.run();
  }

  private async run(blockHeight = 9022196) {
    console.log("checking on block", blockHeight);
    const txList = await this.lcd.tx.txInfosByHeight(blockHeight);
    for (const tx of txList) {
      console.log("checking on tx", tx.txhash);
      const txw = new TxWrapper(tx);
      const pairInfo = txw.parsePairInfo(this.factoryAddress);
      if (pairInfo) {
        this.pairContractSet.add(pairInfo.pairContractAddress);
        console.log(pairInfo);
      }
    }
    await this.run(blockHeight + 1);
  }
}

export const createWorker = (() => {
  let worker: Worker;
  return (chainId: string) => {
    if (worker) return worker;
    worker = new Worker(chainId);
    return worker;
  };
})();

export default Worker;
