import FormInput from "@/components/FormInput";
import WrapWallet from "@/components/WrapWallet";
import { useForm } from "react-hook-form";
import {
  useColorModeValue,
  Box,
  Heading,
  Stack,
  Button,
} from "@chakra-ui/react";

type FormType = {
  token1_denom: string;
  token2_denom: string;
};

const AddLiquidity = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const { register } = useForm<FormType>({
    defaultValues: {
      token1_denom: "ALONG",
      token2_denom: "LUNC",
    },
  });

  const onSubmit = () => {
    console.log("mancing dulu!!");
  };

  return (
    <Box my="2rem">
      <Heading>Add Liquidity</Heading>
      <Box shadow="lg" bg={bg} my={6} borderRadius="md" p={4}>
        <Stack direction="row" mb={10}>
          <FormInput
            flex="2"
            label="Token 1"
            placeholder="input token 1"
            register={register("token1_denom", { required: true })}
          />
          <FormInput
            flex="2"
            label="Token 2"
            placeholder="input token 2"
            register={register("token2_denom", { required: true })}
          />
        </Stack>
        <WrapWallet>
          <Button colorScheme="orange" onClick={onSubmit}>
            Add Pair
          </Button>
        </WrapWallet>
      </Box>
    </Box>
  );
};

export default AddLiquidity;
