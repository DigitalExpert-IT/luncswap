/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useMemo, useState } from "react";
import WrapWallet from "@/components/WrapWallet";
import {
  useColorModeValue,
  Box,
  Heading,
  Stack,
  Button,
  FormControl,
  Input,
} from "@chakra-ui/react";
import TokenSelect from "@/components/TokenSelect";
import { SwapMachineContext, TokenMachineContext } from "@/machine";
import { useSelector } from "@xstate/react";
import { Dec } from "@terra-money/feather.js";

const AddLiquidity = () => {
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const { tokenActor } = useContext(TokenMachineContext);
  const { swapActor } = useContext(SwapMachineContext);
  const bg = useColorModeValue("gray.50", "gray.900");
  const tokenList = useSelector(tokenActor, state => state.context.tokenList);
  const { isLoading, isReady, isNoLiquidity, isNoPair } = useSelector(
    swapActor,
    state => {
      return {
        isReady:
          state.matches("ready") ||
          state.matches("no_liquidity") ||
          state.matches("no_pair"),
        isLoading: state.hasTag("loading"),
        isNoLiquidity: state.matches("no_liquidity"),
        isNoPair: state.matches("no_pair"),
      };
    },
  );

  useEffect(() => {
    if (inputAddress === outputAddress) {
      setOutputAddress("");
    }
  }, [inputAddress]);

  useEffect(() => {
    if (outputAddress === inputAddress) {
      setInputAddress("");
    }
  }, [outputAddress]);

  const inputTokenMeta = useMemo(() => {
    return tokenList.find(item => item.address === inputAddress);
  }, [inputAddress, tokenList]);

  const outputTokenMeta = useMemo(() => {
    return tokenList.find(item => item.address === outputAddress);
  }, [outputAddress, tokenList]);

  useEffect(() => {
    if (!inputTokenMeta || !outputTokenMeta) return;

    // prevent using native token as token2
    if (outputTokenMeta.isNative) {
      const temp = inputAddress;
      setInputAddress(outputAddress);
      setOutputAddress(temp);
      return;
    }
    swapActor.send({
      type: "LOAD_PAIR",
      value: [inputTokenMeta, outputTokenMeta],
    });
  }, [inputTokenMeta, outputTokenMeta]);

  const isAllValueFilled = !!inputAmount && !!outputAmount;
  const onSubmit = async () => {
    if (isNoPair) {
      swapActor.send({
        type: "CREATE_PAIR",
        value: {
          token1Amount: new Dec(inputAmount).mul(
            Math.pow(10, inputTokenMeta!.info.decimals),
          ),
          token2Amount: new Dec(outputAmount).mul(
            Math.pow(10, outputTokenMeta!.info.decimals),
          ),
          token1Meta: inputTokenMeta!,
          token2Meta: outputTokenMeta!,
        },
      });
    }
    setInputAmount("0");
    setOutputAmount("0");
  };

  return (
    <Box my="2rem">
      <Heading>Add Liquidity</Heading>
      <Box shadow="lg" bg={bg} my={6} borderRadius="md" p={4}>
        <Stack mb="4">
          <FormControl>
            <Stack direction="row">
              <Box flex="1">
                <Input
                  type="number"
                  required
                  value={inputAmount}
                  onChange={e => {
                    setInputAmount(e.currentTarget.value);
                  }}
                />
              </Box>
              <TokenSelect value={inputAddress} onChange={setInputAddress} />
            </Stack>
          </FormControl>
          <FormControl>
            <Stack direction="row">
              <Box flex="1">
                <Input
                  type="number"
                  required
                  value={outputAmount}
                  onChange={e => {
                    setOutputAmount(e.currentTarget.value);
                  }}
                />
              </Box>
              <TokenSelect value={outputAddress} onChange={setOutputAddress} />
            </Stack>
          </FormControl>
        </Stack>
        <WrapWallet>
          <Button
            isDisabled={
              !isReady || !inputAddress || !outputAddress || !isAllValueFilled
            }
            isLoading={isLoading}
            colorScheme="orange"
            onClick={onSubmit}
          >
            {isNoPair
              ? "Create Pair"
              : isNoLiquidity
                ? "Provide Liquidity"
                : "Add Liquidity"}
          </Button>
        </WrapWallet>
      </Box>
    </Box>
  );
};

export default AddLiquidity;
