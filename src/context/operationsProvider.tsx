import type { RefetchOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { fetchOperations } from "api/operations";
import type { FC, ReactNode } from "react";
import { useState } from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { LxdOperation } from "types/operation";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "context/auth";

type ProgressType = Record<string, Record<string, string>>;

interface OperationsContextType {
  operations: LxdOperation[];
  runningOperations: LxdOperation[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetchOperations: (options?: RefetchOptions) => void;
  operationProgress: ProgressType;
  updateOperationProgress: (
    id: string,
    progress?: Record<string, string>,
  ) => void;
  clearOperationProgress: (id: string) => void;
}

interface Props {
  children: ReactNode;
}

const OperationsContext = createContext<OperationsContextType>({
  operations: [],
  runningOperations: [],
  error: null,
  isLoading: false,
  isFetching: false,
  refetchOperations: () => null,
  operationProgress: {},
  updateOperationProgress: () => null,
  clearOperationProgress: () => null,
});

const OperationsProvider: FC<Props> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [operationProgress, setOperationProgress] = useState<ProgressType>({});

  const updateOperationProgress = (
    id: string,
    progress?: Record<string, string>,
  ) => {
    if (progress) {
      setOperationProgress((prevProgress) => ({
        ...prevProgress,
        [id]: progress,
      }));
    } else {
      setOperationProgress((prevProgress) =>
        Object.fromEntries(
          Object.entries(prevProgress).filter(([key]) => key !== id),
        ),
      );
    }
  };

  const clearOperationProgress = (id: string) => {
    setOperationProgress((prevProgress) =>
      Object.fromEntries(
        Object.entries(prevProgress).filter(([key]) => key !== id),
      ),
    );
  };

  const {
    data: operationList,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [queryKeys.operations],
    queryFn: async () => fetchOperations(null),
    enabled: isAuthenticated,
  });

  const refetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup the previous timeout on re-render
    return () => {
      if (refetchTimerRef.current) {
        clearTimeout(refetchTimerRef.current);
      }
    };
  }, []);

  const debouncedRefetch = (options?: RefetchOptions) => {
    if (!isAuthenticated) {
      return;
    }

    const delay = 2_000;
    if (refetchTimerRef.current) {
      clearTimeout(refetchTimerRef.current);
    }

    refetchTimerRef.current = setTimeout(() => {
      void refetch(options);
    }, delay);
  };

  const failure = operationList?.failure ?? [];
  const running = operationList?.running ?? [];
  const success = operationList?.success ?? [];
  const operations = [...failure, ...running, ...success];

  const ctx = {
    operations,
    runningOperations: running,
    error,
    isLoading,
    isFetching,
    refetchOperations: debouncedRefetch,
    operationProgress,
    updateOperationProgress,
    clearOperationProgress,
  };

  return (
    <OperationsContext.Provider value={ctx}>
      {children}
    </OperationsContext.Provider>
  );
};

export default OperationsProvider;

export const useOperations = () => {
  return useContext(OperationsContext);
};
