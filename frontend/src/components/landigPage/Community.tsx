import React from "react";
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Image,
  Link,
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
    <Box mt={{ base: "none", md: "7rem" }}>
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
          position="relative"
        >
          <Box
            position="absolute"
            left="-15%"
            top={{ base: "1%" }}
            w={{ base: 40, md: "full" }}
          >
            <Image src="/moon.png" objectFit="cover" />
          </Box>
          <Icon
            as={FaDiscord}
            pos="absolute"
            w={{ base: 10, md: 20 }}
            h={{ base: 10, md: 20 }}
            color="brand.300"
            transform="rotate(-20deg)"
            top={{ base: "-2%", md: "-8%" }}
            left="5%"
            right="0"
          />

          <Icon
            as={FaTelegramPlane}
            pos="absolute"
            w={{ base: 10, md: 20 }}
            h={{ base: 10, md: 20 }}
            color="purple.500"
            transform="rotate(10deg)"
            top={{ base: "-2%", md: "-8%" }}
            left={{ base: "20%", md: "12%" }}
            right="0"
          />
          <Icon
            as={BiSolidLike}
            pos="absolute"
            w={{ base: 10, md: 20 }}
            h={{ base: 10, md: 20 }}
            color="brand.400"
            top="10%"
            right={{ base: "-1%", md: "-1%" }}
          />
          <Icon
            as={FaUserCheck}
            pos="absolute"
            w={{ base: 10, md: 20 }}
            h={{ base: 10, md: 20 }}
            color="purple.500"
            transform="rotate(20deg)"
            top={{ base: "15%", md: "25%" }}
            right={{ base: "-1%", md: "-1%", lg: "-1%" }}
          />
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
                <Link
                  href={item.link}
                  w="100%"
                  _hover={{ textDecoration: "none", color: "navy.500" }}
                >
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
                </Link>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
