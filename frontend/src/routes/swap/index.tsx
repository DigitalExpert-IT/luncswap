import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import SwapForm from "./swapForm";
import AllPoolsTable from "./allPoolsTable";
import { useState } from "react";
import { SIDE_SWAP_CONTENTS } from "@/constant/dataEnums";
import Graph from "./graph";
import "@fontsource/galindo";
import { useTranslation } from "react-i18next";
import BannerInfo from "@/components/BannerInfo";

const Swap = () => {
  const { t } = useTranslation();
  const [sideContent, setSideContent] = useState("");

  const SideMenuContent = () => {
    switch (sideContent) {
      case SIDE_SWAP_CONTENTS.ALL_POOLS:
        return <AllPoolsTable />;
      case SIDE_SWAP_CONTENTS.GRAPH:
        return <Graph />;
      default:
        return null;
    }
  };

  return (
    <Container maxW={"container.xl"}>
      <VStack gap={10}>
        <BannerInfo />
        <Heading
          as={"h2"}
          fontWeight={"700"}
          fontSize={"3xl"}
          fontFamily={"Galindo, sans-serif"}
          gap={3}
          display={{ base: "none", md: "flex" }}
        >
          <Text>{t("swap.makeA")}</Text>
          <Text color={"#FCDD6F"}>{t("swap.swap")}</Text>
          <Text>{t("swap.withUs")}</Text>
        </Heading>

        <Flex
          w={"100%"}
          gap={3}
          flexDir={{ base: "column", lg: "row" }}
          justifyContent={"center"}
        >
          <SwapForm setSideContent={setSideContent} sideContent={sideContent} />
          <SideMenuContent />
        </Flex>
      </VStack>
    </Container>
  );
};

export default Swap;
