/* eslint-disable react-hooks/exhaustive-deps */
import { toHumaneValue } from "@/utils";
import _debounce from "lodash/debounce";
import { useSelector } from "@xstate/react";
import { Dec } from "@terra-money/feather.js";
import { useTranslation } from "react-i18next";
import TokenSelect from "@/components/TokenSelect";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  Box,
  Text,
  Icon,
  Stack,
  Input,
  Button,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { SwapMachineContext, TokenMachineContext } from "@/machine";
import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import WrapWallet from "@/components/WrapWallet";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useNavigate } from "react-router-dom";

export const AddLiquidity = () => {
  const { t } = useTranslation();
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const { tokenActor } = useContext(TokenMachineContext);
  const { swapActor } = useContext(SwapMachineContext);
  const tokenList = useSelector(tokenActor, state => state.context.tokenList);

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

  const navigate = useNavigate();

  return (
    <Box
      bgColor="navy.700"
      border={"2px solid #A4A4BE"}
      borderRadius="20"
      w="50%"
      position={"relative"}
    >
      <Box display="flex" alignItems="center" p="1rem">
        <Box display="flex" alignContent="center" alignItems="center">
          <Icon
            as={IoMdArrowRoundBack}
            color="yellow"
            aria-label="back"
            cursor="pointer"
            mr={5}
            w={6}
            h={6}
            _hover={{
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />
          <Text fontWeight="700" fontSize="xl">
            {t("swap.addLiquidity.title")}
          </Text>
        </Box>
      </Box>
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
            mb={10}
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
      <Button
        onClick={() => {
          swapActor.send({
            type: "LOAD_PAIR_LIST",
          });
        }}
      >
        dLULULUD
      </Button>
    </Box>
  );
};
