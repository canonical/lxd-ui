import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
} from "react";
import { LxdInstance } from "types/instance";

type LoadingTypes = "Starting" | "Stopping" | "Restarting" | "Pausing";

interface InstanceLoadingType {
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
    new Map<string, LoadingTypes>()
  );

  const setLoading = (instance: LxdInstance, loadingType: LoadingTypes) => {
    const newMap = new Map(instanceStates);
    newMap.set(instance.name, loadingType);
    setInstanceStates(newMap);
  };

  const setFinish = (instance: LxdInstance) => {
    const newMap = new Map(instanceStates);
    newMap.delete(instance.name);
    setInstanceStates(newMap);
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
