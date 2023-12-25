import { Denom, Pair, PairInfo } from "@/interface";
import { setup, PromiseActorLogic, assign } from "xstate";

export const pairMachine = setup({
  types: {
    events: {} as { type: "LOAD_PAIR"; value: [Denom, Denom] },
    context: {} as {
      pair: undefined | Pair;
      pairInfo: undefined | PairInfo;
    },
  },
  actors: {} as {
    loadPair: PromiseActorLogic<[Pair, PairInfo], [Denom, Denom]>;
  },
}).createMachine({
  id: "pair",
  initial: "idle",
  context: {
    pair: undefined,
    pairInfo: undefined,
  },
  states: {
    idle: {
      on: {
        LOAD_PAIR: {
          target: "load",
        },
      },
    },
    load: {
      tags: ["loading"],
      invoke: {
        src: "loadPair",
        onDone: {
          actions: assign({
            pair: ({ event }) => event.output[0],
            pairInfo: ({ event }) => event.output[1],
          }),
          target: "ready",
        },
        onError: {
          target: "error",
        },
        input: ({ event }) => event.value,
      },
    },
    ready: {
      on: {
        LOAD_PAIR: {
          target: "load",
        },
      },
    },
    error: {
      on: {
        LOAD_PAIR: {
          target: "load",
        },
      },
    },
  },
});
