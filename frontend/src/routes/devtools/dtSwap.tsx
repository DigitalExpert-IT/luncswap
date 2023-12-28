/* eslint-disable react-hooks/exhaustive-deps */
import TokenSelect from "@/components/TokenSelect";
import { SwapMachineContext, TokenMachineContext } from "@/machine";
import _debounce from "lodash/debounce";
import {
  Box,
  Button,
  FormControl,
  Input,
  InputGroup,
  Stack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { HiArrowsUpDown } from "react-icons/hi2";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toHumaneValue } from "@/utils";
import WrapWallet from "@/components/WrapWallet";

function DevtoolsSwap() {
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");

  const { swapActor } = useContext(SwapMachineContext);
  const { tokenActor } = useContext(TokenMachineContext);
  const { tokenList } = useSelector(tokenActor, state => {
    return {
      tokenList: state.context.tokenList,
    };
  });
  const {
    isLoading,
    isSwapReady,
    priceImpact,
    token1Meta,
    inputTokenReserve,
    outputTokenReserve,
    inputTokenDecimals,
    outputTokenDecimals,
    computedInputAmount,
    computedOutputAmount,
  } = useSelector(swapActor, state => {
    return {
      isLoading: state.hasTag("loading"),
      isSwapReady: state.matches("ready"),
      priceImpact: state.context.priceImpact,
      token1Meta: state.context.token1Meta,
      inputTokenReserve:
        inputAddress === state.context.token1Meta?.address
          ? state.context.pairInfo?.token1_reserve ?? "0"
          : state.context.pairInfo?.token2_reserve ?? "0",
      outputTokenReserve:
        outputAddress === state.context.token1Meta?.address
          ? state.context.pairInfo?.token1_reserve ?? "0"
          : state.context.pairInfo?.token2_reserve ?? "0",
      inputTokenDecimals:
        inputAddress === state.context.token1Meta?.address
          ? state.context.token1Meta.info.decimals
          : state.context.token2Meta?.info.decimals ?? 1,
      outputTokenDecimals:
        outputAddress === state.context.token1Meta?.address
          ? state.context.token1Meta.info.decimals
          : state.context.token2Meta?.info.decimals ?? 1,
      computedInputAmount:
        inputAddress === ""
          ? BigInt(0)
          : inputAddress === state.context.token1Meta?.address
            ? state.context.token1Amount
            : state.context.token2Amount,
      computedOutputAmount:
        outputAddress === ""
          ? BigInt(0)
          : outputAddress === state.context.token1Meta?.address
            ? state.context.token1Amount
            : state.context.token2Amount,
    };
  });

  useEffect(() => {
    if (inputAddress === outputAddress) setOutputAddress("");
  }, [inputAddress]);

  useEffect(() => {
    if (outputAddress === inputAddress) setInputAddress("");
  }, [outputAddress]);

  const inputTokenMeta = useMemo(() => {
    if (!inputAddress) return undefined;
    return tokenList.find(item => item.address === inputAddress);
  }, [inputAddress, tokenList]);

  const outputTokenMeta = useMemo(() => {
    if (!outputAddress) return undefined;
    return tokenList.find(item => item.address === outputAddress);
  }, [outputAddress, tokenList]);

  const computeOutput = useCallback(
    _debounce((val: string) => {
      if (!inputTokenMeta) return;
      if (val === "") return;
      const actualValue = BigInt(
        parseInt(String(+val * Math.pow(10, inputTokenDecimals))),
      );
      if (actualValue === computedInputAmount) return;

      swapActor.send({
        type: "CALCULATE_OUTPUT",
        value: { tokenMeta: inputTokenMeta, amount: actualValue },
      });
    }, 500),
    [inputTokenMeta, inputTokenDecimals],
  );

  const handleAddLiquidity = () => {
    swapActor.send({
      type: "ADD_LIQUIDITY",
      value: {
        token1Amount: BigInt(2e6),
        maxToken2Amount: BigInt(Number.MAX_SAFE_INTEGER),
      },
    });
  };

  const computeInput = useCallback(
    _debounce((val: string) => {
      if (!outputTokenMeta) return;
      if (val === "") return;
      const actualValue = BigInt(
        parseInt(String(+val * Math.pow(10, outputTokenDecimals))),
      );
      if (actualValue === computedOutputAmount) return;

      swapActor.send({
        type: "CALCULATE_INPUT",
        value: { tokenMeta: outputTokenMeta, amount: actualValue },
      });
    }, 500),
    [outputTokenDecimals, outputTokenMeta],
  );

  useEffect(() => {
    const inputHumaneValue = toHumaneValue(
      computedInputAmount,
      inputTokenDecimals,
    );
    const outputHumaneValue = toHumaneValue(
      computedOutputAmount,
      outputTokenDecimals,
    );

    setInputAmount(inputHumaneValue);
    setOutputAmount(outputHumaneValue);
  }, [computedInputAmount, computedOutputAmount]);

  const isAllInputFilled = !!inputTokenMeta && !!outputTokenMeta;

  const handleReverse = () => {
    const temp = inputAddress;
    setInputAddress(outputAddress);
    setOutputAddress(temp);
    requestAnimationFrame(() => {
      setInputAmount("0");
      setOutputAmount("0");
      computeInput("0");
    });
  };

  const switchPair = () => {
    if (!inputTokenMeta) return;
    if (!outputTokenMeta) return;
    swapActor.send({
      type: "LOAD_PAIR",
      value: [inputTokenMeta, outputTokenMeta],
    });
  };

  const handleSwap = () => {
    swapActor.send({
      type: "SWAP",
      value: { inputKind: inputAddress === token1Meta?.address ? 1 : 2 },
    });
  };

  useEffect(() => {
    if (inputAddress === outputAddress) return;
    if (inputAddress && outputAddress) switchPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAddress, outputAddress]);

  return (
    <Stack bg="gray.800" p="4" align="center">
      <FormControl>
        <InputGroup>
          <Input
            type="number"
            value={inputAmount}
            onChange={e => {
              computeOutput(e.currentTarget.value);
              setInputAmount(e.currentTarget.value);
            }}
            onKeyDown={e => {
              computeOutput(e.currentTarget.value);
            }}
          />
          <Box>
            <TokenSelect value={inputAddress} onChange={setInputAddress} />
          </Box>
        </InputGroup>
      </FormControl>
      <Box>
        <IconButton
          onClick={handleReverse}
          icon={<HiArrowsUpDown />}
          aria-label="reverse"
        />
      </Box>
      <FormControl>
        <InputGroup>
          <Input
            type="number"
            value={outputAmount}
            onChange={e => {
              computeInput(e.currentTarget.value);
              setOutputAmount(e.currentTarget.value);
            }}
            onKeyDown={e => {
              computeInput(e.currentTarget.value);
            }}
          />
          <Box>
            <TokenSelect value={outputAddress} onChange={setOutputAddress} />
          </Box>
        </InputGroup>
      </FormControl>
      {isSwapReady && isAllInputFilled ? (
        <Stack direction="row">
          <Text>Price Impact {(priceImpact * 100).toFixed(2)}%</Text>
          <Text>
            Input Reserve:{" "}
            {toHumaneValue(inputTokenReserve, inputTokenDecimals)}
          </Text>
          <Text>
            Output Reserve:{" "}
            {toHumaneValue(outputTokenReserve, outputTokenDecimals)}
          </Text>
        </Stack>
      ) : null}
      <WrapWallet>
        <Button
          isDisabled={!isSwapReady || !isAllInputFilled}
          isLoading={isLoading}
          onClick={handleSwap}
        >
          Swap
        </Button>
      </WrapWallet>
      <Button isLoading={isLoading} onClick={handleAddLiquidity}>
        Add Liquidity
      </Button>
    </Stack>
  );
}

export default DevtoolsSwap;
