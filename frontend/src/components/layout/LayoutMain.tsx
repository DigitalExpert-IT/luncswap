import React from "react";
import { Navbar } from "./Navbar";
import { Box, Image } from "@chakra-ui/react";
import { Footer } from "./Footer";
// import { PatternBg } from "../../assets";

interface LayoutMainProp {
  children: React.ReactNode;
}

export const LayoutMain: React.FC<LayoutMainProp> = props => {
  const { children } = props;
  return (
    <Box>
      <Navbar />
      <Box position="relative" display="flex" flexDir="column">
        <Box zIndex={2} h="100vh">
          {children}
        </Box>
        <Box zIndex={0} position="absolute" bottom="0">
          <Image src="./pattern-bg.png" bottom="0" top="0px" w="100vw" />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};
