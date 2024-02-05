import { Box, Button, Flex, Image, Spinner, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import "@fontsource/galindo";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import { useSelector } from "@xstate/react";
import { useContext, useEffect, useRef } from "react";
import { LiquidityMachineContext } from "@/machine";
import { useInView } from "react-intersection-observer";
import { pairIcon, pairName } from "@/lib/pair";
import { isNull } from "lodash";
import { useModal } from "@ebay/nice-modal-react";
import ModalAddLiquidity from "../addLiquidity/ModalAddLiquidity";
import ModalRemoveLiquidity from "./ModalRemoveLiquidity";
import ContainerMain from "@/components/ContainerMain";

const MyLiquidity = () => {
    const { t } = useTranslation();

    const { liquidityActor } = useContext(LiquidityMachineContext);

    const isMounted = useRef(false);
    const { ref, inView } = useInView();


    const { pairLiquidity, tokensInfo, isAllPairsFetched, isLoading, userPair } =
        useSelector(liquidityActor, state => {
            return {
                tokensInfo: state.context.tokensInfo,
                pairLiquidity: state.context.pairLiquidity,
                isAllPairsFetched: state.context.isAllPairsFetched,
                isLoading: state.hasTag("loading"),
                userPair: state.context.userPairBalances
            };
        });

    console.log({ pairLiquidity, userPair })

    const modalAddLiquidity = useModal(ModalAddLiquidity)
    const modalRemoveLiquidity = useModal(ModalRemoveLiquidity)

    const myLiquidity = userPair.map((pair) => ({ ...pairLiquidity.find((pairLiq) => pairLiq.lp_address === pair.lp_address), balance: pair.balance }))

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


    return (
        <ContainerMain>
            <Flex
                w={"100%"}
                gap={3}
                flexDir={{ base: "column", lg: "row" }}
                justifyContent={"center"}
            >
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
                            Your Liquidity
                        </Text>
                        <Button
                            bgColor={"brand.400"}
                            borderRadius={10}
                            color={"black"}
                            fontWeight={"700"}
                            onClick={() => modalAddLiquidity.show()}
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
                        px={10}
                        borderRadius={20}
                        overflowY={"scroll"}
                        h={"380px"}
                    >
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
                                        Total Pool Token
                                    </Th>
                                    <Th color={"brand.400"} borderColor={"#191B1F"}>
                                        Token 1
                                    </Th>
                                    <Th color={"brand.400"} borderColor={"#191B1F"}>
                                        Token 2
                                    </Th>
                                    <Th color={"brand.400"} borderColor={"#191B1F"}>
                                        Your Pool Share
                                    </Th>
                                    <Th color={"brand.400"} borderColor={"#191B1F"}>
                                        Action
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody overflow={"scroll"}>
                                {myLiquidity.filter((pair) => Number(pair.balance) > 0).map(pair => {
                                    const pairIcon1 = pairIcon(pair?.assets && pair?.assets[0], tokensInfo);
                                    const pairIcon2 = pairIcon(pair?.assets && pair?.assets[1], tokensInfo);
                                    const pairName1 = pairName(pair?.assets && pair?.assets[0], tokensInfo);
                                    const pairName2 = pairName(pair?.assets && pair?.assets[1], tokensInfo);

                                    return (
                                        <Tr>
                                            <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                                                <Flex align={"center"}>
                                                    <Flex position={"relative"}>
                                                        <Image src={pairIcon1} w={4} h={4} />
                                                        <Image
                                                            src={pairIcon2}
                                                            w={4}
                                                            h={4}
                                                            position={"relative"}
                                                            left={"-5px"}
                                                        />
                                                    </Flex>
                                                    <Flex gap={1}>
                                                        <Text>{isNull(pairName1) ? <Spinner size={"sm"} /> : pairName1}</Text>
                                                        <Text>/</Text>
                                                        <Text>{isNull(pairName2) ? <Spinner size={"sm"} /> : pairName2}</Text>
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
                                                ${pair.balance}
                                            </Td>
                                            <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                                                $0
                                            </Td>
                                            <Td borderBottomWidth={5} borderColor={"#191B1F"} gap={3}>
                                                <Flex gap={2}>
                                                    <Button size={"sm"}
                                                        bgColor={"brand.400"}
                                                        color={'navy.700'}
                                                        onClick={() => modalAddLiquidity.show({ token1: pair.assets[0].cw20, token2: pair.assets[1].cw20 })}
                                                    >Add</Button>
                                                    <Button color={'red'} size={"sm"} bgColor={'transparent'} onClick={() => modalRemoveLiquidity.show()}>Remove</Button>
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )
                                })}
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
            </Flex>
        </ContainerMain >
    );
};

export default MyLiquidity;
