import type { ResourceIconType } from "components/ResourceIcon";

export const getPromiseSettledCounts = (
  results: BulkOperationResult[],
): { fulfilledCount: number; rejectedCount: number } => {
  const settledCounts = { fulfilledCount: 0, rejectedCount: 0 };
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      settledCounts.fulfilledCount++;
    } else if (result.status === "rejected") {
      settledCounts.rejectedCount++;
    }
  });
  return settledCounts;
};

interface BulkOperationFulfilled {
  status: "fulfilled";
  item: BulkOperationItem;
}

interface BulkOperationRejected {
  status: "rejected";
  item: BulkOperationItem;
  reason: string;
}

export interface BulkOperationItem {
  name: string;
  type: ResourceIconType;
  href: string;
}

export type BulkOperationResult =
  | BulkOperationFulfilled
  | BulkOperationRejected;

export const pushSuccess = (
  results: BulkOperationResult[],
  item: BulkOperationItem,
): void => {
  results.push({
    status: "fulfilled",
    item,
  });
};

export const pushFailure = (
  results: BulkOperationResult[],
  msg: string,
  item: BulkOperationItem,
): void => {
  results.push({
    status: "rejected",
    reason: msg,
    item,
  });
};

export const continueOrFinish = (
  results: BulkOperationResult[],
  totalLength: number,
  resolve: (value: BulkOperationResult[]) => void,
): void => {
  if (totalLength === results.length) {
    resolve(results);
  }
};
