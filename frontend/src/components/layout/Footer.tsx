import { Text, Box, Stack, Container } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Stack
      display="flex"
      bg="gray.800"
      w="100%"
      height="10vh"
      zIndex={2}
      justify="center"
    >
      <Container maxW="container.xl">
        <Box display="flex" justifyContent="space-between">
          <Text size="xl">All rights reserved.</Text>
          <Text>LUNCSWAP</Text>
        </Box>
      </Container>
    </Stack>
  );
};
