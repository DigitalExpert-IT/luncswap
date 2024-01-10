import React, { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "@xstate/react";
import { TokenMachineContext } from "@/machine";
import { Grid, GridItem, Text, Flex } from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";

type SwapType = {
  inputAddress: string;
  outputAddress: string;
  priceImpact: number;
  inputTokenReserve: string;
};

export const SwapCompute: React.FC<SwapType> = props => {
  const { t } = useTranslation();
  const { inputAddress, outputAddress, priceImpact, inputTokenReserve } = props;
  const { tokenActor } = useContext(TokenMachineContext);
  const { tokenList } = useSelector(tokenActor, state => {
    return {
      isLoading: state.hasTag("loading"),
      tokenList: state.context.tokenList,
    };
  });

  const getInputToken = useMemo(() => {
    return tokenList.find(item => item.address === inputAddress);
  }, [inputAddress, tokenList]);

  const getOutputToken = useMemo(() => {
    return tokenList.find(item => item.address === outputAddress);
  }, [outputAddress, tokenList]);

  return (
    <Grid
      color={"black"}
      px={10}
      py={4}
      templateColumns={"repeat(2, 1fr)"}
      fontWeight={"600"}
    >
      <GridInfo
        title={t("swap.details.rate")}
      >{`1 ${getInputToken?.info.name} = 0.010157 ${getOutputToken?.info.name}`}</GridInfo>
      <GridInfo title={t("swap.details.minimumReceived")}>
        {`${inputTokenReserve}  ${getOutputToken?.info.name}`}
      </GridInfo>
      <GridInfo title={t("swap.details.swapFee")}>
        0.0396 {getInputToken?.info.name}
      </GridInfo>
      <GridInfo title={t("swap.details.priceImpact")}>
        <Text color={priceImpact > 0.2 ? "red" : "#039F00"}>
          {priceImpact * 100}%
        </Text>
      </GridInfo>
    </Grid>
  );
};

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
