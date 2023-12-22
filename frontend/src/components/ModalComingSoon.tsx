import "@fontsource/galindo";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Stack,
  Box,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

export const ModalComingSoon = () => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent
        bg="#3D5098"
        border="2px solid"
        borderColor="brand.600"
        borderRadius="2xl"
      >
        <ModalCloseButton />
        <ModalBody>
          <Stack direction="row" align="center" spacing="1rem">
            <Box flex={1}>
              <Image src="./rabbit-rocket.png" objectFit="cover" />
            </Box>
            <Box flex={1}>
              <Text
                my="1rem"
                fontFamily={"Galindo, sans-serif"}
                fontSize="3xl"
                color="brand.400"
                textTransform="uppercase"
                textShadow="1px 1px #00A3FF"
              >
                Launching Soon
              </Text>
              <Text
                fontFamily={"Galindo, sans-serif"}
                textTransform="uppercase"
              >
                OUR WEBSITE IS Coming VERY Soon to Redefine Your Trading
                Experience!
              </Text>

              <Text color="gray.300" fontWeight="bold" fontSize="sm" mt="1rem">
                Close this pop up for early website tour
              </Text>
            </Box>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
