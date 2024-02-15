import { createContext, FC, ReactNode, useContext, useState } from "react";
import { LxdInstance } from "types/instance";

type LoadingTypes = "Starting" | "Stopping" | "Restarting" | "Freezing";

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
      newMap.set(instance.name, loadingType);
      return newMap;
    });
  };

  const setFinish = (instance: LxdInstance) => {
    setInstanceStates((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.delete(instance.name);
      return newMap;
    });
  };

  return (
    <InstanceLoadingContext.Provider
      value={{
        getType: (instance: LxdInstance) => instanceStates.get(instance.name),
        setLoading,
        setFinish,
      }}
    >
      {children}
    </InstanceLoadingContext.Provider>
  );
};

export function useInstanceLoading() {
  return useContext(InstanceLoadingContext);
}
