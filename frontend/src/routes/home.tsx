import "@fontsource/galindo";
import { useState } from "react";
import Graph from "@/routes/swap/graph";
import SwapForm from "@/routes/swap/swapForm";
import AllPoolsTable from "@/routes/swap/allPoolsTable";
import { SIDE_SWAP_CONTENTS } from "@/constant/dataEnums";
import { ModalComingSoon } from "@/components/ModalComingSoon";
import { Flex } from "@chakra-ui/react";
import ContainerMain from "@/components/ContainerMain";

function Home() {
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
    <ContainerMain>
      <ModalComingSoon />
      <Flex
        w={"100%"}
        gap={3}
        flexDir={{ base: "column", lg: "row" }}
        justifyContent={"center"}
      >
        <SwapForm setSideContent={setSideContent} sideContent={sideContent} />
        <SideMenuContent />
      </Flex>
    </ContainerMain>

  );
}

export default Home;
