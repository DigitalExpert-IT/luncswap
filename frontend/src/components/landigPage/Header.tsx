import React from "react";
import { Trans } from "react-i18next";
import { Box, Heading, Image, HStack, Text, Button } from "@chakra-ui/react";

interface HeaderProps {
  title: string;
  subTitle: string;
  imageLink: string;
}

export const Header: React.FC<HeaderProps> = props => {
  const { title, subTitle, imageLink } = props;

  return (
    <Box>
      <HStack align="center">
        <Box flex={2}>
          <Heading
            fontSize={{ base: "30px", md: "45px", lg: "85px" }}
            lineHeight="130%"
            fontWeight="extrabold"
            fontFamily="inter, sans-serif"
          >
            <Trans
              i18nKey={title}
              components={{
                strong: (
                  <Text
                    as="span"
                    color="brand.500"
                    fontWeight="bold"
                    fontFamily="inter, sans-serif"
                  />
                ),
              }}
            />
          </Heading>
          <Text
            fontSize={{ base: "12px", md: "15px", lg: "24px" }}
            my="3rem"
            fontWeight="bold"
            fontFamily="inter, sans-serif"
            lineHeight="150%"
          >
            {subTitle}
          </Text>
          <Button colorScheme="brand" size={{ base: "sm", md: "lg" }}>
            Launch App
          </Button>
        </Box>
        <Box flex={1} display="flex" justifyContent="center">
          <Image src={imageLink} alt="rabbit" objectFit="cover" mt="5rem" />
        </Box>
      </HStack>
    </Box>
  );
};
