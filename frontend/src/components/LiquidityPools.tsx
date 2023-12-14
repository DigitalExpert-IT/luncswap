import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
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
import { Select } from "chakra-react-select";

const options = [
  {
    value: "bnb",
    label: (
      <Flex align={"center"} gap={3}>
        <Image src={"bnb.png"} w={5} h={5} />
        <Box fontWeight={"700"} color={"#FCDD6F"}>
          BNB
        </Box>
      </Flex>
    ),
  },
  {
    value: "lunc",
    label: (
      <Flex align={"center"} gap={3}>
        <Image src={"lunc.png"} w={5} h={5} />
        <Box fontWeight={"700"} color={"#FCDD6F"}>
          LUNC
        </Box>
      </Flex>
    ),
  },
];

const LiquidityPools = () => {
  return (
    <Container maxW={"container.xl"}>
      <VStack gap={10}>
        <Heading fontWeight={"700"} fontSize={"3xl"}>
          MAKE A SWAP WITH US.
        </Heading>
        <Flex w={"100%"} gap={3}>
          <Box
            bgColor={"#191B1F"}
            border={"2px solid #A4A4BE"}
            borderRadius={20}
            overflow={"hidden"}
            flex={2}
          >
            <Text fontWeight={"700"} fontSize={"2xl"} px={10} py={4}>
              SWAP NOW
            </Text>
            <Box backgroundColor={"#FCDD6F"}>
              <Flex py={2} px={10} gap={3} justifyContent={"space-between"}>
                <Text color={"black"}>Trade tokens in 1 minute.</Text>
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
                <Text fontWeight={"600"}>FROM</Text>
                <Flex bgColor={"white"} p={"2px"} borderRadius={10} mt={1}>
                  <Box width={"100%"} flex={1}>
                    <Select
                      onChange={() => {}}
                      options={options}
                      chakraStyles={{
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
                      }}
                    />
                  </Box>
                  <Input type="text" color={"black"} flex={1} />
                </Flex>
              </Box>
              <Flex mt={4} justifyContent={"center"}>
                <Image src="/swap.png" w={4} h={4} />
              </Flex>
              <Box>
                <Text fontWeight={"600"}>TO</Text>
                <Flex bgColor={"white"} p={"2px"} borderRadius={10} mt={1}>
                  <Box width={"100%"} flex={1}>
                    <Select
                      onChange={() => {}}
                      options={options}
                      chakraStyles={{
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
                      }}
                    />
                  </Box>

                  <Input type="text" color={"black"} flex={1} />
                </Flex>
              </Box>
              <Flex mt={10} justifyContent={"space-between"} mb={2}>
                <Flex align={"center"} gap={3}>
                  <Text>Slippage Tolerance</Text>
                  <Image src="/pencil.png" w={4} h={4} />
                </Flex>
                <Text>0.5%</Text>
              </Flex>
              <Button bgColor={"#FCDD6F"} w={"100%"} mb={10} borderRadius={12}>
                SWAP
              </Button>
            </Box>
          </Box>
          <Box
            flex={3}
            w={"100%"}
            bgColor={"#191B1F"}
            borderRadius={20}
            border={"2px solid #A4A4BE"}
          >
            <Flex px={10} py={4} justifyContent={"space-between"}>
              <Text fontWeight={"700"} fontSize={"2xl"}>
                ALL POOLS
              </Text>
              <Button bgColor={"#FCDD6F"} borderRadius={10}>
                Add Liquidity
              </Button>
            </Flex>

            <TableContainer px={10} borderRadius={20}>
              <Table colorScheme="teal" bgColor={"#27262C"} borderRadius={15}>
                <Thead>
                  <Tr
                    color={"#FCDD6F"}
                    borderBottomWidth={5}
                    borderColor={"#191B1F"}
                  >
                    <Th color={"#FCDD6F"} borderColor={"#191B1F"}>
                      POOL
                    </Th>
                    <Th color={"#FCDD6F"} borderColor={"#191B1F"}>
                      TVL
                    </Th>
                    <Th color={"#FCDD6F"} borderColor={"#191B1F"}>
                      VOLUME 24H
                    </Th>
                    <Th color={"#FCDD6F"} borderColor={"#191B1F"}>
                      VOLUME 7D
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      inches
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      millimetres (mm)
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      253.24
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      dkasdas dw
                    </Td>
                  </Tr>
                  <Tr>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      inches
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      millimetres (mm)
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      253.24
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      dkasdas dw
                    </Td>
                  </Tr>
                  <Tr>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      inches
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      millimetres (mm)
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      253.24
                    </Td>
                    <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                      dkasdas dw
                    </Td>
                  </Tr>
                </Tbody>
                <Tfoot>
                  <Tr>
                    <Th colSpan={4}>
                      <Flex justifyContent={"center"}>Page 2 of 3</Flex>
                    </Th>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
};

export default LiquidityPools;
