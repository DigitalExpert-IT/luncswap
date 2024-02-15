import React from "react";
import { Heading, Box, Wrap, WrapItem, Link, Image } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface PartnershipData {
  title: string;
  image: string;
  link: string;
}

interface PartnershipProps {
  data: PartnershipData[];
}

export const Partnership: React.FC<PartnershipProps> = props => {
  const { data } = props;
  const { t } = useTranslation();

  return (
    <Box
      display="flex"
      flexDir="column"
      alignContent="center"
      alignItems="center"
      my="5rem"
    >
      <Box>
        <Heading
          textTransform="capitalize"
          size="2xl"
          fontFamily="Inter, sans-serif"
          fontWeight="extrabold"
        >
          {t("landingPage.partnership.title")}
        </Heading>
      </Box>
      <Wrap mt="3rem" spacing="2rem" justify="center">
        {data.map((item, idx) => (
          <WrapItem key={idx}>
            <Link href={item.link}>
              <Box>
                <Image src={item.image} alt={item.title} objectFit="cover" />
              </Box>
            </Link>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  );
};
