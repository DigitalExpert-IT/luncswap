import { Flex, IconButton, Text, Box, useClipboard } from "@chakra-ui/react";
import { HiClipboard } from "react-icons/hi2";

type Props = {
  children?: string;
};

function ShortAddress(props: Props) {
  const { onCopy, hasCopied } = useClipboard(props.children ?? "");
  if (!props.children) return null;
  return (
    <Flex flexDir="row" align="center" justify="center" gap="2">
      <Text>
        {props.children.slice(0, 6)}...
        {props.children.slice(props.children.length - 4)}
      </Text>
      <Box>
        <IconButton
          size="sm"
          onClick={onCopy}
          variant="solid"
          colorScheme={hasCopied ? "green" : "gray"}
          icon={<HiClipboard />}
          aria-label="copy"
        />
      </Box>
    </Flex>
  );
}

export default ShortAddress;
