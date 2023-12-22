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

const AllPoolsTable = () => {
  const { t } = useTranslation();

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
          bgColor={"#FCDD6F"}
          borderRadius={10}
          color={"black"}
          fontWeight={"700"}
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
            <Tr color={"#FCDD6F"} borderBottomWidth={5} borderColor={"#191B1F"}>
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
                <Flex align={"center"}>
                  <Flex position={"relative"}>
                    <Image src="/ustc.png" w={4} h={4} />
                    <Image
                      src="/lunc.png"
                      w={4}
                      h={4}
                      position={"relative"}
                      left={"-5px"}
                    />
                  </Flex>
                  <Text>USTC/LUNC</Text>
                </Flex>
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
            </Tr>
            <Tr>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                <Flex align={"center"}>
                  <Flex position={"relative"}>
                    <Image src="/ustc.png" w={4} h={4} />
                    <Image
                      src="/lunc.png"
                      w={4}
                      h={4}
                      position={"relative"}
                      left={"-5px"}
                    />
                  </Flex>
                  <Text>USTC/LUNC</Text>
                </Flex>
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
            </Tr>
            <Tr>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                <Flex align={"center"}>
                  <Flex position={"relative"}>
                    <Image src="/ustc.png" w={4} h={4} />
                    <Image
                      src="/lunc.png"
                      w={4}
                      h={4}
                      position={"relative"}
                      left={"-5px"}
                    />
                  </Flex>
                  <Text>USTC/LUNC</Text>
                </Flex>
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
              <Td borderBottomWidth={5} borderColor={"#191B1F"}>
                $9.09m
              </Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th colSpan={4}>
                <Flex justifyContent={"center"} gap={3} align={"center"}>
                  <FaArrowLeftLong />
                  <Text>Page 2 of 3</Text>
                  <FaArrowRightLong />
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
