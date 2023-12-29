import { useContext, useEffect, useMemo } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { create, useModal } from "@ebay/nice-modal-react";
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
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
import { TokenItem } from "./ModalTokenSelect";

export const ModalTokenSelect = create(() => {
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
  }, [modal.visible]);

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
    <Modal isOpen={modal.visible} onClose={modal.hide} size="xl">
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
