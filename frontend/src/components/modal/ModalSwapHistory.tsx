import {
  Modal,
  ModalBody,
  ModalCloseButton,
  Text,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Box,
  HStack,
} from "@chakra-ui/react";
import {
  TbArrowsExchange,
  TbArrowNarrowRight,
  TbClockFilled,
} from "react-icons/tb";

export const ModalSwapHistory = (props: any) => {
  const { open, onClose } = props;

  const dummyData = [
    {
      date: "Thursday, Nov 08 2023",
      fromToken: "LUNA",
      fromValue: "0.0831231317",
      toToken: "USTC",
      toValue: "0.0831231317",
    },
    {
      date: "Thursday, Nov 08 2023",
      fromToken: "LUNA",
      fromValue: "0.0831231317",
      toToken: "USTC",
      toValue: "0.0831231317",
    },
    {
      date: "Thursday, Nov 08 2023",
      fromToken: "LUNA",
      fromValue: "0.0831231317",
      toToken: "USTC",
      toValue: "0.0831231317",
    },
  ];

  return (
    <Modal isOpen={open} onClose={onClose} size={"xl"}>
      <ModalOverlay />
      <ModalContent
        borderRadius={25}
        border={"solid"}
        borderColor={"whiteAlpha"}
        backgroundColor={"#191B1F"}
      >
        <ModalHeader
          style={{
            backgroundColor: "#FCDD6F",
            borderTopLeftRadius: 23,
            borderTopRightRadius: 23,
            color: "black",
          }}
        >
          Swap History
        </ModalHeader>
        <ModalCloseButton color={"black"} size={"lg"} />
        <ModalBody>
          {dummyData.map(data => (
            <Stack mt={5} gap={5}>
              <Text fontWeight={"bold"} color={"#54DDE3"}>
                {data.date}
              </Text>
              <HStack gap={5}>
                <Box color={"#6E89AE"}>
                  <TbArrowsExchange size={32} />
                </Box>
                <Stack>
                  <Text color={"#FFEB68"} fontWeight={"bold"}>
                    {data.fromToken}
                  </Text>
                  <Text>{data.fromValue}</Text>
                </Stack>
                <Box color={"#6E89AE"}>
                  <TbArrowNarrowRight size={32} />
                </Box>
                <Stack>
                  <Text color={"#FFEB68"} fontWeight={"bold"}>
                    {data.toToken}
                  </Text>
                  <Text>{data.toValue}</Text>
                </Stack>
                <Box color={"#A4A4BE"}>
                  <TbClockFilled size={32} />
                </Box>
              </HStack>
            </Stack>
          ))}
        </ModalBody>

        <ModalFooter gap={5} justifyContent={"space-evenly"}></ModalFooter>
      </ModalContent>
    </Modal>
  );
};
