import { ModalComingSoon } from "@/components/ModalComingSoon";
import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

const SwapRoot = () => {
  return (
    <Container maxW={"container.xl"} pb="10rem" mt={10}>
      <ModalComingSoon />
      <Outlet />
    </Container>
  );
};

export default SwapRoot;
