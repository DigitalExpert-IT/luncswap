import { useState, useRef, useEffect } from "react";
import useScreen from "@/hooks/useScreen";
import { useTranslation, Trans } from "react-i18next";
import { useScroll, useTransform } from "framer-motion";
import { Box, Image, Stack, Text, Heading } from "@chakra-ui/react";
import MotionBox from "./MotionBox";

export const ProjectExample = () => {
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [refHeight, setRefHeight] = useState<number>(0);
  const [refOffsetTop, setRefOffsetTop] = useState<number>(0);
  const { scrollY } = useScroll();

  const textOpa = useTransform(
    scrollY,
    [refOffsetTop / 2 + 100, refOffsetTop + 100],
    [1, 0],
  );

  useEffect(() => {
    const getRefHeight = () => {
      if (scrollRef.current) {
        setRefHeight(scrollRef.current?.clientHeight);
        setRefOffsetTop(scrollRef.current?.offsetTop);
      }
    };

    const getScroll = () => {
      console.log("scrolled: ", window.scrollY);
    };

    getRefHeight();

    window.addEventListener("resize", getRefHeight);
    window.addEventListener("scroll", getScroll);

    return () => {
      window.removeEventListener("resize", getRefHeight);
      window.removeEventListener("scroll", getScroll);
    };
  }, []);

  return (
    <Box position="relative" ref={scrollRef} my="2rem">
      <Stack
        align="center"
        p={{ base: "1rem", md: "2rem", lg: "2rem", xl: "5rem" }}
      >
        <Box w={isMobile ? "full" : "40%"} position="relative">
          {/* left tooltip */}
          <Stack
            position="absolute"
            left={{ base: "none", md: "-40%", lg: "-40%", xl: "-30%" }}
            top="5%"
            maxW={{ base: "none", md: "50%", xl: "40%" }}
            display={{ base: "none", md: "block", lg: "block", xl: "block" }}
          >
            <Box
              backdropFilter="auto"
              backdropBlur="10px"
              rounded="xl"
              bg="rgba(115, 112, 125, 0.50)"
              p="1rem"
              textAlign="center"
            >
              <Text
                color="brand.500"
                fontWeight="bold"
                fontSize={{ base: "none", md: "md", lg: "md", xl: "2xl" }}
              >
                {t("landingPage.project.community")}
              </Text>
              <Text fontSize="xs">{t("landingPage.project.subCommunity")}</Text>
            </Box>
            <Box w="125px" textAlign="right">
              <Text fontSize={{ base: "none", md: "sm" }}>
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
          <MotionBox
            style={{
              opacity: textOpa,
            }}
            display={isMobile ? "flex" : "none"}
            flexDir={"column"}
            justifyContent={"center"}
            position={"absolute"}
            backdropFilter="auto"
            backdropBlur="10px"
            rounded="xl"
            bg="rgba(50, 50, 50, 0.5)"
            top={0}
            p="2rem"
            textAlign="center"
            w="100%"
            height={"100%"}
            opacity={"inherit"}
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
          </MotionBox>
          <Box>
            <Image
              src="https://ik.imagekit.io/msxxxaegj/Luncswap/swap.png?updatedAt=1706092359001"
              objectFit="cover"
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
