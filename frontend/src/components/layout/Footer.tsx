import { Text, Box, Stack, Container, Image, Heading } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Box position="relative">
      {/* <Box position="absolute" top="-300px" right="10px"> */}
      {/*   <Image src="/rabbit-bull.png" /> */}
      {/* </Box> */}
      <Stack
        bg="#010525"
        w="100%"
        h="75px"
        zIndex="999"
        justifyContent="center"
      >
        <Container maxW="container.xl">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="xl">All rights reserved.</Text>
            <Box>
              <Heading size="md" color="white">
                Luncswap
              </Heading>
            </Box>
          </Box>
        </Container>
      </Stack>
    </Box>
  );
};
