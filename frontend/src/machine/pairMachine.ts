import {
  AddLiquidityRequest,
  Denom,
  Pair,
  PairInfo,
  SwapRequest,
} from "@/interface";
import { setup, PromiseActorLogic, assign, assertEvent } from "xstate";

export const pairMachine = setup({
  types: {
    events: {} as
      | { type: "LOAD_PAIR"; value: [Denom, Denom] }
      | { type: "SWAP"; value: SwapRequest }
      | { type: "ADD_LIQUIDITY"; value: AddLiquidityRequest },
    context: {} as {
      pair: undefined | Pair;
      pairInfo: undefined | PairInfo;
    },
  },
  actors: {} as {
    loadPair: PromiseActorLogic<[Pair, PairInfo], [Denom, Denom]>;
    swap: PromiseActorLogic<void, [string, SwapRequest]>;
    addLiquidity: PromiseActorLogic<void, [string, AddLiquidityRequest]>;
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcCGBLATgOnRANmAMQAyA8gIIAiA+gAoUCSASgNoAMAuoigPazoALul4A7HiAAeiAIwA2AMzYAnAHZlM1QA4N7GVv0AmADQgAnrMMBWbDJlXD9hwBY7htQF8PptFmz5eVAgiCDEwXFEAN14Aa3DfHACghHQo3gBjVGExDk5ciWR+IRFxJClEByUtQ3d9GUMFZ2c5ZVMLBANsBRrldmVlQzkmmWdVLx8MRMDgsExMXhxkfCyAMwWAW2wE-2mUtMzs0Vz8ssKBQ4lpBErsatqDBqaWttlVJStVdms1LQVlP+UVnGIG2mDAQTMpEotAYLBOfHOJUuFTkNisXw+DisznYzm6LwQNXYXVUzkBWmc1T0GmBoPBEEhAGUAOoUOjwkFFC5lK5yPTYPn-HGqRR4oYE9GqbCOLSqKyNOUDFq0ybYMEQojUWgkRgARQAqowqIwACoATQ5Z2KYmR1262D6MnYFIUf3sDQJhk+tllTXl6OUckUchVflgAHdUMgQmEItE4ltVRGo3togcSscuAUuUieRUGrcenVHs1WuZEK4lIKFFY+eoRVpUaGcMno7N5otloI1phNttW6mMlkM1xLTmbXnrgW7hoHo1SwTmsTXDjsap1xT10DvCDVUEIDR8OgAI4AVzwQkhoVE4VS8fie4gB6PZ4vgjMg-TOVHWdO49KoBXDcM7FvOzzlggCgyMoKj9OSci-HITp4s22D7oeJ7nhAl5EO2CxbF2PZ9o+z6YW+H53kOhyZtwf6IhOgH5lURZzk8ZbtAoQa3LiqJvAYCGAs4Xg7qIvAQHABSTNm9EAeUCAALRyAS8k2HBanqf0CioXghDSdaslXM4JgQfUNhekGWjsB8Xp9AoYw7tsSQQHp3KMZBNRdKZ0GqHYpJNKoBJOjItw+T57BypoyiUoYqHqgyLm5m5fHSmS-RBj82LGRxji2Ji+gKFZ+i-KhrYJQxcnzgKeLWAoFJWP8WUVnY2BiohaWGLi8qoehL5YZeZUGYgBXBaogxrkZqL9PYnpyFKehaNU6gyLVAzbl4QA */
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
          target: "ready",
        },
        input: ({ event }) => {
          assertEvent(event, "LOAD_PAIR");
          return event.value;
        },
      },
    },
    ready: {
      on: {
        LOAD_PAIR: {
          target: "load",
        },
        SWAP: {
          target: "swap",
        },
        ADD_LIQUIDITY: {
          target: "add_liquidity",
        },
      },
    },
    swap: {
      tags: ["loading"],
      invoke: {
        src: "swap",
        input: ({ event, context }) => {
          assertEvent(event, "SWAP");
          return [context.pair!.contract_address, event.value];
        },
        onDone: {
          target: "ready",
        },
        onError: {
          target: "ready",
        },
      },
    },
    add_liquidity: {
      tags: ["loading"],
      invoke: {
        src: "addLiquidity",
        input: ({ event, context }) => {
          assertEvent(event, "ADD_LIQUIDITY");
          return [context.pair!.contract_address, event.value];
        },
        onDone: {
          target: "ready",
        },
        onError: {
          target: "ready",
        },
      },
    },
  },
});
