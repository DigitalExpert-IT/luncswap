/* eslint-disable react-hooks/exhaustive-deps */
import TokenSelect from "@/components/TokenSelect";
import { SwapMachineContext, TokenMachineContext } from "@/machine";
import _debounce from "lodash/debounce";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

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
    inputTokenDecimals,
    outputTokenDecimals,
    computedInputAmount,
    computedOutputAmount,
  } = useSelector(swapActor, state => {
    return {
      isLoading: state.hasTag("loading"),
      isSwapReady: state.matches("ready"),
      priceImpact: state.context.priceImpact,
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
      if (val === "" || val === "0") return;
      const actualValue = BigInt(+val * Math.pow(10, inputTokenDecimals));
      if (actualValue === computedInputAmount) return;

      swapActor.send({
        type: "CALCULATE_OUTPUT",
        value: { tokenMeta: inputTokenMeta, amount: actualValue },
      });
    }, 500),
    [inputTokenMeta, inputTokenDecimals],
  );

  const computeInput = useCallback(
    _debounce((val: string) => {
      if (!outputTokenMeta) return;
      if (val === "" || val === "0") return;
      const actualValue = BigInt(+val * Math.pow(10, outputTokenDecimals));
      if (actualValue === computedOutputAmount) return;

      swapActor.send({
        type: "CALCULATE_INPUT",
        value: { tokenMeta: outputTokenMeta, amount: actualValue },
      });
    }, 500),
    [outputTokenDecimals, outputTokenMeta],
  );

  useEffect(() => {
    const inputHumaneValue = String(
      +computedInputAmount.toString() / Math.pow(10, inputTokenDecimals),
    );
    const outputHumaneValue = String(
      +computedOutputAmount.toString() / Math.pow(10, outputTokenDecimals),
    );

    setInputAmount(inputHumaneValue);
    setOutputAmount(outputHumaneValue);
  }, [computedInputAmount, computedOutputAmount]);

  const isAllInputFilled = !!inputTokenMeta && !!outputTokenMeta;

  const switchPair = () => {
    if (!inputTokenMeta) return;
    if (!outputTokenMeta) return;
    swapActor.send({
      type: "LOAD_PAIR",
      value: [inputTokenMeta, outputTokenMeta],
    });
  };

  useEffect(() => {
    if (inputAddress === outputAddress) return;
    if (inputAddress && outputAddress) switchPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAddress, outputAddress]);

  return (
    <Stack bg="gray.800" p="4">
      <FormControl>
        <FormLabel>Input</FormLabel>
        <InputGroup>
          <Box>
            <TokenSelect value={inputAddress} onChange={setInputAddress} />
          </Box>
          <Input
            type="number"
            value={inputAmount}
            onChange={e => {
              computeOutput(e.currentTarget.value);
              setInputAmount(e.currentTarget.value);
            }}
          />
        </InputGroup>
      </FormControl>
      <FormControl>
        <FormLabel>Output</FormLabel>
        <InputGroup>
          <Box>
            <TokenSelect value={outputAddress} onChange={setOutputAddress} />
          </Box>
          <Input
            type="number"
            value={outputAmount}
            onChange={e => {
              computeInput(e.currentTarget.value);
              setOutputAmount(e.currentTarget.value);
            }}
          />
        </InputGroup>
      </FormControl>
      {isSwapReady && isAllInputFilled ? (
        <Box>
          <Text>Price Impact {(priceImpact * 100).toFixed(2)}%</Text>
        </Box>
      ) : null}
      <Button
        isDisabled={!isSwapReady || !isAllInputFilled}
        isLoading={isLoading}
        // onClick={}
      >
        Swap
      </Button>
    </Stack>
  );
}

export default DevtoolsSwap;
