import FormInput from "@/components/FormInput";
import FormTextarea from "@/components/FormTextarea";
import {
  Box,
  Button,
  Heading,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useForm, useFieldArray } from "react-hook-form";
import { HiPlus, HiTrash } from "react-icons/hi2";

type FormType = {
  name: string;
  symbol: string;
  decimals: number;
  minter: {
    address: string;
    cap: string;
  };
  initial_balances: {
    address: string;
    amount: number;
  }[];
  marketing: {
    project: string;
    description: string;
    marketing: string;
    logo: string;
  };
};

function TokenFactory() {
  const bg = useColorModeValue("gray.50", "gray.900");

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues: {
      decimals: 6,
      initial_balances: [
        {
          address: "",
          amount: 0,
        },
      ],
    },
  });
  const initialbalancesFields = useFieldArray({
    control,
    name: "initial_balances",
  });

  const handleReset = () => {
    reset({
      decimals: 6,
      initial_balances: [{ address: "", amount: 0 }],
    });
  };

  const onSubmit = handleSubmit(async val => {
    console.log(val);
  });

  return (
    <Box>
      <Heading>Deploy CW20 Token</Heading>
      <Text>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
        nobis nesciunt. Suscipit quos quod quaerat pariatur nemo debitis rem
        libero, eos fuga reiciendis, quam quidem esse aliquam veniam eveniet
        itaque!
      </Text>
      <Box shadow="lg" mt="6" borderRadius="md" p="4" bg={bg}>
        <Stack direction="row">
          <FormInput
            isRequired
            flex="2"
            register={register("name", { required: true })}
            error={errors.name}
            label="Name"
            placeholder="lunc"
          />
          <FormInput
            isRequired
            flex="2"
            register={register("symbol", { required: true })}
            error={errors.symbol}
            label="Symbol"
            placeholder="LUNC"
          />
          <FormInput
            isRequired
            flex="2"
            type="number"
            register={register("decimals", {
              required: true,
              valueAsNumber: true,
            })}
            error={errors.name}
            label="Decimals"
          />
        </Stack>
        <Box>
          <Stack mt="4" direction="row" justify="space-between">
            <Heading size="md">Initial Balances</Heading>
            <Box>
              <IconButton
                colorScheme="orange"
                icon={<HiPlus />}
                aria-label="add"
                onClick={() => {
                  initialbalancesFields.append({ address: "", amount: 0 });
                }}
              />
            </Box>
          </Stack>
          {initialbalancesFields.fields.map((field, index) => (
            <Stack align="end" direction="row" key={field.id}>
              <FormInput
                isRequired
                flex="2"
                register={register(`initial_balances.${index}.address`, {
                  required: true,
                })}
                label="Address"
              />
              <FormInput
                isRequired
                flex="2"
                type="number"
                register={register(`initial_balances.${index}.amount`, {
                  required: true,
                  valueAsNumber: true,
                })}
                label="Amount"
              />
              <Box>
                <IconButton
                  colorScheme="red"
                  icon={<HiTrash />}
                  isDisabled={initialbalancesFields.fields.length <= 1}
                  aria-label="delete"
                  onClick={() => {
                    initialbalancesFields.remove(index);
                  }}
                />
              </Box>
            </Stack>
          ))}
        </Box>
        <Box>
          <Heading mt="4" mb="2" size="md">
            Minter
          </Heading>
          <Stack>
            <FormInput
              register={register("minter.address")}
              label="Minter Address"
            />
            <FormInput
              type="number"
              register={register("minter.cap", { valueAsNumber: true })}
              label="Cap"
            />
          </Stack>
        </Box>
        <Box>
          <Heading mt="4" mb="2" size="md">
            Marketing Info
          </Heading>
          <Stack>
            <FormInput
              register={register("marketing.project")}
              error={errors.marketing?.project}
              label="Project"
              placeholder="Project Name"
            />
            <FormTextarea
              register={register("marketing.description")}
              label="Description"
            />
            <FormInput
              register={register("marketing.marketing")}
              label="Marketing"
            />
            <FormInput register={register("marketing.logo")} label="Logo" />
          </Stack>
        </Box>
        <Stack
          direction="row"
          py="4"
          mt="4"
          bg={bg}
          zIndex="2"
          position="sticky"
          bottom="0"
        >
          <Button colorScheme="green" onClick={onSubmit}>
            Deploy Token
          </Button>
          <Button colorScheme="red" onClick={handleReset}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default TokenFactory;
