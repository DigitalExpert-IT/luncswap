import { Pair, PairFee, PairInfo, TokenMeta } from "@/interface";
import { setup, PromiseActorLogic, assertEvent, assign } from "xstate";
import { Dec } from "@terra-money/feather.js";

type ContextType = {
  pair: Pair | undefined;
  pairInfo: PairInfo | undefined;
  pairFee: PairFee | undefined;
  token1Meta: TokenMeta | undefined;
  token2Meta: TokenMeta | undefined;
  priceImpact: number;
  token1Balance: Dec;
  token2Balance: Dec;
  token1Amount: Dec;
  token2Amount: Dec;
};

const initialContext: ContextType = {
  pair: undefined,
  pairInfo: undefined,
  pairFee: undefined,
  token1Meta: undefined,
  token2Meta: undefined,
  priceImpact: 0,
  token1Balance: new Dec(0),
  token2Balance: new Dec(0),
  token1Amount: new Dec(0),
  token2Amount: new Dec(0),
};

export const swapMachine = setup({
  types: {
    events: {} as
      | { type: "SWAP"; value: { inputKind: 1 | 2 } }
      | {
          type: "LOAD_PAIR";
          value: [TokenMeta, TokenMeta];
        }
      | {
          type: "CALCULATE_OUTPUT";
          value: { tokenMeta: TokenMeta; amount: Dec };
        }
      | {
          type: "CALCULATE_INPUT";
          value: { tokenMeta: TokenMeta; amount: Dec };
        }
      | {
          type: "ADD_LIQUIDITY";
          value: { token1Amount: Dec; maxToken2Amount: Dec };
        },
    context: {} as ContextType,
  },
  actions: {
    errorCb: () => {},
    reset: assign(() => initialContext),
  },
  actors: {} as {
    loadPair: PromiseActorLogic<
      | undefined
      | {
          pair: Pair;
          pairFee: PairFee;
          pairInfo: PairInfo;
          token1Meta: TokenMeta;
          token2Meta: TokenMeta;
        },
      [TokenMeta, TokenMeta]
    >;
    loadTokenBalance: PromiseActorLogic<
      {
        token1Balance: Dec;
        token2Balance: Dec;
      },
      { token1: TokenMeta; token2: TokenMeta }
    >;
    swap: PromiseActorLogic<void, ContextType & { inputKind: 1 | 2 }>;
    refetchPairInfo: PromiseActorLogic<PairInfo, Pair>;
    addLiquidity: PromiseActorLogic<
      void,
      { pair: Pair; token1Amount: Dec; maxToken2Amount: Dec }
    >;
  },
  guards: {
    isNoLiquidity: ({ context }) =>
      BigInt(context.pairInfo?.token1_reserve ?? 0) *
        BigInt(context.pairInfo?.token2_reserve ?? 0) ===
      BigInt(0),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SwO4EMAOBiAMgeQEEARAfQAUCBJAJQG0AGAXUVAwHtYBLAF07YDsWIAB6IALACYANCACe4gGwBOAHRiAzGMkAOAIzKJAVnrbDAXzMzUmXIVIUatXcyQh2XXgKGiEkmfIRdAHYglSUgpSUJBSD1JTiJJQsrdAwVABs2NAgSDDROACcsCAEwFU5+ADc2AGsy6zTM7Nz8goQK6oBjNE9+BkZ+oXcePkFXHxDdFXVDdQlTCTiFdSCxf0RtCRUIoIVtJUNV+gUNc0sQBoysnLzC4tLyqtr61Kvm27aOtm7e-qcXVgcEZecaISbTWbzQyLJTLVbrBBzLZRehzdR6JS6FbJC6vJo3VpYMAFApsAoqDDpHoAMzJAFsVJd8S1Cu0nj9Rn8mEMgb1vGCglMZnMFksVms5IhgqoxCE5oY9FjDAoTDjLgUwNSwNxOgALFkFEgVWn3fhlL51RmvDVanX6j5G-i0tldHqcpiDVzDPmghDg4VQmFwiUBZQKML0RbLbRBGPaehJc7qzXavUGx0m4mk8mUmn0q2YFQ21P21oZtgu75ugRcgFuXmjfl+wUQkXQsXwyV+7TaFTzFViLHRbQq7RqvHXEjcZ78EgAIzQVP4nTApvNT0tTMn07qs4XS5XlY5NY93K9DZBoB8ullvaHQQk9HoQUjsIRWl7YgOSn2kXCL8TFJC2ZHcwD3Rc0GXVcszJCkqW4WkCgZLdmlA8CDzAI9qz6U8629RtfRvWMVHvR9n1fBQETmegVAUZR9DEWZZlhcdCw1bJZCwABlAB1AgyE9QEPAIq8pQVMRtkMXRlVWaF4kMBFmJUGNYRiLRY2MMck2tMAOKwABhAgcH0gBVHACAAFQAURIPATIssh7ME+thMvEQpRfQxaMMDQlATegpJVIIqO0dRtnmXR9GiH9oQUM4gLSdiIE4wzjLMyybMoAA5RyLOc-C3OvQUwp-RZ1F0fZlk0BSu3mVRNFhMRjhCbQxBOVjEt05KsGIUgcEoABFEzKCISgLIATXyi8xlEwIoi2fZQriDEFGkLsxFMcLNKkkINAkCQOqLLrOKm1yZvcub9uUn91GW3RYTWgJZgk8JDCk8JpXCdRDuyHJ0k4ABHABXTgIB4TiSjNR5qk3V5fpIf7gdB8GsN+XCeTOpsJEi1RsciR8mpk5UET88NMXRVbI1MPYDu0wt4cRkGwe4TiYJzeDEOQuGID+wGmZRr5jxwgYzyE4Fzp8bHH1o1qIkSZVB07AI4gkzQb2fB95MWMRDoaNdoeeAs0gaVH3RFvDpqbQcwux6FoRHY5wjohFdl7fbHzK+hGPmWmEqNokSVg3MEPzS4TcF7Dawx8WraxPtpKMftHd2Siu0xGj43oG9QqxHGznOfg2AgOAhAaaOfVmgBaVOAmrlQnwbxvG-mQ7QfSMBy5Ei7gji6YU5MOEolChFH1CGJbsOW9pLjQ7mQ+TvCsQQ5QlldRjnUE5bukhFglCBNdFRA5hy9zZDuLO102NNgF4lpev2UjfqP2+9gq7XYvNCw4VizyJdkA3FgLbhnPOCCUEb5NgPlJa6Mwfz3RfLEKiMw+xPkxKFZQBxVg6zpp1Di4DCLvz7nRAeKwh7qHfKFEixxDCoIUBVBU-9LgMz5sjFmeDZr7XjNMAKT4RSbATO+G8aglCDlCsIvyqlDqFwRsw5mAQxYVwuhwmia9jConmHwpQil74H2WnoE4KJ4oALSFI+e55MaEQClMfYMCMTwLIV2PQJE9DUyzrQ2Ub1dapDYYoxi10gizBMDop2NUAi7DChPPY91GK+W+hYMwQA */
  id: "swap",
  context: initialContext,
  initial: "idle",
  on: {
    LOAD_PAIR: [
      {
        description:
          "skip fetching pair if trying to load same pair as previous",
        guard: ({ event, context }) => {
          if (event.value[0].address === context.token1Meta?.address) {
            if (event.value[1].address === context.token2Meta?.address)
              return true;
          }

          if (event.value[1].address === context.token1Meta?.address) {
            if (event.value[0].address === context.token2Meta?.address)
              return true;
          }

          return false;
        },
        target: ".load_token_balance",
      },
      {
        target: ".load_pair",
        actions: ["reset"],
      },
    ],
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
                pairFee: ({ event }) => event.output!.pairFee,
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
    refetch_pair_info: {
      tags: ["loading"],
      invoke: {
        src: "refetchPairInfo",
        input: ({ context }) => context.pair!,
        onDone: {
          target: "load_token_balance",
          actions: assign({
            pairInfo: ({ event }) => event.output,
          }),
        },
        onError: {
          target: "ready",
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
        SWAP: {
          target: "swap",
        },
        CALCULATE_OUTPUT: {
          actions: assign(({ event, context }) => {
            if (event.value.amount.eq(new Dec(0))) {
              return {
                priceImpact: 0,
                token1Amount: new Dec(0),
                token2Amount: new Dec(0),
              };
            }
            let token1Amount = new Dec(0);
            let token2Amount = new Dec(0);
            const token1Reserve = new Dec(context.pairInfo!.token1_reserve);
            const token2Reserve = new Dec(context.pairInfo!.token2_reserve);
            const feePercent = +context.pairFee!.protocol_fee_percent;
            let priceImpact = 0;
            const k = token1Reserve.mul(token2Reserve);

            if (event.value.tokenMeta.address === context.token1Meta?.address) {
              token1Amount = event.value.amount;
              const token1FeeAmount = token1Amount.mul(feePercent).div(100);
              const token1AmountAfterFee = token1Amount.sub(token1FeeAmount);
              const subvisor = k.div(token1Reserve.add(token1AmountAfterFee));
              token2Amount = token2Reserve.sub(subvisor);
              priceImpact =
                1 - Math.sqrt(1 - Number(token1Amount) / Number(token1Reserve));
            } else {
              token2Amount = event.value.amount;
              const token2FeeAmount = token2Amount.mul(feePercent).div(100);
              const token2AmountAfterFee = token2Amount.sub(token2FeeAmount);
              const subvisor = k.div(token2Reserve.add(token2AmountAfterFee));
              token1Amount = token1Reserve.sub(subvisor);
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
            if (event.value.amount.eq(new Dec(0))) {
              return {
                priceImpact: 0,
                token1Amount: new Dec(0),
                token2Amount: new Dec(0),
              };
            }
            let token1Amount = new Dec(0);
            let token2Amount = new Dec(0);
            const token1Reserve = new Dec(context.pairInfo!.token1_reserve);
            const token2Reserve = new Dec(context.pairInfo!.token2_reserve);
            const feePercent = new Dec(context.pairFee!.protocol_fee_percent);
            let priceImpact = 0;

            if (event.value.tokenMeta.address === context.token1Meta?.address) {
              token1Amount = event.value.amount;
              if (token1Amount >= token1Reserve) {
                token2Amount = new Dec(Number.MAX_SAFE_INTEGER);
              } else {
                token2Amount = token1Amount
                  .mul(
                    token2Reserve.add(token2Reserve.mul(feePercent).div(100)),
                  )
                  .div(token1Reserve.sub(token1Amount))
                  .add(1);
              }
              priceImpact =
                1 - Math.sqrt(1 - Number(token2Amount) / Number(token2Reserve));
            } else {
              token2Amount = event.value.amount;
              if (token2Amount >= token2Reserve) {
                token1Amount = new Dec(Number.MAX_SAFE_INTEGER);
              } else {
                token1Amount = token2Amount
                  .mul(
                    token1Reserve.add(token1Reserve.mul(feePercent).div(100)),
                  )
                  .div(token2Reserve.sub(token2Amount))
                  .add(1);
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
        ADD_LIQUIDITY: {
          target: "add_liquidity",
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
    add_liquidity: {
      tags: ["loading"],
      invoke: {
        src: "addLiquidity",
        input: ({ context, event }) => {
          assertEvent(event, "ADD_LIQUIDITY");
          return {
            pair: context.pair!,
            token1Amount: event.value.token1Amount,
            maxToken2Amount: event.value.maxToken2Amount,
          };
        },
        onDone: {
          target: "refetch_pair_info",
        },
        onError: {
          target: "ready",
          actions: ["errorCb"],
        },
      },
    },
    no_liquidity: {},
    no_pair: {},
    swap: {
      tags: ["loading"],
      invoke: {
        src: "swap",
        input: ({ context, event }) => {
          assertEvent(event, "SWAP");
          return {
            ...context,
            inputKind: event.value.inputKind,
          };
        },
        onDone: {
          target: "refetch_pair_info",
          actions: assign({
            token1Amount: new Dec(0),
            token2Amount: new Dec(0),
            priceImpact: 0,
          }),
        },
        onError: {
          target: "ready",
          actions: ["errorCb"],
        },
      },
    },
  },
});
