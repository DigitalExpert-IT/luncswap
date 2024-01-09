import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  Text,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  ButtonGroup,
  HStack,
  Input,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { create, useModal } from "@ebay/nice-modal-react";

export const ModalSettings = create(() => {
  const modal = useModal();

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide} size={"xl"}>
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
          Settings
        </ModalHeader>
        <ModalCloseButton color={"black"} size={"lg"} />
        <ModalBody>
          <Stack mt={5} gap={5}>
            <Text>Swaps & Liquidity</Text>
            <Text fontWeight={"bold"} color={"#FCDD6F"}>
              Default Transaction Speed
            </Text>
            <HStack>
              <ButtonGroup backgroundColor={"black"} borderRadius={15}>
                <Button
                  borderRadius={15}
                  variant={"unstyle"}
                  _hover={{ backgroundColor: "#FCDD6F", color: "black" }}
                >
                  Default
                </Button>
                <Button
                  borderRadius={15}
                  variant={"unstyle"}
                  _hover={{ backgroundColor: "#FCDD6F", color: "black" }}
                >
                  Standart
                </Button>
                <Button
                  borderRadius={15}
                  variant={"unstyle"}
                  _hover={{ backgroundColor: "#FCDD6F", color: "black" }}
                >
                  Fast
                </Button>
                <Button
                  borderRadius={15}
                  variant={"unstyle"}
                  _hover={{ backgroundColor: "#FCDD6F", color: "black" }}
                >
                  Instant
                </Button>
              </ButtonGroup>
            </HStack>
            <Text fontWeight={"bold"} color={"#FCDD6F"}>
              Slippage Tolerance
            </Text>
            <Input
              placeholder="0.1%"
              backgroundColor={"white"}
              color={"black"}
              width={"65%"}
              height={"2rem"}
            ></Input>
            <HStack justifyContent={"space-between"}>
              <HStack>
                <Text fontWeight={"bold"} color={"#FCDD6F"}>
                  Tx Deadline
                </Text>
                <Tooltip
                  label={
                    "Your transaction will revert if it is left confirming for longer than this time."
                  }
                >
                  <AiOutlineQuestionCircle />
                </Tooltip>
              </HStack>
              <Input backgroundColor={"white"} width={"20%"} height={"2rem"} />
            </HStack>
            <HStack justifyContent={"space-between"}>
              <HStack>
                <Text fontWeight={"bold"} color={"#FCDD6F"}>
                  Expert Mode
                </Text>
                <Tooltip
                  label={
                    "Your transaction will revert if it is left confirming for longer than this time."
                  }
                >
                  <AiOutlineQuestionCircle />
                </Tooltip>
              </HStack>
              <Switch colorScheme="yellow" onChange={() => modal.hide()} />
            </HStack>
          </Stack>
        </ModalBody>

        <ModalFooter alignSelf={"center"}>
          <Button variant="ghost" fontWeight={"sm"}>
            Save & Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
