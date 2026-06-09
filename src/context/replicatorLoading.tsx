import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { useOperations } from "context/operationsProvider";
import type { LxdOperation } from "types/operation";
import type { LxdReplicator, LxdReplicatorStatus } from "types/replicator";
import { getOperationEntityUrls } from "util/operations";

interface ReplicatorLoadingType {
  getStatus: (replicator: LxdReplicator) => LxdReplicatorStatus;
  getLastRunError: (replicator: LxdReplicator) => string | undefined;
  setRunning: (replicator: LxdReplicator) => void;
  setFinish: (replicator: LxdReplicator) => void;
  setLastRunError: (replicator: LxdReplicator, error: string) => void;
  clearLastRunError: (replicator: LxdReplicator) => void;
}

interface Props {
  children: ReactNode;
}

const ReplicatorRunningContext = createContext<ReplicatorLoadingType>({
  getStatus: (replicator: LxdReplicator) => replicator.last_run_status,
  getLastRunError: () => undefined,
  setRunning: () => undefined,
  setFinish: () => undefined,
  setLastRunError: () => undefined,
  clearLastRunError: () => undefined,
});

const getReplicatorKey = ({
  name,
  project,
}: Pick<LxdReplicator, "name" | "project">) => `${project}/${name}`;

const parseReplicatorKeyFromUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url, "http://localhost");
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const replicatorIndex = pathParts.indexOf("replicators");

    if (replicatorIndex === -1 || !pathParts[replicatorIndex + 1]) {
      return null;
    }

    const name = decodeURIComponent(pathParts[replicatorIndex + 1]);
    const project = decodeURIComponent(
      parsed.searchParams.get("project") || "default",
    );

    return getReplicatorKey({ name, project });
  } catch {
    return null;
  }
};

const getOperationReplicatorKeys = (operation: LxdOperation): string[] => {
  return getOperationEntityUrls(operation, [])
    .map(parseReplicatorKeyFromUrl)
    .filter((key): key is string => Boolean(key));
};

const isRunningReplicatorOperation = (operation: LxdOperation): boolean => {
  return operation.description === "Running replicator";
};

const isFailedReplicatorOperation = (operation: LxdOperation): boolean => {
  return (
    operation.description === "Running replicator" &&
    operation.status === "Failure"
  );
};

const getOperationTimestamp = (operation: LxdOperation): number => {
  const timestamp = Date.parse(
    operation.updated_at || operation.created_at || "",
  );
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const ReplicatorRunningProvider: FC<Props> = ({ children }) => {
  const { runningOperations, operations } = useOperations();
  const [manualRunningKeys, setManualRunningKeys] = useState(new Set<string>());
  const [manualLastRunErrors, setManualLastRunErrors] = useState(
    new Map<string, string>(),
  );

  const setRunning = (replicator: LxdReplicator) => {
    const key = getReplicatorKey(replicator);
    setManualRunningKeys((prev) => {
      if (prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const setFinish = (replicator: LxdReplicator) => {
    const key = getReplicatorKey(replicator);
    setManualRunningKeys((prev) => {
      if (!prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const setLastRunError = (replicator: LxdReplicator, error: string) => {
    const key = getReplicatorKey(replicator);
    setManualLastRunErrors((prev) => {
      const next = new Map(prev);
      next.set(key, error);
      return next;
    });
  };

  const clearLastRunError = (replicator: LxdReplicator) => {
    const key = getReplicatorKey(replicator);
    setManualLastRunErrors((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const getStatus = (replicator: LxdReplicator): LxdReplicatorStatus => {
    const key = getReplicatorKey(replicator);
    const hasRunningOperation = runningOperations
      .filter(
        (operation) =>
          isRunningReplicatorOperation(operation) &&
          operation.status === "Running",
      )
      .some((operation) => getOperationReplicatorKeys(operation).includes(key));

    if (manualRunningKeys.has(key) || hasRunningOperation) {
      return "Running";
    }

    return replicator.last_run_status;
  };

  const getLastRunError = (replicator: LxdReplicator): string | undefined => {
    if (getStatus(replicator) !== "Failed") {
      return undefined;
    }

    const key = getReplicatorKey(replicator);
    let latestOperationError: string | undefined;
    let latestOperationTimestamp = -1;

    for (const operation of operations) {
      if (
        !isFailedReplicatorOperation(operation) ||
        !operation.err ||
        !getOperationReplicatorKeys(operation).includes(key)
      ) {
        continue;
      }

      const timestamp = getOperationTimestamp(operation);
      if (timestamp >= latestOperationTimestamp) {
        latestOperationTimestamp = timestamp;
        latestOperationError = operation.err;
      }
    }

    return (
      replicator.last_run_error ||
      latestOperationError ||
      manualLastRunErrors.get(key)
    );
  };

  return (
    <ReplicatorRunningContext.Provider
      value={{
        getStatus,
        getLastRunError,
        setRunning,
        setFinish,
        setLastRunError,
        clearLastRunError,
      }}
    >
      {children}
    </ReplicatorRunningContext.Provider>
  );
};

export const useReplicatorLoading = (): ReplicatorLoadingType => {
  return useContext(ReplicatorRunningContext);
};
