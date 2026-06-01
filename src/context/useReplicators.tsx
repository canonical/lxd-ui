import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useAuth } from "context/auth";
import { fetchReplicators, fetchReplicator } from "api/replicators";
import type { LxdReplicator } from "types/replicator";

const POLLING_INTERVAL = 3000;

const shouldPollReplicator = (replicator?: LxdReplicator) => {
  if (!replicator) {
    return false;
  }

  return replicator.last_run_status === "Running";
};

const mergeReplicatorClientState = (
  oldReplicator: LxdReplicator | undefined,
  newReplicator: LxdReplicator,
) => {
  if (!oldReplicator) {
    return newReplicator;
  }

  return {
    ...newReplicator,
    // Keep client-side error captured from operation events while API has no dedicated field yet.
    last_run_error:
      newReplicator.last_run_error ??
      (newReplicator.last_run_status === "Failed"
        ? oldReplicator.last_run_error
        : undefined),
  };
};

export const useReplicators = (
  project: string | null = null,
  isEnabled = true,
) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.replicators],
    queryFn: async () => fetchReplicators(project, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
  });
};

export const useReplicator = (
  name: string,
  project: string,
  isEnabled = true,
) => {
  const { isFineGrained } = useAuth();
  return useQuery({
    queryKey: [queryKeys.projects, project, queryKeys.replicators, name],
    queryFn: async () => fetchReplicator(name, project, isFineGrained),
    enabled: isEnabled && isFineGrained !== null,
    refetchInterval: (query) =>
      shouldPollReplicator(query.state.data) ? POLLING_INTERVAL : false,
    structuralSharing: (oldData, newData) =>
      mergeReplicatorClientState(
        oldData as LxdReplicator | undefined,
        newData as LxdReplicator,
      ),
  });
};
