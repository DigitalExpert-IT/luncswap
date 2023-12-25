import { Box, Button, Container, Flex, Stack } from "@chakra-ui/react";
import { Outlet, Link } from "react-router-dom";

function DevtoolsRoot() {
  return (
    <Container maxW="container.xl">
      <Flex direction="row">
        <Box flex="1" minH="80vh">
          <Outlet />
        </Box>
        <Box pl="12">
          <Stack align="end">
            {menuEntry.map(entry => (
              <Button key={entry.path} as={Link} variant="link" to={entry.path}>
                {entry.title}
              </Button>
            ))}
          </Stack>
        </Box>
      </Flex>
    </Container>
  );
}

const menuEntry = [
  { title: "CW20 Factory", path: "/devtools" },
  { title: "Swap", path: "/devtools/swap" },
];

export default DevtoolsRoot;
