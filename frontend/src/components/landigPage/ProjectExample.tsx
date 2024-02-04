import { Box, Image, Stack, Text } from "@chakra-ui/react";
import { Trans } from "react-i18next";

export const ProjectExample = () => {
  return (
    <Box position="relative" mb="10rem">
      <Stack align="center" p="5rem">
        <Box w="40%" position="relative">
          {/* left tooltip */}
          <Stack position="absolute" left="-20%" top="5%" maxW="30%">
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

          {/* right tooltip */}
          <Stack position="absolute" right="-30%" top="40%" maxW="30%">
            <Box w="125px" textAlign="left" display="flex">
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
            <Box
              backdropFilter="auto"
              backdropBlur="10px"
              rounded="xl"
              bg="rgba(115, 112, 125, 0.50)"
              p="1rem"
              textAlign="center"
            >
              <Text color="brand.500" fontWeight="bold" fontSize="2xl">
                Easy to Use
              </Text>
              <Text>
                Our swap is easy to use even you are new in crypto world
              </Text>
            </Box>
          </Stack>

          {/* bottom tooltip */}
          <Stack
            position="absolute"
            left="-10%"
            bottom="-13%"
            maxW="70%"
            direction="row"
            align="center"
          >
            <Box
              backdropFilter="auto"
              backdropBlur="10px"
              rounded="xl"
              bg="rgba(115, 112, 125, 0.50)"
              p="1rem"
              textAlign="center"
            >
              <Text color="brand.500" fontWeight="bold" fontSize="2xl">
                Maintained
              </Text>
              <Text>
                Our Developer Keep update with new tech to keep swap reliable
              </Text>
            </Box>
            <Box w="500px" display="flex">
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
          <Image
            src="https://ik.imagekit.io/msxxxaegj/Luncswap/swap.png?updatedAt=1706092359001"
            objectFit="cover"
          />
        </Box>
      </Stack>
    </Box>
  );
};
