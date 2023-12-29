import { useState } from "react";
import { TokenMeta } from "@/interface";
import { shortenAddress } from "@/utils";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { create, useModal } from "@ebay/nice-modal-react";
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
  InputGroup,
  Input,
  InputLeftElement,
} from "@chakra-ui/react";

type Props = {
  tokenList: TokenMeta[];
};

const ModalTokenSelect = create<Props>(({ tokenList }) => {
  const modal = useModal();

  const [filteredTokens, setFilteredTokens] = useState<TokenMeta[]>([
    ...tokenList,
  ]);

  const onSelect = (tokenAddr: string) => {
    modal.resolve(tokenAddr);
    modal.hide();
  };

  const fetchData = (value: string) => {
    const result = tokenList.filter(i => {
      return (
        i.address.includes(value) || i.info.name.toLowerCase().includes(value)
      );
    });
    setFilteredTokens(result);
  };

  const handleChange = (value: string) => {
    fetchData(value);
  };

  return (
    <Modal isOpen={modal.visible} onClose={modal.hide} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bgColor="navy.900">
        <ModalCloseButton />
        <ModalHeader>Choose Token</ModalHeader>
        <ModalBody pb="8">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <HiOutlineMagnifyingGlass color="gray.900" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search name or paste address"
              onChange={e => handleChange(e.target.value)}
            />
          </InputGroup>
          <Stack mt="2rem">
            {filteredTokens.map(token => (
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
        <Avatar src={data.marketing.logo?.url ?? ""} name={data.info.name} />
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
