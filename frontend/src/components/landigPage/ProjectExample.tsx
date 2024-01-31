import { Box, Image, Stack, Text } from "@chakra-ui/react";
import { Trans } from "react-i18next";

export const ProjectExample = () => {
  return (
    <Box position="relative">
      <Stack position="absolute" left="400px" top="120px" maxW="12%">
        <Box
          backdropFilter="auto"
          backdropBlur="10px"
          rounded="xl"
          bg="rgba(115, 112, 125, 0.50)"
          p="1rem"
          textAlign="center"
        >
          <Text color="brand.500" fontWeight="bold" fontSize="2xl">
            Community
          </Text>
          <Text>Our community will make your crypto ideas grow</Text>
        </Box>
        <Box w="125px" textAlign="right">
          <Text fontSize="xl">
            <Trans
              i18nKey="landingPage.project.things"
              components={{
                strong: (
                  <Text
                    as="span"
                    color="brand.500"
                    fontWeight="bold"
                    fontFamily="inter, sans-serif"
                  />
                ),
              }}
            />
          </Text>
        </Box>
      </Stack>
      <Stack align="center" p="5rem">
        <Box w="40%">
          <Image
            src="https://ik.imagekit.io/msxxxaegj/Luncswap/swap.png?updatedAt=1706092359001"
            objectFit="cover"
          />
        </Box>
      </Stack>
    </Box>
  );
};
