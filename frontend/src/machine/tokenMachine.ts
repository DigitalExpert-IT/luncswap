import { TokenMeta } from "@/interface";
import { PromiseActorLogic, assertEvent, assign, setup } from "xstate";

export const tokenMachine = setup({
  types: {
    events: {} as
      | {
          type: "LOAD_LIST";
        }
      | {
          type: "SEARCH_TOKEN";
          value: {
            address: string;
          };
        },
    context: {} as {
      tokenList: TokenMeta[];
    },
  },
  actors: {} as {
    loadList: PromiseActorLogic<TokenMeta[]>;
    searchToken: PromiseActorLogic<
      TokenMeta | undefined,
      { address: string; tokenList: TokenMeta[] }
    >;
  },
}).createMachine({
  id: "token",
  context: {
    tokenList: [],
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        LOAD_LIST: {
          target: "load_list",
        },
        SEARCH_TOKEN: {
          target: "search_token",
        },
      },
    },
    search_token: {
      tags: ["loading"],
      invoke: {
        src: "searchToken",
        input: ({ event, context }) => {
          assertEvent(event, "SEARCH_TOKEN");
          return {
            address: event.value.address,
            tokenList: context.tokenList,
          };
        },
        onDone: [
          {
            guard: ({ event }) => event.output === undefined,
            target: "idle",
          },
          {
            target: "idle",
            actions: assign({
              tokenList: ({ event, context }) =>
                [event.output!].concat(context.tokenList),
            }),
          },
        ],
      },
    },
    load_list: {
      tags: ["loading"],
      invoke: {
        src: "loadList",
        onDone: [
          {
            actions: assign({ tokenList: ({ event }) => event.output }),
            target: "fetched",
          },
        ],
        onError: {
          target: "error",
        },
      },
    },
    fetched: {
      on: {
        SEARCH_TOKEN: {
          target: "search_token",
        },
      },
    },
    error: {},
  },
});
