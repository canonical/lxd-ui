import type { FC, ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type LoadingTypes = "Evacuating" | "Restoring";

export interface MemberLoadingType {
  getType: (member: string) => LoadingTypes | undefined;
  setLoading: (member: string, loadingType: LoadingTypes) => void;
  setFinish: (member: string) => void;
}

const MemberLoadingContext = createContext<MemberLoadingType>({
  getType: () => undefined,
  setLoading: () => undefined,
  setFinish: () => undefined,
});

interface Props {
  children: ReactNode;
}

export const MemberLoadingProvider: FC<Props> = ({ children }) => {
  const [memberStates, setMemberStates] = useState(
    new Map<string, LoadingTypes>(),
  );

  const setLoading = (member: string, loadingType: LoadingTypes) => {
    setMemberStates((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.set(member, loadingType);
      return newMap;
    });
  };

  const setFinish = (member: string) => {
    setMemberStates((oldMap) => {
      const newMap = new Map(oldMap);
      newMap.delete(member);
      return newMap;
    });
  };

  return (
    <MemberLoadingContext.Provider
      value={{
        getType: (member: string) => memberStates.get(member),
        setLoading,
        setFinish,
      }}
    >
      {children}
    </MemberLoadingContext.Provider>
  );
};

export function useMemberLoading(): MemberLoadingType {
  return useContext(MemberLoadingContext);
}
