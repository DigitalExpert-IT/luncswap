import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  Input,
  Text,
  Icon,
} from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { ChakraStylesConfig, Select } from "chakra-react-select";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiFire } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { TbGraphFilled } from "react-icons/tb";
import { FaSackDollar } from "react-icons/fa6";
import { RiHistoryFill } from "react-icons/ri";
import { SIDE_SWAP_CONTENTS } from "@/constant/dataEnums";
import { AiOutlineSwap } from "react-icons/ai";
import { BiSolidPencil } from "react-icons/bi";

export interface IOptionSelect {
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
    <Box fontWeight={"700"} color={"#FCDD6F"} fontSize={12}>
      {children}
    </Box>
  </Flex>
);

const options = [
  {
    value: "bnb",
    label: <OptionSelect imageUrl={"ustc.png"}>USTC</OptionSelect>,
  },
  {
    value: "lunc",
    label: <OptionSelect imageUrl={"lunc.png"}>LUNC</OptionSelect>,
  },
];

const optionStyles: ChakraStylesConfig = {
  menu: provided => ({
    ...provided,
    color: "brand.500",
    fontWeight: "700",
  }),
  option: provided => ({
    ...provided,
    bg: "#172852",
    _hover: {
      bg: "purple",
    },
  }),
  menuList: provided => ({
    ...provided,
    background: "#172852",
  }),
  input: provided => ({
    ...provided,
    h: "40px",
  }),
  downChevron: provided => ({
    ...provided,
    color: "white",
    bg: "#172852",
  }),
  container: provided => ({
    ...provided,
    bgColor: "#172852",
    borderRadius: "20px",
    width: { base: "140px", md: "160px" },
  }),
  dropdownIndicator: provided => ({
    ...provided,
    position: "relative",
    left: "-1px",
    bgColor: "#172852",
    p: 1,
  }),
  control: provided => ({
    ...provided,
    borderRadius: "15px",
  }),
};

const menuContents = [
  {
    content: SIDE_SWAP_CONTENTS.SETTINGS,
    icon: IoMdSettings,
  },
  {
    content: SIDE_SWAP_CONTENTS.MONEY,
    icon: FaSackDollar,
  },
  {
    content: SIDE_SWAP_CONTENTS.GRAPH,
    icon: TbGraphFilled,
  },
  {
    content: SIDE_SWAP_CONTENTS.ALL_POOLS,
    icon: HiFire,
  },
  {
    content: SIDE_SWAP_CONTENTS.HISTORY,
    icon: RiHistoryFill,
  },
];

const SwapForm = ({
  setSideContent,
  sideContent,
}: {
  setSideContent: Dispatch<SetStateAction<string>>;
  sideContent: string;
}) => {
  const { t } = useTranslation();

  const onClickMenu = (contentName: string) => () => {
    setSideContent(contentName === sideContent ? "" : contentName);
  };

  const onSwap = () => {
    setDetailsSwap(detail => ({ show: !detail.show }));
  };

  const [detailsSwap, setDetailsSwap] = useState({
    show: false,
  });

  return (
    <Box bgColor={"#FCDD6F"} borderRadius={20}>
      <Box
        bgColor={"#081431"}
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
              {menuContents.map((content, id) => (
                <Icon
                  key={id}
                  as={content.icon}
                  color={sideContent === content.content ? "#D9A900" : "black"}
                  cursor={"pointer"}
                  fontSize={24}
                  onClick={onClickMenu(content.content)}
                />
              ))}
            </Flex>
          </Flex>
        </Box>
        <Box px={10} mt={5}>
          <Box>
            <Text fontWeight={"600"}>{t("swap.from")}</Text>
            <Flex bgColor={"white"} p={"2px"} borderRadius={15} mt={1}>
              <Box width={"100%"} flex={"1"}>
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
                borderRadius={"20px"}
                border={"unset"}
                _focusVisible={{
                  border: "unset",
                }}
              />
            </Flex>
          </Box>
          <Flex mt={4} justifyContent={"center"}>
            <Icon
              as={AiOutlineSwap}
              fontSize={30}
              transform={"rotate(90deg)"}
              mt={2}
            />
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
                borderRadius={"20px"}
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
              <Icon as={BiSolidPencil} color={"#FCDD6F"} />
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
            onClick={() => onSwap()}
          >
            {t("swap.buttonSwap")}
          </Button>
        </Box>
      </Box>
      {detailsSwap.show ? (
        <Grid
          color={"black"}
          px={10}
          py={4}
          templateColumns={"repeat(2, 1fr)"}
          fontWeight={"600"}
        >
          <GridInfo title={t("swap.details.rate")}>
            1 USTC = 0.010157 LUNC
          </GridInfo>
          <GridInfo title={t("swap.details.minimumReceived")}>
            2155 LUNC
          </GridInfo>
          <GridInfo title={t("swap.details.swapFee")}>0.0396 USTC</GridInfo>
          <GridInfo title={t("swap.details.route")}>2 Separate Routes</GridInfo>
          <GridInfo title={t("swap.details.priceImpact")}>
            <Text color={"#039F00"}>0.007%</Text>
          </GridInfo>
        </Grid>
      ) : null}
    </Box>
  );
};

export default SwapForm;
