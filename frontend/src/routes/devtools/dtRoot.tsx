import { Box, Container, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

function DevtoolsRoot() {
  return (
    <Container maxW="container.xl">
      <Flex direction="row">
        <Box flex="1">
          <Outlet />
        </Box>
        <Box minW="350px">sidebar</Box>
      </Flex>
    </Container>
  );
}

export default DevtoolsRoot;
