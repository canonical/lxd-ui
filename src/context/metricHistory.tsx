import type { FC, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { LxdMetricGroup } from "types/metrics";

export interface MetricHistoryEntry {
  time: number;
  metric: LxdMetricGroup[];
}

export interface MetricHistory {
  getMetricHistory: () => MetricHistoryEntry[];
  setMetricEntry: (newEntry: MetricHistoryEntry) => void;
}

const MetricHistoryContext = createContext<MetricHistory>({
  getMetricHistory: () => [],
  setMetricEntry: () => () => {},
});

interface Props {
  children: ReactNode;
}

let history: MetricHistoryEntry[] = [];

export const MetricHistoryProvider: FC<Props> = ({ children }) => {
  return (
    <MetricHistoryContext.Provider
      value={{
        getMetricHistory: () => history,
        setMetricEntry: (newEntry: MetricHistoryEntry) => {
          history = [...history.slice(-5), newEntry];
        },
      }}
    >
      {children}
    </MetricHistoryContext.Provider>
  );
};

export function useMetricHistory() {
  return useContext(MetricHistoryContext);
}
