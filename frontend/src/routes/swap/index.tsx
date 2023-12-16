import { Container, Flex, Heading, VStack } from "@chakra-ui/react";
import SwapForm from "./swapForm";
import AllPoolsTable from "./allPoolsTable";

const Swap = () => {
  return (
    <Container maxW={"container.xl"}>
      <VStack gap={10}>
        <Heading fontWeight={"700"} fontSize={"3xl"}>
          MAKE A SWAP WITH US.
        </Heading>
        <Flex w={"100%"} gap={3} flexDir={{ base: "column", lg: "row" }}>
          <SwapForm />
          <AllPoolsTable />
        </Flex>
      </VStack>
    </Container>
  );
};

export default Swap;
