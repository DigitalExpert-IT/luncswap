import { useTranslation } from "react-i18next";
import { Container, Box } from "@chakra-ui/react";
import {
  BeltCard,
  CommingProject,
  Community,
  Header,
  ProjectExample,
} from "@/components/landigPage";
import { COMMUNITY_USER, COMMUNITY_SOSMED } from "@/constant/dummyCommunity";

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
      <BeltCard data={COMMUNITY_USER} />
      <ProjectExample />
      <Community data={COMMUNITY_SOSMED} />
      <CommingProject />
    </Box>
  );
}

export default Home;
