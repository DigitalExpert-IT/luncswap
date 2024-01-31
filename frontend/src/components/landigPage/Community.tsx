import { Box, Container, Stack, Heading, Text } from "@chakra-ui/react";
import { Trans, useTranslation } from "react-i18next";

export const Community = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Container maxW="container.xl">
        <Stack
          border="1px"
          borderColor="white"
          bg="navy.800"
          textAlign="center"
          rounded="xl"
          w="100%"
          p="1rem"
        >
          <Heading fontWeight="bold">
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
          <Text>{t("landingPage.community.subTitle")}</Text>
        </Stack>
      </Container>
    </Box>
  );
};
