import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Input,
  Text,
  Icon,
} from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from "react";
import { TokenMachineContext, SwapMachineContext } from "@/machine";
import { useTranslation } from "react-i18next";
import { HiFire } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { TbGraphFilled } from "react-icons/tb";
import { FaSackDollar } from "react-icons/fa6";
import { RiHistoryFill } from "react-icons/ri";
import { SIDE_SWAP_CONTENTS } from "@/constant/dataEnums";
import { HiArrowsUpDown } from "react-icons/hi2";
import { BiSolidPencil } from "react-icons/bi";
import TokenSelect from "@/components/TokenSelect";
import _debounce from "lodash/debounce";
import { useSelector } from "@xstate/react";
import { Dec } from "@terra-money/feather.js";

export interface IOptionSelect {
  children: React.ReactNode;
  imageUrl: string;
}

const GridInfo = ({
  title,
  children,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <>
      <GridItem>
        <Flex align={"center"} gap={2}>
          <Text>{title}</Text>
          <IoMdInformationCircleOutline />
        </Flex>
      </GridItem>
      <GridItem textAlign={"right"}>{children}</GridItem>
    </>
  );
};

const menuContents = [
  {
    content: SIDE_SWAP_CONTENTS.SETTINGS,
    icon: IoMdSettings,
  },
  {
    content: SIDE_SWAP_CONTENTS.MONEY,
    icon: FaSackDollar,
  },
  {
    content: SIDE_SWAP_CONTENTS.GRAPH,
    icon: TbGraphFilled,
  },
  {
    content: SIDE_SWAP_CONTENTS.ALL_POOLS,
    icon: HiFire,
  },
  {
    content: SIDE_SWAP_CONTENTS.HISTORY,
    icon: RiHistoryFill,
  },
];

const SwapForm = ({
  setSideContent,
  sideContent,
}: {
  setSideContent: Dispatch<SetStateAction<string>>;
  sideContent: string;
}) => {
  const { t } = useTranslation();
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const { swapActor } = useContext(SwapMachineContext);
  const { tokenActor } = useContext(TokenMachineContext);
  const { tokenList } = useSelector(tokenActor, state => {
    return {
      tokenList: state.context.tokenList,
    };
  });
  const { outputTokenDecimals, computedOutputAmount } = useSelector(
    swapActor,
    state => {
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
            ? new Dec(0)
            : inputAddress === state.context.token1Meta?.address
              ? state.context.token1Amount
              : state.context.token2Amount,
        computedOutputAmount:
          outputAddress === ""
            ? new Dec(0)
            : outputAddress === state.context.token1Meta?.address
              ? state.context.token1Amount
              : state.context.token2Amount,
      };
    },
  );

  const outputTokenMeta = useMemo(() => {
    if (!outputAddress) return undefined;
    return tokenList.find(item => item.address === outputAddress);
  }, [outputAddress, tokenList]);

  const computeInput = useCallback(
    _debounce((val: string) => {
      if (!outputTokenMeta) return;
      if (val === "") return;
      const actualValue = new Dec(val).mul(Math.pow(10, outputTokenDecimals));
      if (actualValue === computedOutputAmount) return;

      swapActor.send({
        type: "CALCULATE_INPUT",
        value: { tokenMeta: outputTokenMeta, amount: actualValue },
      });
    }, 500),
    [outputTokenDecimals, outputTokenMeta],
  );

  const handleReverse = () => {
    const temp = inputAddress;
    setOutputAddress(temp);
    requestAnimationFrame(() => {
      setInputAmount("0");
      setOutputAmount("0");
      computeInput("0");
    });
  };

  console.log("input amount", inputAmount);
  console.log("output amount", outputAmount);

  useEffect(() => {
    if (inputAddress === outputAddress) setOutputAddress("");
  }, [inputAddress]);

  useEffect(() => {
    if (outputAddress === inputAddress) setInputAddress("");
  }, [outputAddress]);

  const onClickMenu = (contentName: string) => () => {
    setSideContent(contentName === sideContent ? "" : contentName);
  };

  const onSwap = () => {
    setDetailsSwap(detail => ({ show: !detail.show }));
  };

  const [detailsSwap, setDetailsSwap] = useState({
    show: false,
  });

  return (
    <Box bgColor={"#FCDD6F"} borderRadius={20}>
      <Box
        bgColor={"#081431"}
        border={"2px solid #A4A4BE"}
        borderRadius={20}
        flex={"0 1 400px"}
      >
        <Text fontWeight={"700"} fontSize={"2xl"} px={10} py={4}>
          {t("swap.title")}
        </Text>
        <Box backgroundColor={"#FCDD6F"}>
          <Flex py={2} px={10} gap={3} justifyContent={"space-between"}>
            <Text color={"black"} fontWeight={600}>
              {t("swap.description")}
            </Text>
            <Flex align={"center"} gap={1}>
              {menuContents.map((content, id) => (
                <Icon
                  key={id}
                  as={content.icon}
                  color={sideContent === content.content ? "#D9A900" : "black"}
                  cursor={"pointer"}
                  fontSize={24}
                  onClick={onClickMenu(content.content)}
                />
              ))}
            </Flex>
          </Flex>
        </Box>
        <Box px={10} mt={5}>
          <Box>
            <Text fontWeight={"600"}>{t("swap.from")}</Text>
            <Flex bgColor={"white"} p={"2px"} borderRadius={15} mt={1}>
              <Box width={"100%"} flex={"1"}>
                <TokenSelect value={inputAddress} onChange={setInputAddress} />
              </Box>
              <Input
                type="number"
                color={"black"}
                flex={2}
                height={"inherit"}
                borderRadius={"20px"}
                border={"unset"}
                _focusVisible={{
                  border: "unset",
                }}
              />
            </Flex>
          </Box>
          <Flex mt={4} justifyContent={"center"}>
            <Icon
              as={HiArrowsUpDown}
              fontSize={30}
              mt={2}
              onClick={handleReverse}
              pointer="cursor"
            />
          </Flex>
          <Box>
            <Text fontWeight={"600"}>{t("swap.to")}</Text>
            <Flex bgColor={"white"} p={"3px"} borderRadius={15} mt={1}>
              <Box width={"100%"} flex={"0 1 170px"}>
                <TokenSelect
                  value={outputAddress}
                  onChange={setOutputAddress}
                />
              </Box>
              <Input
                type="number"
                color={"black"}
                flex={2}
                height={"inherit"}
                borderRadius={"20px"}
                border={"unset"}
                _focusVisible={{
                  border: "unset",
                }}
              />
            </Flex>
          </Box>
          <Flex mt={10} justifyContent={"space-between"} mb={2}>
            <Flex align={"center"} gap={3}>
              <Text> {t("swap.slippage")}</Text>
              <Icon as={BiSolidPencil} color={"#FCDD6F"} />
            </Flex>
            <Text>0.5%</Text>
          </Flex>
          <Button
            bgColor={"#FCDD6F"}
            w={"100%"}
            mb={10}
            borderRadius={12}
            color={"black"}
            fontWeight={"700"}
            onClick={() => onSwap()}
          >
            {t("swap.buttonSwap")}
          </Button>
        </Box>
      </Box>
      {detailsSwap.show ? (
        <Grid
          color={"black"}
          px={10}
          py={4}
          templateColumns={"repeat(2, 1fr)"}
          fontWeight={"600"}
        >
          <GridInfo title={t("swap.details.rate")}>
            1 USTC = 0.010157 LUNC
          </GridInfo>
          <GridInfo title={t("swap.details.minimumReceived")}>
            2155 LUNC
          </GridInfo>
          <GridInfo title={t("swap.details.swapFee")}>0.0396 USTC</GridInfo>
          <GridInfo title={t("swap.details.route")}>2 Separate Routes</GridInfo>
          <GridInfo title={t("swap.details.priceImpact")}>
            <Text color={"#039F00"}>0.007%</Text>
          </GridInfo>
        </Grid>
      ) : null}
    </Box>
  );
};

export default SwapForm;
