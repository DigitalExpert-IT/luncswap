import { TokenMeta } from "@/interface";
import { shortenAddress } from "@/utils";
import {
  Avatar,
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { create, useModal } from "@ebay/nice-modal-react";

type Props = {
  tokenList: TokenMeta[];
};
const ModalTokenSelect = create<Props>(({ tokenList }) => {
  const modal = useModal();

  const onSelect = (tokenAddr: string) => {
    modal.resolve(tokenAddr);
    modal.hide();
  };

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Select Token</ModalHeader>
        <ModalBody pb="8">
          <Stack>
            {tokenList.map(token => (
              <TokenItem key={token.address} data={token} onClick={onSelect} />
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

type TokenItemProps = {
  data: TokenMeta;
  onClick: (tokenAddr: string) => void;
};
function TokenItem(props: TokenItemProps) {
  const { data, onClick } = props;

  return (
    <Flex
      _hover={{ opacity: 0.8 }}
      _active={{ opacity: 1 }}
      cursor="pointer"
      flexDirection="row"
      gap="2"
      onClick={() => onClick(data.address)}
    >
      <Box>
        <Avatar name={data.info.name} />
      </Box>
      <Box>
        <Text>{data.info.name}</Text>
        <Text fontSize="small">
          {data.address === "native"
            ? "Native Coin"
            : shortenAddress(data.address)}
        </Text>
      </Box>
    </Flex>
  );
}

export default ModalTokenSelect;
