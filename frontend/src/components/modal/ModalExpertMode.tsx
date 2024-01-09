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
  Checkbox,
} from "@chakra-ui/react";
import { create, useModal } from "@ebay/nice-modal-react";

export const ModalExpertMode = create(() => {
  const modal = useModal();

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide}>
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
          Expert Mode
        </ModalHeader>
        <ModalCloseButton color={"black"} size={"lg"} />
        <ModalBody>
          <Stack mt={5} gap={5}>
            <Text color={"#F56D00"}>
              Expert mode turns off the 'Confirm' transaction prompt, and allows
              high slippage trades that often result in bad rates and lost
              funds.
            </Text>
            <Text color={"white"}>
              Make sure you understand about expert mode before use it
            </Text>
            <Checkbox>Never Show This Again</Checkbox>
          </Stack>
        </ModalBody>

        <ModalFooter gap={5} justifyContent={"space-evenly"}>
          <Button
            variant="solid"
            fontWeight={"sm"}
            backgroundColor="#FCDD6F"
            size={"lg"}
            width={"50%"}
            color={"black"}
            borderRadius={15}
            fontWeight={"700"}
          >
            Save & Apply
          </Button>
          <Button
            variant="outline"
            fontWeight={"sm"}
            size={"lg"}
            width={"50%"}
            borderColor={"#FCDD6F"}
            borderRadius={15}
            fontWeight={"700"}
            color={"#FCDD6F"}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
