import { Box, Text, Icon, Badge, Image, Flex, Stack } from "@chakra-ui/react";
import { ChakraStylesConfig, Select } from "chakra-react-select";
import { useTranslation } from "react-i18next";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaGear } from "react-icons/fa6";
import { IOptionSelect } from "./swapForm";

const OptionSelect = ({ children, imageUrl }: IOptionSelect) => (
  <Flex align={"center"} gap={3}>
    <Image src={imageUrl} w={5} h={5} color="black" />
    <Box fontWeight={"700"} color="black" fontSize={12}>
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
    color: "black",
    fontWeight: "700",
  }),
  option: provided => ({
    ...provided,
    bg: "brand.300",
    _hover: {
      bg: "brand.800",
    },
  }),
  menuList: provided => ({
    ...provided,
    background: "brand.300",
  }),
  input: provided => ({
    ...provided,
    h: "40px",
  }),
  downChevron: provided => ({
    ...provided,
    color: "black",
    bg: "brand.500",
  }),
  container: provided => ({
    ...provided,
    bgColor: "brand.500",
    borderRadius: "20px",
    width: { base: "140px", md: "160px" },
  }),
  dropdownIndicator: provided => ({
    ...provided,
    position: "relative",
    left: "-1px",
    bgColor: "brand.500",
    p: 1,
  }),
  control: provided => ({
    ...provided,
    borderRadius: "15px",
  }),
};

export const AddLiquidity = () => {
  const { t } = useTranslation();
  return (
    <Box bgColor="#191B1F" border={"2px solid #A4A4BE"} borderRadius="20">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p="1rem"
        borderBottom="2px solid"
        borderColor="gray.800"
      >
        <Box display="flex" alignContent="center" alignItems="center">
          <Icon
            as={IoMdArrowRoundBack}
            color="yellow"
            aria-label="back"
            mr={5}
            w={6}
            h={6}
          />
          <Text fontWeight="700" fontSize="xl">
            {t("swap.addLiquidity.title")}
          </Text>
        </Box>
        <Box display="flex" alignItems="center">
          <Badge colorScheme="brand" mr={2}>
            0.5% Slippage
          </Badge>
          <Icon as={FaGear} w={6} h={6} color="brand.500" />
        </Box>
      </Box>
      <Box p="1rem">
        <Text textTransform="uppercase">{t("swap.addLiquidity.choose")}</Text>
        <Stack direction="row" mt="2rem">
          <Select
            defaultValue={options[1]}
            onChange={() => {}}
            options={options}
            chakraStyles={optionStyles}
          />
          <Select
            defaultValue={options[1]}
            onChange={() => {}}
            options={options}
            chakraStyles={optionStyles}
          />
        </Stack>
      </Box>
    </Box>
  );
};
