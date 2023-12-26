/* eslint-disable react-hooks/exhaustive-deps */
import TokenSelect from "@/components/TokenSelect";
import { SwapMachineContext, TokenMachineContext } from "@/machine";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";
import { useSelector } from "@xstate/react";
import { useContext, useEffect, useMemo, useState } from "react";

function DevtoolsSwap() {
  const { swapActor } = useContext(SwapMachineContext);
  const { tokenActor } = useContext(TokenMachineContext);
  const { tokenList } = useSelector(tokenActor, state => {
    return {
      tokenList: state.context.tokenList,
    };
  });
  const { isLoading, isSwapReady } = useSelector(swapActor, state => {
    return {
      isLoading: state.hasTag("loading"),
      isSwapReady: state.matches("ready"),
    };
  });
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");

  useEffect(() => {
    if (inputAddress === outputAddress) setOutputAddress("");
  }, [inputAddress]);

  useEffect(() => {
    if (outputAddress === inputAddress) setInputAddress("");
  }, [outputAddress]);

  const inputTokenMeta = useMemo(() => {
    if (!inputAddress) return undefined;
    return tokenList.find(item => item.address === inputAddress);
  }, [inputAddress, tokenList]);

  const outputTokenMeta = useMemo(() => {
    if (!outputAddress) return undefined;
    return tokenList.find(item => item.address === outputAddress);
  }, [outputAddress, tokenList]);

  const isAllInputFilled = !!inputTokenMeta && !!outputTokenMeta;

  const switchPair = () => {
    if (!inputTokenMeta) return;
    if (!outputTokenMeta) return;
    swapActor.send({
      type: "LOAD_PAIR",
      value: [inputTokenMeta, outputTokenMeta],
    });
  };

  useEffect(() => {
    if (inputAddress === outputAddress) return;
    if (inputAddress && outputAddress) switchPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAddress, outputAddress]);

  return (
    <Stack bg="gray.800" p="4">
      <FormControl>
        <FormLabel>Input</FormLabel>
        <InputGroup>
          <Box>
            <TokenSelect value={inputAddress} onChange={setInputAddress} />
          </Box>
          <Input type="number" />
        </InputGroup>
      </FormControl>
      <FormControl>
        <FormLabel>Output</FormLabel>
        <InputGroup>
          <Box>
            <TokenSelect value={outputAddress} onChange={setOutputAddress} />
          </Box>
          <Input type="number" />
        </InputGroup>
      </FormControl>

      <Button
        isDisabled={!isSwapReady || !isAllInputFilled}
        isLoading={isLoading}
        // onClick={}
      >
        Swap
      </Button>
    </Stack>
  );
}

export default DevtoolsSwap;
