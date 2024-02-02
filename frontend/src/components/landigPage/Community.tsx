import React from "react";
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Image,
  Icon,
} from "@chakra-ui/react";
import { Trans, useTranslation } from "react-i18next";
import { FaDiscord, FaTelegramPlane, FaUserCheck } from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";

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
      <Box position="absolute">
        <Image src="/moon.png" objectFit="cover" />
        <Icon
          as={FaDiscord}
          pos="absolute"
          w={20}
          h={20}
          color="brand.300"
          transform="rotate(-20deg)"
          top="-10%"
          left="70%"
          right="0"
        />
        <Icon
          as={FaTelegramPlane}
          pos="absolute"
          w={20}
          h={20}
          color="purple.500"
          transform="rotate(10deg)"
          top="-10%"
          left="95%"
          right="0"
        />
        <Icon
          as={BiSolidLike}
          pos="absolute"
          w="49px"
          h="49px"
          color="brand.400"
          top="10%"
          right="-67vw"
        />
        <Icon
          as={FaUserCheck}
          pos="absolute"
          w={20}
          h={20}
          color="purple.500"
          transform="rotate(20deg)"
          top="30%"
          right="-69vw"
        />
      </Box>
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
          <Box w={{ base: "full", md: "70%" }}>
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
            direction={{ base: "column", md: "row" }}
            spacing="2rem"
            my="4rem"
          >
            {props.data.map((item, idx) => (
              <Box
                bg="brand.400"
                w={{ base: "100%", md: "30%" }}
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
