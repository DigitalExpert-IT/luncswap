import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Box, Image } from "@chakra-ui/react";
import { NAVIGATION } from "@/constant/Navigation";
import { Footer } from "./Footer";

interface LayoutMainProp {
  children: React.ReactNode;
}

export const LayoutMain: React.FC<LayoutMainProp> = props => {
  const { children } = props;
  return (
    <Box>
      <Navbar data={NAVIGATION} />
      <Box position="relative" display="flex" flexDir="column">
        <Box zIndex={2}>{children}</Box>
        <Box position="absolute" bottom="30vh" left="150px" zIndex={1}>
          <Image src="/rabbit-moon.png" />
        </Box>
        <Box zIndex={0} position="absolute" bottom="0">
          <Image src="/pattern-bg.png" w="100vw" h="50vh" />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};
