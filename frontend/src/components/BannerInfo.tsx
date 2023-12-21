import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaArrowRightLong } from "react-icons/fa6";

const BannerInfo = () => {
  const { t } = useTranslation();
  return (
    <Box position={"relative"} display={{ base: "none", md: "block" }}>
      <Image
        src="fire-bg-2.png"
        position={"absolute"}
        top={"-120px"}
        left={"-50px"}
      />
      <Box bgColor={"#C05842"} borderRadius={30} position={"relative"}>
        <Image
          src="circles.png"
          position={"absolute"}
          bottom={"-20px"}
          left={"calc(50% - 200px)"}
          w={"80px"}
        />

        <Flex>
          <Box m={7} position={"relative"} flex={1}>
            <Text
              fontWeight={"700"}
              fontSize={"20px"}
              color={"#FCDD6F"}
              stroke={"black"}
              position={"relative"}
              textShadow={
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000"
              }
            >
              {t("swap.info.description")}
            </Text>
            <Button bgColor={"#191B1F"} mt={5}>
              <Flex align={"center"} gap={3}>
                <Text>{t("swap.info.trySwap")}</Text>
                <Icon as={FaArrowRightLong} />
              </Flex>
            </Button>
          </Box>
          <Box flex={"0 1 380px"} position={"relative"}>
            <Image
              src="./coins.png"
              position={"absolute"}
              w={"90px"}
              top={"-28px"}
              left={"-50px"}
            />
            <Image src="./fire-bg.png" h={"200px"} position={"absolute"} />
            <Image
              src="./bull.png"
              h={"200px"}
              left={20}
              zIndex={10}
              position={"relative"}
            />
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default BannerInfo;
