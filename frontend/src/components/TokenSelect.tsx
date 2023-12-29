import { Box, Flex, Icon, Spinner, Text, Avatar } from "@chakra-ui/react";
import { useModal } from "@ebay/nice-modal-react";
import { useContext, useMemo } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { TokenMachineContext } from "@/machine";
import { useSelector } from "@xstate/react";
import ModalTokenSelect from "./ModalTokenSelect";
import { useMount } from "@/hooks";

type Props = {
  value: string;
  onChange: (tokenAddr: string) => void;
};

function TokenSelect(props: Props) {
  const { tokenActor } = useContext(TokenMachineContext);
  const { tokenList, isLoading } = useSelector(tokenActor, state => {
    return {
      isLoading: state.hasTag("loading"),
      tokenList: state.context.tokenList,
    };
  });
  const modal = useModal(ModalTokenSelect);

  const selectedToken = useMemo(() => {
    return tokenList.find(item => item.address === props.value);
  }, [props.value, tokenList]);

  const handleClick = async () => {
    if (isLoading) return;
    const selectedAddr = await modal.show({ tokenList: tokenList });
    props.onChange(selectedAddr as string);
  };

  useMount(() => {
    tokenActor.send({ type: "LOAD_LIST" });
  });

  return (
    <Flex
      onClick={handleClick}
      width="max-content"
      py="2"
      bg="navy.800"
      _hover={{ bg: "navy.700" }}
      _active={{ bg: "navy.800" }}
      px="4"
      borderRadius="xl"
      cursor="pointer"
      flexDirection="row"
      gap="3"
      align="center"
    >
      {!selectedToken ? (
        <Box flex="1">
          <Text>Select Token</Text>
        </Box>
      ) : (
        <Flex flex="1" flexDirection="row" align="center" gap={2}>
          <Avatar
            src={selectedToken.marketing.logo?.url ?? ""}
            name={selectedToken.info.name}
            size="sm"
          />
          <Text>{selectedToken.info.name}</Text>
        </Flex>
      )}
      {isLoading ? <Spinner /> : <Icon as={HiChevronDown} />}
    </Flex>
  );
}

export default TokenSelect;
