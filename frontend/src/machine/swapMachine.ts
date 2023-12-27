import { Pair, PairInfo, TokenMeta } from "@/interface";
import { setup, PromiseActorLogic, assertEvent, assign } from "xstate";

export const swapMachine = setup({
  types: {
    events: {} as
      | {
          type: "LOAD_PAIR";
          value: [TokenMeta, TokenMeta];
        }
      | {
          type: "CALCULATE_OUTPUT";
          value: { tokenMeta: TokenMeta; amount: bigint };
        }
      | {
          type: "CALCULATE_INPUT";
          value: { tokenMeta: TokenMeta; amount: bigint };
        },
    context: {} as {
      pair: Pair | undefined;
      pairInfo: PairInfo | undefined;
      token1Meta: TokenMeta | undefined;
      token2Meta: TokenMeta | undefined;
      priceImpact: number;
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
    priceImpact: 0,
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
      on: {
        CALCULATE_OUTPUT: {
          actions: assign(({ event, context }) => {
            let token1Amount = BigInt(0);
            let token2Amount = BigInt(0);
            const token1Reserve = BigInt(context.pairInfo!.token1_reserve);
            const token2Reserve = BigInt(context.pairInfo!.token2_reserve);
            let priceImpact = 0;
            const k = token1Reserve * token2Reserve;

            if (event.value.tokenMeta.address === context.token1Meta?.address) {
              token1Amount = event.value.amount;
              const divisor = k / (token1Reserve + token1Amount);
              token2Amount = token2Reserve - divisor;
              priceImpact =
                1 - Math.sqrt(1 - Number(token1Amount) / Number(token1Reserve));
            } else {
              token2Amount = event.value.amount;
              const divisor = k / (token2Reserve + token2Amount);
              token1Amount = token1Reserve - divisor;
              priceImpact =
                1 - Math.sqrt(1 - Number(token2Amount) / Number(token2Reserve));
            }

            return {
              priceImpact: isNaN(priceImpact) ? 1 : priceImpact,
              token1Amount,
              token2Amount,
            };
          }),
        },
        CALCULATE_INPUT: {
          actions: assign(({ event, context }) => {
            let token1Amount = BigInt(0);
            let token2Amount = BigInt(0);
            const token1Reserve = BigInt(context.pairInfo!.token1_reserve);
            const token2Reserve = BigInt(context.pairInfo!.token2_reserve);
            let priceImpact = 0;

            if (event.value.tokenMeta.address === context.token1Meta?.address) {
              token1Amount = event.value.amount;
              if (token1Amount >= token1Reserve) {
                token2Amount = BigInt(Number.MAX_SAFE_INTEGER);
              } else {
                token2Amount =
                  (token1Amount * token2Reserve) /
                  (token1Reserve - token1Amount);
              }
              priceImpact =
                1 - Math.sqrt(1 - Number(token2Amount) / Number(token2Reserve));
            } else {
              token2Amount = event.value.amount;
              if (token2Amount >= token2Reserve) {
                token1Amount = BigInt(Number.MAX_SAFE_INTEGER);
              } else {
                token1Amount =
                  (token2Amount * token1Reserve) /
                  (token2Reserve - token2Amount);
              }
              priceImpact =
                1 - Math.sqrt(1 - Number(token1Amount) / Number(token1Reserve));
            }

            return {
              priceImpact: isNaN(priceImpact) ? 1 : priceImpact,
              token1Amount,
              token2Amount,
            };
          }),
        },
      },
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
