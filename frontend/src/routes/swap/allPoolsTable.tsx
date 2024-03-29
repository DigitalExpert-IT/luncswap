import { Box, Button, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  useMediaQuery,
  IconButton,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LiquidityMachineContext } from "@/machine/liquidityMachineContext";
import { useContext, useEffect, useRef } from "react";
import { useSelector } from "@xstate/react";
import { useInView } from "react-intersection-observer";
import { Denom } from "@/interface";
import { HiOutlinePlus } from "react-icons/hi2";

const AllPoolsTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { liquidityActor } = useContext(LiquidityMachineContext);
  const { ref, inView } = useInView();
  const [isLargerThan800] = useMediaQuery("(min-width: 800px)");
  const { pairLiquidity, tokensInfo, isAllPairsFetched, isLoading } =
    useSelector(liquidityActor, state => {
      return {
        tokensInfo: state.context.tokensInfo,
        pairLiquidity: state.context.pairLiquidity,
        isAllPairsFetched: state.context.isAllPairsFetched,
        isLoading: state.hasTag("loading"),
      };
    });

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      liquidityActor.send({
        type: "LOAD_PAIR_LIST",
      });
      isMounted.current = true;
    } else if (!isLoading && inView && !isAllPairsFetched) {
      liquidityActor.send({
        type: "REFETCH_PAIR_LIST",
      });
    }
  }, [inView, isLoading, liquidityActor, isAllPairsFetched]);

  const pairIcon = (pair: Denom) => {
    if (tokensInfo[pair?.cw20 as ""])
      return tokensInfo[pair?.cw20 as ""]?.logo?.url;
    return "/lunc.png";
  };

  const pairName = (pair: Denom) => {
    if (pair.native) return "LUNC";
    if (!tokensInfo[pair.cw20 as ""]) return <Spinner size="sm" />;
    return tokensInfo[pair.cw20 as ""].name;
  };

  return (
    <Box
      flex={3}
      w={"100%"}
      bgColor={"#191B1F"}
      borderRadius={20}
      border={isLargerThan800 ? "2px solid #A4A4BE" : "none"}
      h={isLargerThan800 ? "480px" : "full"}
      pos="relative"
    >
      <IconButton
        display={isLargerThan800 ? "none" : "flex"}
        pos="absolute"
        bgColor="brand.300"
        bottom={5}
        right={10}
        rounded="full"
        icon={<HiOutlinePlus />}
        aria-label="navigation liquidity"
        onClick={() => navigate("/addLiquidity")}
      />
      <Flex
        px={10}
        py={4}
        justifyContent={"space-between"}
        display={isLargerThan800 ? "flex" : "none"}
      >
        <Text fontWeight={"700"} fontSize={"2xl"}>
          {t("swap.poolsTable.title")}
        </Text>
        <Button
          bgColor={"brand.400"}
          borderRadius={10}
          color={"black"}
          fontWeight={"700"}
          onClick={() => navigate("/addLiquidity")}
        >
          <Flex align={"center"} gap={3}>
            <Text fontSize={20}>
              <FiPlus />
            </Text>
            <Text>{t("swap.poolsTable.addLiquidity")}</Text>
          </Flex>
        </Button>
      </Flex>
      <TableContainer
        px={isLargerThan800 ? 10 : 0}
        borderRadius={isLargerThan800 ? 20 : 0}
        overflowY={"scroll"}
        h={"380px"}
      >
        <Table
          colorScheme="teal"
          bgColor={"#27262C"}
          borderRadius={isLargerThan800 ? 15 : 0}
        >
          <Thead>
            <Tr
              color={"brand.400"}
              borderBottomWidth={5}
              borderColor={"#191B1F"}
            >
              <Th color={"brand.400"} borderColor={"#191B1F"}>
                POOL
              </Th>
              <Th color={"brand.400"} borderColor={"#191B1F"}>
                TVL
              </Th>
              <Th color={"brand.400"} borderColor={"#191B1F"}>
                VOLUME 24H
              </Th>
              <Th color={"brand.400"} borderColor={"#191B1F"}>
                VOLUME 7D
              </Th>
            </Tr>
          </Thead>
          <Tbody overflow={"scroll"}>
            {pairLiquidity.map(pair => (
              <Tr>
                <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                  <Flex align={"center"}>
                    <Flex position={"relative"}>
                      <Image src={pairIcon(pair.assets[0])} w={4} h={4} />

                      <Image
                        src={pairIcon(pair.assets[1])}
                        w={4}
                        h={4}
                        position={"relative"}
                        left={"-5px"}
                      />
                    </Flex>
                    <Flex gap={1} display={{ base: "none", md: "flex" }}>
                      <Text>{pairName(pair?.assets[0])}</Text>
                      <Text>/</Text>
                      <Text>{pairName(pair?.assets[1])}</Text>
                    </Flex>
                  </Flex>
                </Td>
                <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                  $0
                </Td>
                <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                  $0
                </Td>
                <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                  $0
                </Td>
              </Tr>
            ))}
          </Tbody>
          <Box ref={ref} />
          <Tfoot>
            <Tr>
              <Th colSpan={4}>
                {isLoading && (
                  <Flex justifyContent={"center"} w={"full"}>
                    <Spinner />
                  </Flex>
                )}
              </Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllPoolsTable;
