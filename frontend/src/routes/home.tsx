import { useTranslation } from "react-i18next";
import { Container, Box } from "@chakra-ui/react";
import { BeltCard, Header } from "@/components/landigPage";
import { COMMUNIT_USER } from "@/constant/dummyCommunity";

function Home() {
  const { t } = useTranslation();

  return (
    <Box>
      <Container maxW="container.xl" mb="1rem">
        <Header
          title={t("landingPage.header.title")}
          subTitle={t("landingPage.header.subTitle")}
          imageLink="/rabbit.png"
        />
      </Container>
      <BeltCard data={COMMUNIT_USER} />
    </Box>
  );
}

export default Home;
