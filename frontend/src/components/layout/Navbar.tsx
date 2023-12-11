import { Box, Text, Container, Stack } from "@chakra-ui/react";

export const Navbar = () => {
  return (
    <Stack bg="gray.800" w="100%" h="8vh" justifyContent="center">
      <Container maxW="container.xl">
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Text>LOGO</Text>
          </Box>
          <Box>
            <Text>Menu</Text>
          </Box>
        </Box>
      </Container>
    </Stack>
  );
};
