import React from "react";
import { Box, Container, Stack, Heading, Text, Image } from "@chakra-ui/react";
import { Trans, useTranslation } from "react-i18next";

interface dataCommunity {
  title: string;
  image: string;
  link: string;
}

interface CommunityProps {
  data: dataCommunity[];
}

export const Community: React.FC<CommunityProps> = props => {
  const { t } = useTranslation();

  return (
    <Box position="relative">
      <Container maxW="container.xl">
        <Stack
          border="1px"
          borderColor="white"
          bg="navy.800"
          textAlign="center"
          rounded="xl"
          align="center"
          w="100%"
          p="2rem"
        >
          <Box w="70%">
            <Heading fontWeight="bold" size="2xl">
              <Trans
                i18nKey="landingPage.community.title"
                components={{
                  strong: (
                    <Text
                      as="span"
                      color="brand.400"
                      fontWeight="extrabold"
                      fontFamily="inter, sans-serif"
                    />
                  ),
                }}
              />
            </Heading>
            <Text color="gray.500">{t("landingPage.community.subTitle")}</Text>
          </Box>
          <Stack
            w="100%"
            justify="center"
            align="center"
            direction="row"
            spacing="2rem"
            my="4rem"
          >
            {props.data.map((item, idx) => (
              <Box
                bg="brand.400"
                w="30%"
                display="flex"
                alignItems="center"
                flexDir="column"
                rounded="xl"
                key={idx}
              >
                <Box my="2rem">
                  <Image src={item.image} alt={item.title} w={40} h={40} />
                </Box>
                <Box
                  w="100%"
                  roundedBottom="xl"
                  bg="rgba(115, 112, 125, 0.5)"
                  p="1rem"
                >
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    {item.title}
                  </Text>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
