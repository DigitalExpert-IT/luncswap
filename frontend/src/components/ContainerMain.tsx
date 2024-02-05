import { Container, Heading, VStack, Text } from "@chakra-ui/react"
import BannerInfo from "./BannerInfo"
import { useTranslation } from "react-i18next";
import React from 'react';

const ContainerMain = (props: { children: React.ReactNode }) => {
    const { t } = useTranslation();

    return (
        <Container maxW={"container.xl"} pb="10rem" minH={'90vh'}>
            <VStack gap={10}>
                <BannerInfo />
                <Heading
                    as={"h2"}
                    fontWeight={"700"}
                    fontSize={"3xl"}
                    fontFamily={"Galindo, sans-serif"}
                    gap={3}
                    display={{ base: "none", md: "flex" }}
                >
                    <Text>{t("swap.makeA")}</Text>
                    <Text color={"brand.400"}>{t("swap.swap")}</Text>
                    <Text>{t("swap.withUs")}</Text>
                </Heading>
                {props.children}
            </VStack>
        </Container>
    )
}

export default ContainerMain