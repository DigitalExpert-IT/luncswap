/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import WrapWallet from "@/components/WrapWallet";
import {
  useColorModeValue,
  Box,
  Heading,
  Stack,
  Button,
  FormControl,
  Input,
  FormLabel,
} from "@chakra-ui/react";
import TokenSelect from "@/components/TokenSelect";

const AddLiquidity = () => {
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");
  const [token1InputAmount, setToken1InputAmount] = useState("");
  const [token2InputAmount, setToken2InputAmount] = useState("");
  const bg = useColorModeValue("gray.50", "gray.900");

  const onSubmit = async () => {};

  return (
    <Box my="2rem">
      <Heading>Add Liquidity</Heading>
      <Box shadow="lg" bg={bg} my={6} borderRadius="md" p={4}>
        <Stack mb="4">
          <FormControl>
            <FormLabel>Token 1</FormLabel>
            <Stack direction="row">
              <TokenSelect value={token1} onChange={setToken1} />
              <Box flex="1">
                <Input
                  type="number"
                  required
                  value={token1InputAmount}
                  onChange={e => {
                    setToken1InputAmount(e.currentTarget.value);
                  }}
                />
              </Box>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Token 2</FormLabel>
            <Stack direction="row">
              <TokenSelect value={token2} onChange={setToken2} />
              <Box flex="1">
                <Input
                  type="number"
                  required
                  value={token2InputAmount}
                  onChange={e => {
                    setToken2InputAmount(e.currentTarget.value);
                  }}
                />
              </Box>
            </Stack>
          </FormControl>
        </Stack>
        <WrapWallet>
          <Button
            isDisabled={!token1 || !token2}
            colorScheme="orange"
            onClick={onSubmit}
          >
            Add Liquidity
          </Button>
        </WrapWallet>
      </Box>
    </Box>
  );
};

export default AddLiquidity;
