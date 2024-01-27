import { TxLog, TxInfo } from "@terra-money/terra.js";
import { PairInfo } from "@/backend/model";

class TxWrapper {
  private tx: TxInfo;
  private logList: TxLog[];

  constructor(tx: TxInfo) {
    this.tx = tx;
    this.logList = tx.logs ?? [];
  }

  private findAttrValue(eventType: string, attrName: string) {
    for (const log of this.logList) {
      for (const event of log.events) {
        if (event.type !== eventType) continue;

        for (const attr of event.attributes) {
          if (attr.key === attrName) {
            return attr.value;
          }
        }
      }
    }
  }

  /**
   * parse if a tx represent add_par execution on provided factory contract address
   * if true than extract it's lp_token and pair contract address
   * @param factoryContractAddress
   * @returns PairInfo | null
   */
  public parsePairInfo(factoryContractAddress: string): PairInfo | null {
    if (this.tx.code !== 0) return null; // ignore failed tx

    const messages = this.tx.tx.body.messages.map(messageRaw => {
      try {
        return JSON.parse(messageRaw.toJSON());
      } catch (error) {
        return {};
      }
    });

    for (const message of messages) {
      if (!message?.msg?.add_pair) return null;
      const executedContractAddress = this.findAttrValue(
        "execute",
        "_contract_address",
      );
      if (executedContractAddress === factoryContractAddress) {
        let contractAddress = "";
        let lpTokenContractAddress = "";
        let sender = "";
        for (const log of this.logList) {
          const eventsByType = log.eventsByType;
          contractAddress =
            eventsByType?.instantiate?._contract_address?.[0] ?? "";
          lpTokenContractAddress =
            eventsByType?.instantiate?._contract_address?.[1] ?? "";
          sender = eventsByType?.message?.sender[0] ?? "";

          if (
            contractAddress !== "" &&
            lpTokenContractAddress !== "" &&
            sender !== ""
          )
            break;
        }
        return {
          type: "pair_info",
          hash: this.tx.txhash,
          blockHeight: this.tx.height,
          timestamp: new Date(this.tx.timestamp),
          tx: this.tx,
          sender,
          contractAddress,
          lpTokenContractAddress,
          factoryContractAddress,
        };
      }
    }

    return null;
  }
}

export default TxWrapper;
