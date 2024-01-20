import { Pair, TokenInfoList } from "@/interface";
import { PromiseActorLogic, assign, setup } from "xstate";

type ContextType = {
  pairLiquidity: Pair[];
  tokensInfo: TokenInfoList;
  isAllPairsFetched: boolean;
};

const initialContext: ContextType = {
  pairLiquidity: [],
  tokensInfo: {},
  isAllPairsFetched: false,
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
    }>;
    loadTokenInfo: PromiseActorLogic<TokenInfoList>;
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
            target: "idle",
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
  },
});
