import { useContext, useEffect, useMemo } from "react";
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
  Image,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import { TokenMachineContext } from "@/machine";
import { useSelector } from "@xstate/react";
import { useDebouncedInput } from "@/hooks";

const ModalTokenSelect = create(() => {
  const modal = useModal();
  const [keyword, debouncedKeyword, setKeyword] = useDebouncedInput(200);
  const { tokenActor } = useContext(TokenMachineContext);
  const { tokenList, isLoading } = useSelector(tokenActor, state => {
    return {
      tokenList: state.context.tokenList,
      isLoading: state.hasTag("loading"),
    };
  });

  useEffect(() => {
    if (!modal.visible) {
      setKeyword("");
    }
  }, [modal.visible, setKeyword]);

  const filteredTokenList = useMemo(() => {
    return tokenList
      .filter(item => {
        if (item.address === debouncedKeyword) return true;
        if (
          item.info.name.toLowerCase().includes(debouncedKeyword.toLowerCase())
        ) {
          return true;
        }
        if (
          item.info.symbol
            .toLowerCase()
            .includes(debouncedKeyword.toLowerCase())
        ) {
          return true;
        }

        return false;
      })
      .slice(0, 15);
  }, [debouncedKeyword, tokenList]);

  const handlePaste = (address: string) => {
    tokenActor.send({
      type: "SEARCH_TOKEN",
      value: { address },
    });
  };

  const onSelect = (tokenAddr: string) => {
    modal.resolve(tokenAddr);
    modal.hide();
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
              autoFocus
              type="text"
              value={keyword}
              onPaste={e => {
                handlePaste(e.clipboardData.getData("text"));
              }}
              placeholder="Search name or paste address"
              onChange={e => setKeyword(e.currentTarget.value)}
            />
          </InputGroup>
          {isLoading ? (
            <Stack w="full" py="8" align="center">
              <Spinner margin="0 auto" />
            </Stack>
          ) : null}
          {!isLoading && filteredTokenList.length === 0 ? (
            <Box py="8" textAlign="center">
              <Image w="30%" margin="0 auto" src="/void.svg" alt="Not Found" />
              <Heading size="sm" mt="6">
                Token Not Found
              </Heading>
            </Box>
          ) : null}
          <Stack mt="2rem">
            {filteredTokenList.map(token => (
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
      _hover={{ opacity: 0.8, bgColor: "gray.700" }}
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
