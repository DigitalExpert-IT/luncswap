import { Grid, GridItem, Text, Flex } from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useTranslation } from "react-i18next";

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

export const SwapCompute = () => {
  const { t } = useTranslation();
  return (
    <Grid
      color={"black"}
      px={10}
      py={4}
      templateColumns={"repeat(2, 1fr)"}
      fontWeight={"600"}
    >
      <GridInfo title={t("swap.details.rate")}>1 USTC = 0.010157 LUNC</GridInfo>
      <GridInfo title={t("swap.details.minimumReceived")}>2155 LUNC</GridInfo>
      <GridInfo title={t("swap.details.swapFee")}>0.0396 USTC</GridInfo>
      <GridInfo title={t("swap.details.route")}>2 Separate Routes</GridInfo>
      <GridInfo title={t("swap.details.priceImpact")}>
        <Text color={"#039F00"}>100%</Text>
      </GridInfo>
    </Grid>
  );
};
