/* eslint-disable react-hooks/exhaustive-deps */
import { toHumaneValue } from "@/utils";
import _debounce from "lodash/debounce";
import { useSelector } from "@xstate/react";
import { Dec } from "@terra-money/feather.js";
import { useTranslation } from "react-i18next";
import TokenSelect from "@/components/TokenSelect";
import {
  Box,
  Text,
  Stack,
  Input,
  Button,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { LiquidityMachineContext, SwapMachineContext, TokenMachineContext } from "@/machine";
import { useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import WrapWallet from "@/components/WrapWallet";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface AddLiquidity {
  token1?: string,
  token2?: string
}

export const AddLiquidity = (props: AddLiquidity | undefined) => {
  const { t } = useTranslation();
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const { tokenActor } = useContext(TokenMachineContext);
  const { swapActor } = useContext(SwapMachineContext);
  const tokenList = useSelector(tokenActor, state => state.context.tokenList);

  const { liquidityActor } = useContext(LiquidityMachineContext)

  const liquidityState = useSelector(liquidityActor, state => state)

  console.log({ tokenList })
  console.log({ props })

  const isMounted = useRef(false)

  const {
    isLoading,
    isReady,
    isNoLiquidity,
    isNoPair,
    inputTokenReserve,
    outputTokenReserve,
  } = useSelector(swapActor, state => {
    return {
      isReady:
        state.matches("ready") ||
        state.matches("no_liquidity") ||
        state.matches("no_pair"),
      isLoading: state.hasTag("loading"),
      isNoLiquidity: state.matches("no_liquidity"),
      isNoPair: state.matches("no_pair"),
      inputTokenReserve: state.context.pairInfo?.token1_reserve ?? "0",
      outputTokenReserve: state.context.pairInfo?.token2_reserve ?? "0",
    };
  });

  const findToken = (tokenAddr: string) => tokenActor.send({
    type: "SEARCH_TOKEN",
    value: { address: tokenAddr },
  });

  useEffect(() => {
    setTimeout(() => {
      if (!isMounted.current && !isLoading && props?.token1 && props?.token2 && tokenList.length > 0) {
        debugger
        if (!tokenList.find((token) => token.address === props?.token1)) return findToken(props?.token1)
        if (!tokenList.find((token) => token.address === props?.token2)) return findToken(props?.token2)
        setInputAddress(props?.token1);
        setOutputAddress(props?.token2);
        isMounted.current = true
      }
    }, 100)

  }, [isLoading, props?.token1, props?.token2, tokenList.length])

  const { tokenBalance: inputTokenBalance, isLoading: inputIsLoading } =
    useTokenBalance(inputAddress);

  const { tokenBalance: outputTokenBalance, isLoading: outputIsLoading } =
    useTokenBalance(outputAddress);

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

  const computeOutput = useCallback(
    _debounce((inputTokenAmount: string) => {
      if (!inputTokenMeta || !outputTokenMeta) return;
      if (isNoLiquidity || isNoPair) return;
      if (!inputTokenAmount) return;
      const inputAmount = new Dec(inputTokenAmount).mul(
        Math.pow(10, inputTokenMeta.info.decimals),
      );
      const output = inputAmount
        .mul(new Dec(outputTokenReserve))
        .div(new Dec(inputTokenReserve))
        .add(1);

      setOutputAmount(toHumaneValue(output, outputTokenMeta.info.decimals));
    }, 500),
    [
      inputTokenMeta,
      outputTokenMeta,
      inputTokenReserve,
      outputTokenReserve,
      isNoLiquidity,
      isNoPair,
    ],
  );

  useEffect(() => {
    if (!inputTokenMeta || !outputTokenMeta) return;
    // prevent using native token as token2
    if (outputTokenMeta.isNative && !inputTokenMeta.isNative) {
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
    } else {
      swapActor.send({
        type: "ADD_LIQUIDITY",
        value: {
          token1Amount: new Dec(inputAmount).mul(
            Math.pow(10, inputTokenMeta?.info.decimals ?? 0),
          ),
          maxToken2Amount: new Dec(outputAmount).mul(
            Math.pow(10, outputTokenMeta?.info.decimals ?? 0),
          ),
        },
      });
    }
  };

  const onMaxInputClicked = () => {
    setInputAmount(inputTokenBalance);
  };

  const onMaxOutputClicked = () => {
    setOutputAmount(outputTokenBalance);
  };

  return (
    <Box
      position={"relative"}
    >
      <Box p="1rem">
        <Box bgColor="navy.500" p="1rem" rounded="xl" mb="10">
          <Text color="brand.400">{t("swap.addLiquidity.tip")}</Text>
        </Box>
        <Text textTransform="uppercase" fontWeight="bold">
          {t("swap.addLiquidity.DepositAmount")}
        </Text>
        <Stack mt="1rem">
          <Stack
            direction="row"
            bgColor="white"
            p={1}
            rounded="xl"
            width="full"
            align="center"
            h={16}
          >
            <TokenSelect value={inputAddress} onChange={setInputAddress} />
            <Box flex="1">
              <Input
                color="navy.700"
                fontWeight={"700"}
                type="number"
                _focusVisible={{
                  border: "unset",
                }}
                border="unset"
                px={0}
                fontSize={18}
                h={"20px"}
                required
                value={inputAmount}
                onChange={e => {
                  setInputAmount(e.currentTarget.value);
                  computeOutput(e.currentTarget.value);
                }}
              />
              <Flex gap={1} align={"center"}>
                <Text color={"gray"} fontSize={10}>
                  Balance :
                </Text>
                {inputIsLoading ? (
                  <Spinner color="gray" w={2} h={2} />
                ) : (
                  <Text color={"gray"} fontSize={10}>
                    {inputTokenBalance}
                  </Text>
                )}
              </Flex>
            </Box>
            <Button
              bg={"brand.400"}
              color={"navy.700"}
              _hover={{
                bg: "brand.500",
              }}
              p={1}
              mr={3}
              h={7}
              fontSize={12}
              fontWeight={700}
              onClick={onMaxInputClicked}
            >
              Max
            </Button>
          </Stack>

          <Stack
            direction="row"
            bgColor="white"
            p={1}
            rounded="xl"
            width="full"
            align="center"
            h={16}
          >
            <TokenSelect value={outputAddress} onChange={setOutputAddress} />
            <Box flex="1">
              <Input
                color="navy.700"
                fontWeight={"700"}
                type="number"
                _focusVisible={{
                  border: "unset",
                }}
                border="unset"
                px={0}
                fontSize={18}
                h={"20px"}
                required
                value={outputAmount}
                onChange={e => {
                  setOutputAmount(e.currentTarget.value);
                }}
              />
              <Flex gap={1} align={"center"}>
                <Text color={"gray"} fontSize={10}>
                  Balance :
                </Text>
                {outputIsLoading ? (
                  <Spinner color="gray" w={2} h={2} />
                ) : (
                  <Text color={"gray"} fontSize={10}>
                    {outputTokenBalance}
                  </Text>
                )}
              </Flex>
            </Box>
            <Button
              bg={"brand.400"}
              color={"navy.700"}
              _hover={{
                bg: "brand.500",
              }}
              p={1}
              mr={3}
              h={7}
              fontSize={12}
              onClick={onMaxOutputClicked}
              fontWeight={700}
            >
              Max
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Box px={5}>
        <WrapWallet>
          <Button
            bgColor={"brand.400"}
            w={"100%"}
            my={2}
            borderRadius={12}
            color={"black"}
            fontWeight={"700"}
            isDisabled={
              !isReady || !inputAddress || !outputAddress || !isAllValueFilled
            }
            isLoading={isLoading}
            onClick={() => onSubmit()}
          >
            {isNoPair
              ? "CREATE PAIR"
              : isNoLiquidity
                ? "PROVIDE LIQUIDITY"
                : "ADD LIQUIDITY"}
          </Button>
        </WrapWallet>
      </Box>
    </Box>
  );
};
