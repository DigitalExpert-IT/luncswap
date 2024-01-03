/* eslint-disable react-hooks/exhaustive-deps */
import { toHumaneValue } from "@/utils";
import _debounce from "lodash/debounce";
import { useSelector } from "@xstate/react";
import { Dec } from "@terra-money/feather.js";
import { useTranslation } from "react-i18next";
import TokenSelect from "@/components/TokenSelect";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Box, Text, Icon, Stack, Input, Button } from "@chakra-ui/react";
import { SwapMachineContext, TokenMachineContext } from "@/machine";
import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import WrapWallet from "@/components/WrapWallet";

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

  return (
    <Box
      bgColor="navy.800"
      border={"2px solid #A4A4BE"}
      borderRadius="20"
      w="50%"
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
          />
          <Text fontWeight="700" fontSize="xl">
            {t("swap.addLiquidity.title")}
          </Text>
        </Box>
      </Box>
      <Box p="1rem">
        <Box bgColor="navy.600" p="1rem" rounded="xl" mb="10">
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
          >
            <TokenSelect value={inputAddress} onChange={setInputAddress} />
            <Box flex="1">
              <Input
                color="black"
                type="number"
                _focusVisible={{
                  border: "unset",
                }}
                border="unset"
                required
                value={inputAmount}
                onChange={e => {
                  setInputAmount(e.currentTarget.value);
                  computeOutput(e.currentTarget.value);
                }}
              />
            </Box>
          </Stack>

          <Stack
            direction="row"
            bgColor="white"
            p={1}
            rounded="xl"
            width="full"
            align="center"
          >
            <TokenSelect value={outputAddress} onChange={setOutputAddress} />
            <Box flex="1">
              <Input
                color="black"
                type="number"
                _focusVisible={{
                  border: "unset",
                }}
                border="unset"
                required
                value={outputAmount}
                onChange={e => {
                  setOutputAmount(e.currentTarget.value);
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </Box>
      <WrapWallet>
        <Button
          bgColor={"#FCDD6F"}
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
            ? "Create Pair"
            : isNoLiquidity
              ? "Provide Liquidity"
              : "Add Liquidity"}
        </Button>
      </WrapWallet>
    </Box>
  );
};
