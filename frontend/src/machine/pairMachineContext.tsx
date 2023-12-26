import { useFactoryContract } from "@/hooks";
import { pairMachine } from "@/machine";
import { useActorRef } from "@xstate/react";
import React, { createContext } from "react";
import { ActorRef, fromPromise, EventFrom, SnapshotFrom } from "xstate";

type EventType = EventFrom<typeof pairMachine>;
type SnapshotType = SnapshotFrom<typeof pairMachine>;
export const PairMachineContext = createContext<{
  pairActor: ActorRef<SnapshotType, EventType>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({ pairActor: undefined as any });

function PairMachineProvider(props: { children: React.ReactNode }) {
  const { loadPair, addLiquidity, swap } = useFactoryContract();

  const actorRef = useActorRef(
    pairMachine.provide({
      actors: {
        loadPair: fromPromise(({ input }) => loadPair(input)),
        addLiquidity: fromPromise(({ input }) =>
          addLiquidity(input[0], input[1]),
        ),
        swap: fromPromise(({ input }) => swap(input[0], input[1])),
      },
    }),
  );

  return (
    <PairMachineContext.Provider value={{ pairActor: actorRef }}>
      {props.children}
    </PairMachineContext.Provider>
  );
}

export default PairMachineProvider;
