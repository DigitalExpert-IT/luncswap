import { Pair, TokenInfoList } from "@/interface";
import { PromiseActorLogic, assign, setup } from "xstate";

export const liquidityMachine = setup({
  types: {
    events: {} as {
      type: "LOAD_PAIR_LIST";
    },
    context: {} as {
      pairLiquidity: Pair[];
      tokensInfo: TokenInfoList;
      isAllPairsFetched: boolean;
    },
  },
  actions: {} as {
    loadPairList: PromiseActorLogic<Pair[]>;
    loadTokenInfo: PromiseActorLogic<TokenInfoList>;
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QQIa1iiA6AlhANmAMQAyA8gIIAiA+gAoUCSASjSYwMoAqA2gAwBdRKAAOAe1g4ALjjEA7YSAAeiAMzqsAJlV8+ARj4BWY5s0AaEAE9EegOwBOLAA4ALPfd8AbIb2vPegF8Ai1R0TFwCYnJqeiZWdm4ePSEkEHFJGXlFFQQXcysbTRcse0NdPhdKwwc9VU8g4JA5MQg4RVCMCEV06VkFVJyAWk8LawRhoJC0TojCbolerIHCpyw+TTKjTT5VV1VTUZsnPi1PcurDJz17Hc1JkA7wgDMwKQBjAAtIeYy+7MR-Cd1GVNHo9C4+E5doZDghfCdNGddBcrjd9g0AkA */
  description: `State for storing liquidity token and info stuff`,
  id: "liquidity",
  context: {
    pairLiquidity: [],
    tokensInfo: {},
    isAllPairsFetched: false,
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        LOAD_PAIR_LIST: {
          target: "load_pair_list",
        },
      },
    },
    load_pair_list: {
      tags: ["loading"],
      invoke: {
        src: "loadPairList",
        input: ({ context }) => context.pairLiquidity,
        onDone: [
          {
            actions: assign({
              pairLiquidity: ({ event }) => event.output.pairList,
              isAllPairsFetched: ({ event }) => event.output.isAllPairsFetched,
            }),
            target: "load_token_info",
          },
        ],
        onError: {
          target: "idle",
        },
      },
    },
    load_token_info: {
      tags: ["loading"],
      invoke: {
        src: "loadTokenInfo",
        input: ({ context }) => context.pairLiquidity,
        onDone: [
          {
            actions: assign({
              tokensInfo: ({ event }) => event.output,
            }),
            target: "idle",
          },
        ],
        onError: {
          target: "load_token_info",
        },
      },
    },
    fetched: {},
  },
});
