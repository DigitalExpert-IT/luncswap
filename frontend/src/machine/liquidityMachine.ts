import { Pair, TokenInfoList } from "@/interface";
import { PromiseActorLogic, assign, setup } from "xstate";

type ContextType = {
  pairLiquidity: Pair[];
  tokensInfo: TokenInfoList;
  isAllPairsFetched: boolean;
  userPairBalances: { lp_address: string; balance: string }[];
};

const initialContext: ContextType = {
  pairLiquidity: [],
  tokensInfo: {},
  isAllPairsFetched: false,
  userPairBalances: [],
};

export const liquidityMachine = setup({
  types: {
    events: {} as
      | {
          type: "LOAD_PAIR_LIST";
        }
      | {
          type: "REFETCH_PAIR_LIST";
        },
    context: {} as ContextType,
  },
  actors: {} as {
    loadPairList: PromiseActorLogic<{
      pairList: Pair[];
      isAllPairsFetched: boolean;
    }>;
    refetchPairList: PromiseActorLogic<{
      pairList: Pair[];
      isAllPairsFetched: boolean;
    }, Pair[]>;
    loadTokenInfo: PromiseActorLogic<TokenInfoList, Pair[]>;
    loadBalancePair: PromiseActorLogic<string[], Pair[]>;
  },
}).createMachine({
  id: "liquidity",
  context: initialContext,
  initial: "idle",
  states: {
    idle: {
      on: {
        LOAD_PAIR_LIST: {
          target: "load_pair_list",
        },
        REFETCH_PAIR_LIST: {
          target: "refetch_pair_list",
        },
      },
    },

    load_pair_list: {
      tags: ["loading"],
      invoke: {
        src: "loadPairList",
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
            target: "load_balance_pair",
          },
        ],
        onError: {
          target: "load_token_info",
        },
      },
    },

    refetch_pair_list: {
      tags: ["loading"],
      invoke: {
        src: "refetchPairList",
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
        onError: {},
      },
    },

    load_balance_pair: {
      tags: ["loading"],
      invoke: {
        src: "loadBalancePair",
        input: ({ context }) => context.pairLiquidity,
        onDone: [
          {
            actions: assign({
              userPairBalances: ({ event, context }) =>
                context.pairLiquidity.map((pair, id) => ({
                  lp_address: pair.lp_address,
                  balance: event.output[id],
                })),
            }),
            target: "idle",
          },
        ],
      },
    },
  },
});
