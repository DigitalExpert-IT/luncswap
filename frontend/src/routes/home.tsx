import "@fontsource/galindo";
import { useTranslation } from "react-i18next";
import { Container, Heading, Text, VStack } from "@chakra-ui/react";

function Home() {
  const { t } = useTranslation();

  return (
    <Container maxW={"container.xl"} pb="10rem">
      <VStack gap={10} h="100vh">
        <Heading
          as={"h2"}
          fontWeight={"700"}
          fontSize={"3xl"}
          fontFamily={"Galindo, sans-serif"}
          gap={3}
          display={{ base: "none", md: "flex" }}
        >
          <Text>{t("swap.makeA")}</Text>
          <Text color={"#FCDD6F"}>{t("swap.swap")}</Text>
          <Text>{t("swap.withUs")}</Text>
        </Heading>
      </VStack>
    </Container>
  );
}

export default Home;
