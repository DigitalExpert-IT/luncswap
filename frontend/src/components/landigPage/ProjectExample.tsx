import { useState, useRef, useEffect } from "react";
import useScreen from "@/hooks/useScreen";
import { Trans, useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { Box, Image, Stack, Text, Heading } from "@chakra-ui/react";

export const ProjectExample = () => {
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [refHeight, setRefHeight] = useState<number>(0);
  const [refOffsetTop, setRefOffsetTop] = useState<number>(0);
  const { scrollY } = useScroll();

  const textMove = useTransform(
    scrollY,
    [refOffsetTop - 600, refOffsetTop + 200],
    [isMobile ? refHeight / 6 : 0, refHeight / 6],
  );

  const textOpa = useTransform(
    scrollY,
    [
      refOffsetTop - 600,
      refOffsetTop + 200,
      refOffsetTop + 800,
      refOffsetTop + 900,
    ],
    [isMobile ? 1 : 0, 1, 1, isMobile ? 1 : 0],
  );

  const textEvent = useTransform(
    scrollY,
    [
      refOffsetTop - 600,
      refOffsetTop + 200,
      refOffsetTop + 600,
      refOffsetTop + 800,
    ],
    ["none", "visible", "visible", "none"],
  );

  const swapOpacity = useTransform(
    scrollY,
    [
      refOffsetTop + refHeight / 4 - 800,
      refOffsetTop + refHeight / 4 - 500,
      refOffsetTop + refHeight / 4 + 300,
    ],
    [1, 0, 1],
  );
  const swapEvent = useTransform(
    scrollY,
    [
      refOffsetTop + refHeight / 4 - 800,
      refOffsetTop + refHeight / 4 + 200,
      refOffsetTop + refHeight,
    ],
    ["visible", "none", "visible"],
  );

  useEffect(() => {
    const getRefHeight = () => {
      if (scrollRef.current) {
        setRefHeight(scrollRef.current?.clientHeight);
        setRefOffsetTop(scrollRef.current?.offsetTop);
      }
    };

    getRefHeight();

    window.addEventListener("resize", getRefHeight);

    return () => window.removeEventListener("resize", getRefHeight);
  }, []);

  return (
    <Box position="relative" ref={scrollRef}>
      <Stack
        align="center"
        p={{ base: "1rem", md: "2rem", lg: "2rem", xl: "5rem" }}
      >
        <Box w={isMobile ? "full" : "40%"} position="relative">
          <Box
            display={{ base: "block", md: "none" }}
            position="absolute"
            backdropFilter="auto"
            backdropBlur="10px"
            rounded="xl"
            bg="rgba(115, 112, 125, 0.1)"
            p="2rem"
            textAlign="center"
            w="100%"
            h="100%"
          >
            <motion.div
              style={{
                y: textMove,
                opacity: textOpa,
                pointerEvents: textEvent,
              }}
            >
              <Heading color="brand.500">
                {t("landingPage.project.community")}
              </Heading>
              <Text>{t("landingPage.project.subCommunity")}</Text>
              <Heading color="brand.500">
                {t("landingPage.project.easyToUse")}
              </Heading>
              <Text>{t("landingPage.project.subEasy")}</Text>
              <Heading color="brand.500">
                {t("landingPage.project.maintained")}
              </Heading>
              <Text>{t("landingPage.project.subMaintained")}</Text>
            </motion.div>
          </Box>
          {/* left tooltip */}
          {/* <Stack
            position="absolute"
            left="-20%"
            top="5%"
            maxW="30%"
            display={{ base: "none", md: "none", lg: "none", xl: "block" }}
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
          </Stack> */}

          {/* right tooltip */}
          {/* <Stack
            position="absolute"
            right="-30%"
            top="40%"
            maxW="30%"
            display={{ base: "none", md: "none", lg: "none", xl: "block" }}
          >
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
          </Stack> */}

          {/* bottom tooltip */}
          {/* <Stack
            position="absolute"
            left="-10%"
            bottom="-13%"
            maxW="70%"
            direction="row"
            align="center"
            display={{ base: "none", md: "none", lg: "none", xl: "flex" }}
          >
            <Box
              backdropFilter="auto"
              backdropBlur="10px"
              rounded="xl"
              bg="rgba(115, 112, 125, 0.50)"
              p="1rem"
              textAlign="center"
              flex={1}
            >
              <Text color="brand.500" fontWeight="bold" fontSize="2xl">
                Maintained
              </Text>
              <Text>
                Our Developer Keep update with new tech to keep swap reliable
              </Text>
            </Box>
            <Box w="500px" flex={1}>
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
          </Stack> */}
          <Box>
            <motion.div
              style={{ opacity: swapOpacity, pointerEvents: swapEvent }}
            >
              <Image
                src="https://ik.imagekit.io/msxxxaegj/Luncswap/swap.png?updatedAt=1706092359001"
                objectFit="cover"
              />
            </motion.div>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
