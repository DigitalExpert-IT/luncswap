import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import "@fontsource/galindo";
import { useTranslation } from "react-i18next";
import BannerInfo from "@/components/BannerInfo";
import { AddLiquidity } from "./addLiquidity";

const Swap = () => {
  const { t } = useTranslation();

  return (
    <Container maxW={"container.xl"} pb="10rem">
      <VStack gap={10}>
        <BannerInfo />
        <Heading
          as={"h2"}
          fontWeight={"700"}
          fontSize={"3xl"}
          fontFamily={"Galindo, sans-serif"}
          gap={3}
          display={{ base: "none", md: "flex" }}
        >
          <Text>{t("swap.makeA")}</Text>
          <Text color={"brand.400"}>{t("swap.swap")}</Text>
          <Text>{t("swap.withUs")}</Text>
        </Heading>

        <Flex
          w={"100%"}
          gap={3}
          flexDir={{ base: "column", lg: "row" }}
          justifyContent={"center"}
        >
          <AddLiquidity />
        </Flex>
      </VStack>
    </Container>
  );
};

export default Swap;
