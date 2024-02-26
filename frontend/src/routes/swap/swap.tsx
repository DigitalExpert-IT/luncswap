import "@fontsource/galindo";
import { useState } from "react";
import Graph from "@/routes/swap/graph";
import SwapForm from "@/routes/swap/swapForm";
import { useTranslation } from "react-i18next";
import BannerInfo from "@/components/BannerInfo";
import AllPoolsTable from "@/routes/swap/allPoolsTable";
import { SIDE_SWAP_CONTENTS } from "@/constant/dataEnums";
import { DrawerPool } from "@/components/Drawer";
import {
  Flex,
  Heading,
  Text,
  VStack,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";

const Swap = () => {
  const { t } = useTranslation();
  const [isLargerThan800] = useMediaQuery("(min-width: 800px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sideContent, setSideContent] = useState("");

  const SideMenuContent = () => {
    switch (sideContent) {
      case SIDE_SWAP_CONTENTS.ALL_POOLS:
        if (!isLargerThan800) {
          return (
            <DrawerPool isOpen={isOpen} onClose={onClose} title={sideContent}>
              <AllPoolsTable />
            </DrawerPool>
          );
        } else {
          return <AllPoolsTable />;
        }

      case SIDE_SWAP_CONTENTS.GRAPH:
        if (!isLargerThan800) {
          return (
            <DrawerPool isOpen={isOpen} onClose={onClose} title={sideContent}>
              <Graph />
            </DrawerPool>
          );
        } else {
          return <Graph />;
        }
      default:
        return null;
    }
  };

  return (
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
        <SwapForm
          setSideContent={setSideContent}
          sideContent={sideContent}
          onOpen={onOpen}
        />
        <SideMenuContent />
      </Flex>
    </VStack>
  );
};

export default Swap;
