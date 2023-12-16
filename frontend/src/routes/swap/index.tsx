import { Container, Flex, Heading, VStack } from "@chakra-ui/react";
import SwapForm from "./swapForm";
import AllPoolsTable from "./allPoolsTable";
import { useState } from "react";
import { SIDE_SWAP_CONTENTS } from "@/constant/dataEnums";
import Graph from "./graph";

const Swap = () => {
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
        <Heading fontWeight={"700"} fontSize={"3xl"}>
          MAKE A SWAP WITH US.
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
