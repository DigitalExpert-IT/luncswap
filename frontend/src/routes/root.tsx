import { LayoutMain } from "@/components/layout/LayoutMain";
import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

function Root() {
  return (
    <LayoutMain>
      <Container maxW="container.xl" mt="2rem">
        <Outlet />
      </Container>
    </LayoutMain>
  );
}

export default Root;
