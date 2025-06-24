import type { FC, ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { LxdInstance } from "types/instance";
import { getInstanceKey } from "util/instances";

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

export const InstanceLoadingProvider: FC<Props> = ({ children }) => {
  const [instanceStates, setInstanceStates] = useState(
    new Map<string, LoadingTypes>(),
  );

  const setLoading = (instance: LxdInstance, loadingType: LoadingTypes) => {
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
