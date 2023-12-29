import FormInput from "@/components/FormInput";
import FormTextarea from "@/components/FormTextarea";
import ShortAddress from "@/components/ShortAddress";
import WrapWallet from "@/components/WrapWallet";
import { useExecuteContract } from "@/hooks";
import { findEventAttribute } from "@/lib";
import {
  Box,
  Button,
  Heading,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { MsgInstantiateContract } from "@terra-money/feather.js";
import { useConnectedWallet } from "@terra-money/wallet-kit";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { HiPlus, HiTrash } from "react-icons/hi2";

type FormType = {
  name: string;
  symbol: string;
  decimals: number;
  mint: {
    minter: string;
    cap: string;
  };
  initial_balances: {
    address: string;
    amount: string;
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
  const toast = useToast();
  const connectedWallet = useConnectedWallet();
  const [deployToken, { isLoading }] = useExecuteContract();

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
          address: connectedWallet?.addresses["pisco-1"] ?? "",
          amount: "0",
        },
      ],
    },
  });
  const initialbalancesFields = useFieldArray({
    control,
    name: "initial_balances",
  });

  useEffect(() => {
    if (connectedWallet) {
      initialbalancesFields.update(0, {
        address: connectedWallet.addresses["pisco-1"],
        amount: "0",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet]);

  const handleReset = () => {
    reset({
      decimals: 6,
      initial_balances: [{ address: "", amount: "0" }],
    });
  };

  const onSubmit = handleSubmit(async val => {
    if (!connectedWallet) return;
    try {
      val.initial_balances.forEach((item, idx) => {
        val.initial_balances[idx].amount = String(
          +`${item.amount}e${val.decimals}`,
        );
      });
      if (val.mint.cap) {
        val.mint.cap = String(+`${val.mint.cap}e${val.decimals}`);
      }

      const msg = new MsgInstantiateContract(
        connectedWallet.addresses["pisco-1"],
        undefined,
        12410,
        {
          name: val.name,
          symbol: val.symbol,
          decimals: val.decimals,
          initial_balances: val.initial_balances,
          mint:
            val.mint.minter !== ""
              ? {
                  minter: val.mint.minter,
                  cap: val.mint.cap || undefined,
                }
              : undefined,
          marketing: {
            project: val.marketing.project || undefined,
            description: val.marketing.description || undefined,
            marketing: val.marketing.marketing || undefined,
            logo: val.marketing.logo
              ? {
                  url: val.marketing.logo,
                }
              : undefined,
          },
        },
        undefined,
        val.name,
      );
      const res = deployToken([msg]);
      toast.promise(res, {
        success: txInfo => {
          const contractAddress = findEventAttribute(
            "_contract_address",
            txInfo,
          );
          return {
            title: "Token Deployed",
            description: <ShortAddress>{contractAddress}</ShortAddress>,
            position: "bottom-right",
            duration: null,
            isClosable: true,
          };
        },
        error: {
          title: "Ooops!",
          description: "Something Went Wrong!",
          position: "bottom-right",
        },
        loading: {
          title: "Deploying Token",
          position: "bottom-right",
        },
      });
    } catch (error) {
      // do nothing
    }
  });

  return (
    <Box>
      <Heading>Deploy CW20 Token</Heading>
      <Text my="2">
        You can deploy your own cw20 token standard using one click!
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
                  initialbalancesFields.append({ address: "", amount: "0" });
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
              register={register("mint.minter")}
              label="Minter Address"
            />
            <FormInput
              type="number"
              register={register("mint.cap")}
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
          <WrapWallet>
            <Button
              isLoading={isLoading}
              colorScheme="green"
              onClick={onSubmit}
            >
              Deploy Token
            </Button>
          </WrapWallet>
          <Button
            isDisabled={isLoading}
            colorScheme="red"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default TokenFactory;
