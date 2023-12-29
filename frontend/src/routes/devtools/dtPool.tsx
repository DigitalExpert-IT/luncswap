import { useColorModeValue, Box, Heading } from "@chakra-ui/react";

const Pool = () => {
  const bg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box my="2rem">
      <Heading>Pool</Heading>
      <Box shadow="lg" bg={bg} my={6} borderRadius="md" p={4}>
        Pool
      </Box>
    </Box>
  );
};

export default Pool;
