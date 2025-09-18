import type { FC, ReactNode } from "react";
import { useEffect } from "react";
import { createContext, useContext, useState } from "react";
import type { LxdInstance } from "types/instance";
import { getInstanceKey } from "util/instances";
import { useOperations } from "context/operationsProvider";
import { getInstanceName, getProjectName } from "util/operations";
import type { LxdOperation } from "types/operation";
import { mapsAreEqual } from "util/mapsAreEqual";

type LoadingTypes =
  | "Starting"
  | "Stopping"
  | "Restarting"
  | "Freezing"
  | "Migrating";

export interface InstanceLoadingType {
  getType: (instance: LxdInstance) => LoadingTypes | undefined;
  setLoading: (instance: LxdInstance, loadingType: LoadingTypes) => void;
  setFinish: (instance: LxdInstance) => void;
}

const InstanceLoadingContext = createContext<InstanceLoadingType>({
  getType: () => undefined,
  setLoading: () => undefined,
  setFinish: () => undefined,
});

interface Props {
  children: ReactNode;
}

const getLoadingType = (operation: LxdOperation): LoadingTypes | null => {
  switch (operation.description) {
    case "Starting instance":
      return "Starting";
    case "Stopping instance":
      return "Stopping";
    case "Freezing instance":
      return "Freezing";
    case "Unfreezing instance":
      return "Starting";
    case "Restarting instance":
      return "Restarting";
    default:
      return null;
  }
};

const getStatesFromOperations = (
  operations: LxdOperation[],
): Map<string, LoadingTypes> => {
  const newMap = new Map<string, LoadingTypes>();
  for (const operation of operations) {
    const loadingType = getLoadingType(operation);
    const name = getInstanceName(operation);
    const project = getProjectName(operation);

    if (loadingType && name && project && operation.status === "Running") {
      const instance = { name, project } as LxdInstance;
      newMap.set(getInstanceKey(instance), loadingType);
    }
  }
  return newMap;
};

export const InstanceLoadingProvider: FC<Props> = ({ children }) => {
  const { runningOperations } = useOperations();
  const [instanceStates, setInstanceStates] = useState(
    new Map<string, LoadingTypes>(),
  );

  useEffect(() => {
    // Update instance loading states based on running operations.
    // This pulls in updates triggered on cli or from other users.
    // This initializes the states on first load.
    const newStates = getStatesFromOperations(runningOperations);
    if (!mapsAreEqual(newStates, instanceStates)) {
      setInstanceStates(newStates);
    }
  }, [runningOperations]);

  const setLoading = (instance: LxdInstance, loadingType: LoadingTypes) => {
    if (instanceStates.get(getInstanceKey(instance)) === loadingType) {
      return; // skip if state already matches
    }
    setInstanceStates((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.set(getInstanceKey(instance), loadingType);
      return newMap;
    });
  };

  const setFinish = (instance: LxdInstance) => {
    setInstanceStates((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.delete(getInstanceKey(instance));
      return newMap;
    });
  };

  return (
    <InstanceLoadingContext.Provider
      value={{
        getType: (instance: LxdInstance) =>
          instanceStates.get(getInstanceKey(instance)),
        setLoading,
        setFinish,
      }}
    >
      {children}
    </InstanceLoadingContext.Provider>
  );
};

export function useInstanceLoading(): InstanceLoadingType {
  return useContext(InstanceLoadingContext);
}
