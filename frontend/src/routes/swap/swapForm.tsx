import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  Input,
  Text,
} from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { ChakraStylesConfig, Select } from "chakra-react-select";
import React from "react";
import { useTranslation } from "react-i18next";

interface IOptionSelect {
  children: React.ReactNode;
  imageUrl: string;
}

const GridInfo = ({
  title,
  children,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <>
      <GridItem>
        <Flex align={"center"} gap={2}>
          <Text>{title}</Text>
          <IoMdInformationCircleOutline />
        </Flex>
      </GridItem>
      <GridItem textAlign={"right"}>{children}</GridItem>
    </>
  );
};

const OptionSelect = ({ children, imageUrl }: IOptionSelect) => (
  <Flex align={"center"} gap={3}>
    <Image src={imageUrl} w={5} h={5} />
    <Box fontWeight={"700"} color={"#FCDD6F"}>
      {children}
    </Box>
  </Flex>
);

const options = [
  {
    value: "bnb",
    label: <OptionSelect imageUrl={"bnb.png"}>BNB</OptionSelect>,
  },
  {
    value: "lunc",
    label: <OptionSelect imageUrl={"lunc.png"}>LUNC</OptionSelect>,
  },
];

const optionStyles: ChakraStylesConfig = {
  menu: provided => ({
    ...provided,
    color: "#FCDD6F",
    fontWeight: "700",
  }),
  option: provided => ({
    ...provided,
    bg: "black",
    _hover: {
      bg: "purple",
    },
  }),
  menuList: provided => ({
    ...provided,
    background: "black",
  }),
  input: provided => ({
    ...provided,
    h: "40px",
  }),
  downChevron: provided => ({
    ...provided,
    color: "white",
    bg: "black",
  }),
  container: provided => ({
    ...provided,
    bgColor: "black",
    borderRadius: "20px",
  }),
  dropdownIndicator: provided => ({
    ...provided,
    position: "relative",
    left: "-1px",
    bgColor: "black",
  }),
  control: provided => ({
    ...provided,
    borderRadius: "15px",
  }),
};

const SwapForm = () => {
  const { t } = useTranslation();
  return (
    <Box bgColor={"#FCDD6F"} borderRadius={20}>
      <Box
        bgColor={"#191B1F"}
        border={"2px solid #A4A4BE"}
        borderRadius={20}
        flex={"0 1 400px"}
      >
        <Text fontWeight={"700"} fontSize={"2xl"} px={10} py={4}>
          {t("swap.title")}
        </Text>
        <Box backgroundColor={"#FCDD6F"}>
          <Flex py={2} px={10} gap={3} justifyContent={"space-between"}>
            <Text color={"black"} fontWeight={600}>
              {t("swap.description")}
            </Text>
            <Flex align={"center"} gap={1}>
              <Image src="/fire.png" w={4} h={4} />
              <Image src="/setting.png" w={4} h={4} />
              <Image src="/square-line.png" w={4} h={4} />
              <Image src="/dollar-bag.png" w={4} h={4} />
            </Flex>
          </Flex>
        </Box>
        <Box px={10} mt={5}>
          <Box>
            <Text fontWeight={"600"}>{t("swap.from")}</Text>
            <Flex bgColor={"white"} p={"2px"} borderRadius={15} mt={1}>
              <Box width={"100%"} flex={"0 1 170px"}>
                <Select
                  onChange={() => {}}
                  defaultValue={options[0]}
                  options={options}
                  chakraStyles={optionStyles}
                />
              </Box>
              <Input
                type="number"
                color={"black"}
                flex={2}
                height={"inherit"}
                border={"unset"}
                _focusVisible={{
                  border: "unset",
                }}
              />
            </Flex>
          </Box>
          <Flex mt={4} justifyContent={"center"}>
            <Image src="/swap.png" w={4} h={4} />
          </Flex>
          <Box>
            <Text fontWeight={"600"}>{t("swap.to")}</Text>
            <Flex bgColor={"white"} p={"3px"} borderRadius={15} mt={1}>
              <Box width={"100%"} flex={"0 1 170px"}>
                <Select
                  defaultValue={options[1]}
                  onChange={() => {}}
                  options={options}
                  chakraStyles={optionStyles}
                />
              </Box>
              <Input
                type="number"
                color={"black"}
                flex={2}
                height={"inherit"}
                border={"unset"}
                _focusVisible={{
                  border: "unset",
                }}
              />
            </Flex>
          </Box>
          <Flex mt={10} justifyContent={"space-between"} mb={2}>
            <Flex align={"center"} gap={3}>
              <Text> {t("swap.slippage")}</Text>
              <Image src="/pencil.png" w={4} h={4} />
            </Flex>
            <Text>0.5%</Text>
          </Flex>
          <Button
            bgColor={"#FCDD6F"}
            w={"100%"}
            mb={10}
            borderRadius={12}
            color={"black"}
            fontWeight={"700"}
          >
            {t("swap.buttonSwap")}
          </Button>
        </Box>
      </Box>
      <Grid
        color={"black"}
        px={10}
        py={4}
        templateColumns={"repeat(2, 1fr)"}
        fontWeight={"600"}
      >
        <GridInfo title={t("swap.details.rate")}>
          1 BNB = 0.010157 LUNC
        </GridInfo>
        <GridInfo title={t("swap.details.minimumReceived")}>2155 LUNC</GridInfo>
        <GridInfo title={t("swap.details.swapFee")}>0.0396 BNB</GridInfo>
        <GridInfo title={t("swap.details.route")}>2 Separate Routes</GridInfo>
        <GridInfo title={t("swap.details.priceImpact")}>
          <Text color={"#039F00"}>0.007%</Text>
        </GridInfo>
      </Grid>
    </Box>
  );
};

export default SwapForm;
