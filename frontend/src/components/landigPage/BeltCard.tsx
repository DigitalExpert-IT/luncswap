import React from "react";
import { Box, Container, Text, Stack } from "@chakra-ui/react";

interface community {
  title: string;
  value: string;
}

interface BeltCardProps {
  data: community[];
}

export const BeltCard: React.FC<BeltCardProps> = props => {
  const { data } = props;

  return (
    <Box
      bg="brand.400"
      p="2rem"
      display="flex"
      mt={{ base: "2rem", md: "10rem" }}
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
        >
          {data.map((item, idx) => (
            <Box
              bg="navy.800"
              w={{ base: "full", md: "30%" }}
              p="2rem"
              rounded="xl"
              key={idx}
              textAlign="center"
            >
              <Box>
                <Text color="brand.400" fontWeight="bold" fontSize="4xl">
                  {item.value}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="xl">
                  {item.title}
                </Text>
              </Box>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};
