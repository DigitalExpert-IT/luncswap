import { TokenMeta } from "@/interface";
import { PromiseActorLogic, assign, setup } from "xstate";

export const tokenMachine = setup({
  types: {
    events: {} as {
      type: "LOAD_LIST";
    },
    context: {} as {
      tokenList: TokenMeta[];
    },
  },
  actors: {} as {
    loadList: PromiseActorLogic<TokenMeta[]>;
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
    fetched: {},
    error: {},
  },
});
