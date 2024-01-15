import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LiquidityMachineContext } from "@/machine/liquidtyMachineContext";
import { useContext } from "react";
import { useSelector } from "@xstate/react";

const AllPoolsTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { liquidityActor } = useContext(LiquidityMachineContext);
  const { pairLiquidity, tokensInfo } = useSelector(liquidityActor, state => {
    return {
      tokensInfo: state.context.tokensInfo,
      pairLiquidity: state.context.pairLiquidity,
    };
  });

  return (
    <Box
      flex={3}
      w={"100%"}
      bgColor={"#191B1F"}
      borderRadius={20}
      border={"2px solid #A4A4BE"}
      h={"480px"}
    >
      <Flex px={10} py={4} justifyContent={"space-between"}>
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
      <TableContainer px={10} borderRadius={20}>
        <Table colorScheme="teal" bgColor={"#27262C"} borderRadius={15}>
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
                      <Image
                        src={
                          tokensInfo[pair.assets[0]?.cw20]?.logo?.url ??
                          "/lunc.png"
                        }
                        w={4}
                        h={4}
                      />

                      <Image
                        src={
                          tokensInfo[pair.assets[1]?.cw20]?.logo?.url ??
                          "/lunc.png"
                        }
                        w={4}
                        h={4}
                        position={"relative"}
                        left={"-5px"}
                      />
                    </Flex>
                    <Text>
                      {tokensInfo[pair?.assets[0]?.cw20 ?? ""]?.project}/
                      {tokensInfo[pair?.assets[1]?.cw20 ?? ""]?.project}
                    </Text>
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
          <Tfoot>
            <Tr>
              <Th colSpan={4}>
                <Flex justifyContent={"center"} gap={3} align={"center"}>
                  <FaArrowLeftLong />
                  <Text>Page 2 of 3</Text>
                  <FaArrowRightLong />
                  <Button
                    onClick={() => {
                      liquidityActor.send({
                        type: "LOAD_PAIR_LIST",
                      });
                    }}
                  >
                    DSASDA
                  </Button>
                </Flex>
              </Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllPoolsTable;
