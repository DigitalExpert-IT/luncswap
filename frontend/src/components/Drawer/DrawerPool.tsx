import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerHeader,
  DrawerBody,
  Heading,
  // useDisclosure,
  Box,
  Flex,
  // Text,
  // Button,
  Th,
  TableContainer,
  Td,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Image,
  Tr,
  Spinner,
} from "@chakra-ui/react";
// import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";
import { LiquidityMachineContext } from "@/machine/liquidityMachineContext";
import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "@xstate/react";
import { useInView } from "react-intersection-observer";
import { Denom } from "@/interface";

interface DrawerPoolProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerPool: React.FC<DrawerPoolProps> = props => {
  // const { t } = useTranslation();
  // const navigate = useNavigate();
  const { liquidityActor } = useContext(LiquidityMachineContext);
  const { ref, inView } = useInView();
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

  // const pairName = (pair: Denom) => {
  //   if (pair.native) return "LUNC";
  //   if (!tokensInfo[pair.cw20 as ""]) return <Spinner size="sm" />;
  //   return tokensInfo[pair.cw20 as ""].name;
  // };
  return (
    <Drawer placement="bottom" onClose={props.onClose} isOpen={props.isOpen}>
      <DrawerOverlay />
      <DrawerContent rounded="2xl">
        {/* <DrawerOverlay /> */}
        <DrawerHeader background="brand.400" roundedTop="2xl">
          <Heading color="black" textTransform="uppercase">
            All pools
          </Heading>
        </DrawerHeader>
        <DrawerBody p="0">
          {/* <Box
            flex={3}
            w={"100%"}
            bgColor={"#191B1F"}
            borderRadius={20}
            border={"2px solid #A4A4BE"}
            h={"480px"}
          > */}
          {/* <Flex px={10} py={4} justifyContent={"space-between"}>
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
            </Flex> */}
          <TableContainer
            // px={10}
            // borderRadius={20}
            overflowY={"scroll"}
            h={"380px"}
          >
            <Table colorScheme="teal" bgColor={"#27262C"}>
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
                {pairLiquidity.map((pair, idx) => (
                  <Tr key={idx}>
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
                        {/* <Flex gap={1}>
                          <Text>{pairName(pair?.assets[0])}</Text>
                          <Text>/</Text>
                          <Text>{pairName(pair?.assets[1])}</Text>
                        </Flex> */}
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
          {/* </Box> */}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
