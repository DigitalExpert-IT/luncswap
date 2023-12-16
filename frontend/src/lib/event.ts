import { TxInfo } from "@terra-money/feather.js";

export const findEventAttribute = (key: string, info?: TxInfo) => {
  if (!info) return undefined;
  for (const log of info.logs ?? []) {
    for (const event of log.events) {
      for (const attr of event.attributes) {
        if (attr.key === key) return attr.value;
      }
    }
  }
};
