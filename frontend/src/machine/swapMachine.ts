import { Pair, PairInfo, TokenMeta } from "@/interface";
import { setup, PromiseActorLogic, assertEvent, assign } from "xstate";

export const swapMachine = setup({
  types: {
    events: {} as {
      type: "LOAD_PAIR";
      value: [TokenMeta, TokenMeta];
    },
    context: {} as {
      pair: Pair | undefined;
      pairInfo: PairInfo | undefined;
      token1Meta: TokenMeta | undefined;
      token2Meta: TokenMeta | undefined;
      token1Balance: bigint;
      token2Balance: bigint;
      token1Amount: bigint;
      token2Amount: bigint;
    },
  },
  actions: {} as {
    errorCb: (error: unknown) => void;
  },
  actors: {} as {
    loadPair: PromiseActorLogic<
      | undefined
      | {
          pair: Pair;
          pairInfo: PairInfo;
          token1Meta: TokenMeta;
          token2Meta: TokenMeta;
        },
      [TokenMeta, TokenMeta]
    >;
    loadTokenBalance: PromiseActorLogic<
      {
        token1Balance: bigint;
        token2Balance: bigint;
      },
      { token1: TokenMeta; token2: TokenMeta }
    >;
  },
  guards: {
    isNoLiquidity: ({ context }) =>
      BigInt(context.pairInfo?.token1_reserve ?? 0) *
        BigInt(context.pairInfo?.token2_reserve ?? 0) ===
      BigInt(0),
  },
}).createMachine({
  id: "swap",
  context: {
    pair: undefined,
    pairInfo: undefined,
    token1Meta: undefined,
    token2Meta: undefined,
    token1Balance: BigInt(0),
    token2Balance: BigInt(0),
    token1Amount: BigInt(0),
    token2Amount: BigInt(0),
  },
  initial: "idle",
  on: {
    LOAD_PAIR: {
      target: ".load_pair",
    },
  },
  states: {
    idle: {},
    load_pair: {
      tags: ["loading"],
      invoke: {
        src: "loadPair",
        input: ({ event }) => {
          assertEvent(event, "LOAD_PAIR");
          return event.value;
        },
        onDone: [
          {
            guard: ({ event }) => event.output === undefined,
            target: "no_pair",
          },
          {
            target: "load_token_balance",
            actions: [
              assign({
                pair: ({ event }) => event.output!.pair,
                pairInfo: ({ event }) => event.output!.pairInfo,
                token1Meta: ({ event }) => event.output!.token1Meta,
                token2Meta: ({ event }) => event.output!.token2Meta,
              }),
            ],
          },
        ],
        onError: {
          target: "idle",
          actions: ["errorCb"],
        },
      },
    },
    load_token_balance: {
      tags: ["loading"],
      description:
        "load denom information like decimals and balance for each denom",
      invoke: {
        src: "loadTokenBalance",
        input: ({ context }) => ({
          token1: context.token1Meta!,
          token2: context.token2Meta!,
        }),
        onDone: {
          target: "ready",
          actions: assign({
            token1Balance: ({ event }) => event.output.token1Balance,
            token2Balance: ({ event }) => event.output.token2Balance,
          }),
        },
        onError: {
          actions: [
            assign({
              pair: () => undefined,
              pairInfo: () => undefined,
            }),
            "errorCb",
          ],
          target: "idle",
        },
      },
    },
    ready: {
      always: [
        {
          description:
            "if there's no liquidity, transition to state no_liquidity",
          guard: "isNoLiquidity",
          target: "no_liquidity",
        },
      ],
    },
    no_liquidity: {},
    no_pair: {},
  },
});
