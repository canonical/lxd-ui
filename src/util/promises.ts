export const getPromiseSettledCounts = (
  results: PromiseSettledResult<void>[],
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

export const pushSuccess = (results: PromiseSettledResult<void>[]): void => {
  results.push({
    status: "fulfilled",
    value: undefined,
  });
};

export const pushFailure = (
  results: PromiseSettledResult<void>[],
  msg: string,
): void => {
  results.push({
    status: "rejected",
    reason: msg,
  });
};

export const continueOrFinish = (
  results: PromiseSettledResult<void>[],
  totalLength: number,
  resolve: (value: PromiseSettledResult<void>[]) => void,
): void => {
  if (totalLength === results.length) {
    resolve(results);
  }
};
