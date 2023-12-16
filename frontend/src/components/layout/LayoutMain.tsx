import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Box, Image } from "@chakra-ui/react";
import { NAVIGATION } from "@/constant/Navigation";

interface LayoutMainProp {
  children: React.ReactNode;
}

export const LayoutMain: React.FC<LayoutMainProp> = props => {
  const { children } = props;
  return (
    <Box>
      <Navbar data={NAVIGATION} />
      <Box position="relative" display="flex" flexDir="column">
        <Box zIndex={2} h="100vh">
          {children}
        </Box>
        <Box zIndex={0} position="fixed" bottom="-200px">
          <Image src="/pattern-bg.png" w="100vw" h="50vh" />
        </Box>
      </Box>
    </Box>
  );
};
