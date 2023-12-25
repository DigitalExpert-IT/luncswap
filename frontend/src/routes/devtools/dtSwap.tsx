import { useFactoryContract } from "@/hooks";
import { TokenMeta } from "@/interface";
import { pairMachine } from "@/machine";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useActorRef, useSelector } from "@xstate/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActorRef, fromPromise, EventFrom, SnapshotFrom } from "xstate";

type EventType = EventFrom<typeof pairMachine>;
type SnapshotType = SnapshotFrom<typeof pairMachine>;
const MachineContext = createContext<{
  pairActor: ActorRef<SnapshotType, EventType>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({ pairActor: undefined as any });

function DevtoolsSwap() {
  const { pairActor } = useContext(MachineContext);
  const { isLoading, isSwapReady, liquidityPool } = useSelector(
    pairActor,
    state => {
      const token1Reserve = BigInt(
        state.context.pairInfo?.token1_reserve ?? "0",
      );
      const token2Reserve = BigInt(
        state.context.pairInfo?.token2_reserve ?? "0",
      );
      const liquidityPool = token1Reserve * token2Reserve;
      return {
        liquidityPool,
        isLoading: state.hasTag("loading"),
        isSwapReady: state.matches("ready"),
      };
    },
  );

  const { tokenList } = useFactoryContract();
  const [inputAddress, setInputAddress] = useState("");
  const [outputAddress, setOutputAddress] = useState("");
  const injectedTokenList = useMemo(() => {
    const nativeToken: TokenMeta = {
      address: "native",
      info: {
        decimals: 6,
        name: "luna",
        symbol: "luna",
        total_supply: String(1000000000e6),
      },
      marketing: {
        description: null,
        logo: null,
        marketing: null,
        project: null,
      },
    };

    return [nativeToken].concat(tokenList);
  }, [tokenList]);

  const isZeroLiquidity = liquidityPool === BigInt("0");

  const handleGetInfo = () => {
    if (!inputAddress) return;
    if (!outputAddress) return;

    const inputDenom =
      inputAddress === "native" ? { native: "luna" } : { cw20: inputAddress };
    const outputDenom =
      outputAddress === "native" ? { native: "luna" } : { cw20: outputAddress };
    pairActor.send({
      type: "LOAD_PAIR",
      value: [inputDenom, outputDenom],
    });
  };

  useEffect(() => {
    if (inputAddress && outputAddress) handleGetInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAddress, outputAddress]);

  return (
    <Stack bg="gray.800" p="4">
      <FormControl>
        <FormLabel>Input</FormLabel>
        <InputGroup>
          <Select
            value={inputAddress}
            onChange={e => {
              setInputAddress(e.currentTarget.value);
            }}
          >
            <option value="">Select Token</option>
            {injectedTokenList.map(item =>
              item.address === outputAddress ? null : (
                <option value={item.address} key={item.address}>
                  {item.info.name}
                </option>
              ),
            )}
          </Select>
          <Input type="number" />
        </InputGroup>
      </FormControl>
      <FormControl>
        <FormLabel>Output</FormLabel>
        <InputGroup>
          <Select
            value={outputAddress}
            onChange={e => {
              setOutputAddress(e.currentTarget.value);
            }}
          >
            <option value="">Select Token</option>
            {injectedTokenList.map(item =>
              item.address === inputAddress ? null : (
                <option value={item.address} key={item.address}>
                  {item.info.name}
                </option>
              ),
            )}
          </Select>
          <Input type="number" />
        </InputGroup>
      </FormControl>
      {isSwapReady && isZeroLiquidity ? (
        <Text my="2" color="red.600">
          No Liquidity
        </Text>
      ) : null}
      <Button
        isLoading={isLoading}
        isDisabled={!isSwapReady || isZeroLiquidity}
        onClick={handleGetInfo}
      >
        Swap
      </Button>
    </Stack>
  );
}

function MachineWrapper() {
  const { loadPair } = useFactoryContract();

  const actorRef = useActorRef(
    pairMachine.provide({
      actors: {
        loadPair: fromPromise(({ input }) => loadPair(input)),
      },
    }),
  );

  return (
    <MachineContext.Provider value={{ pairActor: actorRef }}>
      <DevtoolsSwap />
    </MachineContext.Provider>
  );
}

export default MachineWrapper;
